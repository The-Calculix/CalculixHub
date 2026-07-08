import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type LearningEventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'practice_submitted'
  | 'ai_feedback_viewed';

type LearningEventInput = {
  userId?: string | null;
  eventType: LearningEventType;
  subject?: string | null;
  skill?: string | null;
  lessonId?: string | null;
  score?: number | null;
  durationSeconds?: number | null;
  metadata?: Record<string, unknown> | null;
};

type LearningEventRecord = {
  id: string;
  user_id: string;
  event_type: string;
  subject: string;
  skill: string | null;
  lesson_id: string | null;
  score: number | null;
  duration_seconds: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type UserProgressRecord = {
  id: string;
  user_id: string;
  subject: string;
  skill: string;
  mastery: number;
  attempts: number;
  correct: number;
  last_activity_at: string | null;
  updated_at: string;
};

type LocalStore = {
  profiles: Array<{ id: string; display_name: string; created_at: string }>;
  learning_events: LearningEventRecord[];
  user_progress: UserProgressRecord[];
};

export type DatabaseStatus = {
  mode: 'supabase' | 'local-file';
  storagePath: string;
  records: {
    events: number;
    progress: number;
  };
};

function normalizeUserId(userId?: string | null) {
  const cleaned = (userId ?? 'guest').trim();
  return cleaned || 'guest';
}

function normalizeSubject(subject?: string | null) {
  const cleaned = (subject ?? 'math').trim();
  return cleaned || 'math';
}

function normalizeSkill(skill?: string | null) {
  const cleaned = (skill ?? '').trim();
  return cleaned || null;
}

function roundMastery(value: number) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(3));
}

export function buildProgressSnapshot(existing: UserProgressRecord | null, score: number | null, subject: string, skill: string) {
  const attempts = (existing?.attempts ?? 0) + 1;
  const correct = (existing?.correct ?? 0) + (score !== null && score !== undefined && score >= 0.8 ? 1 : 0);
  const mastery = roundMastery(((existing?.mastery ?? 0) * (existing?.attempts ?? 0) + (score ?? 0)) / attempts);

  return {
    attempts,
    correct,
    mastery,
    lastActivityAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subject,
    skill,
  };
}

export function createDatabaseStore() {
  return new DatabaseStore();
}

class DatabaseStore {
  private supabase: SupabaseClient | null = null;
  private readonly storagePath: string;
  private readonly mode: 'supabase' | 'local-file';

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.storagePath = path.resolve(process.cwd(), 'data', 'app-data.json');

    if (supabaseUrl && serviceRoleKey) {
      this.supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      this.mode = 'supabase';
    } else {
      this.mode = 'local-file';
    }
  }

  async getStatus(): Promise<DatabaseStatus> {
    const store = await this.readLocalStore();
    return {
      mode: this.mode,
      storagePath: this.storagePath,
      records: {
        events: store.learning_events.length,
        progress: store.user_progress.length,
      },
    };
  }

  async recordLearningEvent(input: LearningEventInput) {
    const userId = normalizeUserId(input.userId);
    const subject = normalizeSubject(input.subject);
    const skill = normalizeSkill(input.skill);
    const score = input.score ?? null;

    if (this.supabase) {
      try {
        const { data: eventData, error: eventError } = await this.supabase
          .from('learning_events')
          .insert({
            user_id: userId,
            event_type: input.eventType,
            subject,
            skill,
            lesson_id: input.lessonId ?? null,
            score,
            duration_seconds: input.durationSeconds ?? null,
            metadata: input.metadata ?? {},
          })
          .select()
          .single();

        if (eventError || !eventData) {
          throw eventError ?? new Error('Failed to create learning event');
        }

        if (skill) {
          const { data: existingProgress, error: progressError } = await this.supabase
            .from('user_progress')
            .select('id,attempts,correct,mastery')
            .eq('user_id', userId)
            .eq('subject', subject)
            .eq('skill', skill)
            .maybeSingle();

          if (!progressError) {
            const snapshot = buildProgressSnapshot(existingProgress as UserProgressRecord | null, score, subject, skill);
            const values = {
              user_id: userId,
              subject,
              skill,
              mastery: snapshot.mastery,
              attempts: snapshot.attempts,
              correct: snapshot.correct,
              last_activity_at: snapshot.lastActivityAt,
              updated_at: snapshot.updatedAt,
            };

            if (existingProgress?.id) {
              await this.supabase.from('user_progress').update(values).eq('id', existingProgress.id);
            } else {
              await this.supabase.from('user_progress').insert(values);
            }
          }
        }

        return eventData;
      } catch (error) {
        console.warn('[DatabaseStore] Supabase write failed, falling back to local file store:', error);
      }
    }

    return this.persistToLocalStore({
      userId,
      eventType: input.eventType,
      subject,
      skill,
      lessonId: input.lessonId ?? null,
      score,
      durationSeconds: input.durationSeconds ?? null,
      metadata: input.metadata ?? {},
    });
  }

  async getProgress(userId?: string | null) {
    const targetUser = normalizeUserId(userId);

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('user_progress')
          .select('id,user_id,subject,skill,mastery,attempts,correct,last_activity_at,updated_at')
          .eq('user_id', targetUser)
          .order('updated_at', { ascending: false });

        if (!error) {
          return data ?? [];
        }
      } catch (error) {
        console.warn('[DatabaseStore] Supabase read failed, falling back to local file store:', error);
      }
    }

    const store = await this.readLocalStore();
    return store.user_progress.filter((row) => row.user_id === targetUser);
  }

  async getEvents(userId?: string | null, limit = 50) {
    const targetUser = normalizeUserId(userId);

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('learning_events')
          .select('id,user_id,event_type,subject,skill,lesson_id,score,duration_seconds,metadata,created_at')
          .eq('user_id', targetUser)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error) {
          return data ?? [];
        }
      } catch (error) {
        console.warn('[DatabaseStore] Supabase event read failed, falling back to local file store:', error);
      }
    }

    const store = await this.readLocalStore();
    return store.learning_events.filter((row) => row.user_id === targetUser).slice(0, limit);
  }

  private async persistToLocalStore(input: LearningEventInput & { userId: string }) {
    const store = await this.readLocalStore();
    const eventRecord: LearningEventRecord = {
      id: randomUUID(),
      user_id: input.userId,
      event_type: input.eventType,
      subject: normalizeSubject(input.subject),
      skill: normalizeSkill(input.skill),
      lesson_id: input.lessonId ?? null,
      score: input.score ?? null,
      duration_seconds: input.durationSeconds ?? null,
      metadata: input.metadata ?? {},
      created_at: new Date().toISOString(),
    };

    const existingProfile = store.profiles.find((row) => row.id === input.userId);
    if (!existingProfile) {
      store.profiles.push({
        id: input.userId,
        display_name: input.userId === 'guest' ? 'Guest learner' : input.userId,
        created_at: new Date().toISOString(),
      });
    }

    store.learning_events.unshift(eventRecord);

    if (eventRecord.skill) {
      const subject = normalizeSubject(input.subject);
      const skill = eventRecord.skill;
      const existing = store.user_progress.find((row) => row.user_id === input.userId && row.subject === subject && row.skill === skill);
      const snapshot = buildProgressSnapshot(existing ?? null, eventRecord.score, subject, skill);

      if (existing) {
        existing.mastery = snapshot.mastery;
        existing.attempts = snapshot.attempts;
        existing.correct = snapshot.correct;
        existing.last_activity_at = snapshot.lastActivityAt;
        existing.updated_at = snapshot.updatedAt;
      } else {
        store.user_progress.push({
          id: randomUUID(),
          user_id: input.userId,
          subject,
          skill,
          mastery: snapshot.mastery,
          attempts: snapshot.attempts,
          correct: snapshot.correct,
          last_activity_at: snapshot.lastActivityAt,
          updated_at: snapshot.updatedAt,
        });
      }
    }

    await this.writeLocalStore(store);
    return eventRecord;
  }

  private async readLocalStore(): Promise<LocalStore> {
    await fs.mkdir(path.dirname(this.storagePath), { recursive: true });
    try {
      const raw = await fs.readFile(this.storagePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<LocalStore>;
      return {
        profiles: parsed.profiles ?? [],
        learning_events: parsed.learning_events ?? [],
        user_progress: parsed.user_progress ?? [],
      };
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        const fallback: LocalStore = { profiles: [], learning_events: [], user_progress: [] };
        await this.writeLocalStore(fallback);
        return fallback;
      }
      throw error;
    }
  }

  private async writeLocalStore(store: LocalStore) {
    await fs.mkdir(path.dirname(this.storagePath), { recursive: true });
    await fs.writeFile(this.storagePath, JSON.stringify(store, null, 2), 'utf8');
  }
}
