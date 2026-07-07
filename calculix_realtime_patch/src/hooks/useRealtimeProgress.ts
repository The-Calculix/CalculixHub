import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type UserProgress = {
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

function upsertById(rows: UserProgress[], next: UserProgress) {
  const exists = rows.some((row) => row.id === next.id);
  if (!exists) return [next, ...rows];
  return rows.map((row) => (row.id === next.id ? next : row));
}

export function useRealtimeProgress(userId?: string) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProgress([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadInitialProgress() {
      try {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;

        if (!accessToken) throw new Error('Missing session');

        const response = await fetch('/api/me/progress', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Failed to load progress');

        const payload = await response.json();
        if (!cancelled) setProgress(payload.progress ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitialProgress();

    const channel = supabase
      .channel(`user-progress:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const next = payload.new as UserProgress;
          if (next?.id) setProgress((rows) => upsertById(rows, next));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { progress, loading, error };
}
