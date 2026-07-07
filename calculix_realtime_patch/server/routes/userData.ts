import { Router } from 'express';
import { requireUser } from '../middleware/requireUser';
import { supabaseAdmin } from '../supabaseAdmin';

export const userDataRouter = Router();

const allowedEventTypes = new Set([
  'lesson_started',
  'lesson_completed',
  'quiz_submitted',
  'practice_submitted',
  'ai_feedback_viewed',
]);

userDataRouter.get('/me/profile', requireUser, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id,email,full_name,role,avatar_url,created_at,updated_at')
    .eq('id', req.userId)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json({ profile: data });
});

userDataRouter.get('/me/progress', requireUser, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('user_progress')
    .select('id,user_id,subject,skill,mastery,attempts,correct,last_activity_at,updated_at')
    .eq('user_id', req.userId)
    .order('updated_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  return res.json({ progress: data ?? [] });
});

userDataRouter.get('/me/events', requireUser, async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 50), 100);

  const { data, error } = await supabaseAdmin
    .from('learning_events')
    .select('id,user_id,event_type,subject,skill,lesson_id,score,duration_seconds,metadata,created_at')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return res.status(400).json({ error: error.message });
  return res.json({ events: data ?? [] });
});

userDataRouter.post('/events', requireUser, async (req, res) => {
  const {
    event_type,
    subject = 'math',
    skill,
    lesson_id,
    score,
    duration_seconds,
    metadata = {},
  } = req.body ?? {};

  if (!allowedEventTypes.has(event_type)) {
    return res.status(400).json({ error: 'Invalid event_type' });
  }

  if (score !== undefined && score !== null && (Number(score) < 0 || Number(score) > 1)) {
    return res.status(400).json({ error: 'score must be between 0 and 1' });
  }

  const { data, error } = await supabaseAdmin.rpc('record_learning_event', {
    p_user_id: req.userId,
    p_event_type: event_type,
    p_subject: subject,
    p_skill: skill ?? null,
    p_lesson_id: lesson_id ?? null,
    p_score: score ?? null,
    p_duration_seconds: duration_seconds ?? null,
    p_metadata: metadata,
  });

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ event: data });
});
