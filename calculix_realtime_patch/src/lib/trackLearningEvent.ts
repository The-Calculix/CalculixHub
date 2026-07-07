import { supabase } from './supabaseClient';

type LearningEventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'practice_submitted'
  | 'ai_feedback_viewed';

type TrackLearningEventInput = {
  event_type: LearningEventType;
  subject?: string;
  skill?: string;
  lesson_id?: string;
  score?: number;
  duration_seconds?: number;
  metadata?: Record<string, unknown>;
};

export async function trackLearningEvent(input: TrackLearningEventInput) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error('User must be signed in before tracking learning data.');
  }

  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to track learning event');
  }

  return response.json();
}
