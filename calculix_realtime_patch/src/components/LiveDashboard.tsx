import { useMemo } from 'react';
import { useRealtimeProgress } from '../hooks/useRealtimeProgress';
import '../styles/calculix-ui.css';

type LiveDashboardProps = {
  userId?: string;
};

export function LiveDashboard({ userId }: LiveDashboardProps) {
  const { progress, loading, error } = useRealtimeProgress(userId);

  const averageMastery = useMemo(() => {
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, row) => sum + Number(row.mastery ?? 0), 0);
    return Math.round((total / progress.length) * 100);
  }, [progress]);

  if (!userId) {
    return (
      <section className="calculix-panel empty-state">
        <p className="eyebrow">Realtime Learning Data</p>
        <h2>Sign in to start collecting real user data.</h2>
        <p>No demo data is displayed here. The dashboard updates after real learning activity is saved.</p>
      </section>
    );
  }

  if (loading) return <section className="calculix-panel">Loading your live dashboard...</section>;
  if (error) return <section className="calculix-panel error-state">{error}</section>;

  return (
    <section className="live-dashboard">
      <div className="hero-card">
        <p className="eyebrow">CalculixHub Live</p>
        <h1>Realtime Math Progress</h1>
        <p>The dashboard updates when the authenticated user completes real lessons, quizzes, or practice tasks.</p>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Average mastery</span>
          <strong>{averageMastery}%</strong>
        </article>
        <article className="metric-card">
          <span>Tracked skills</span>
          <strong>{progress.length}</strong>
        </article>
        <article className="metric-card">
          <span>Total attempts</span>
          <strong>{progress.reduce((sum, row) => sum + row.attempts, 0)}</strong>
        </article>
      </div>

      {progress.length === 0 ? (
        <div className="calculix-panel empty-state">
          <h2>No learning data yet</h2>
          <p>Complete a real activity and call trackLearningEvent(). This area will update automatically.</p>
        </div>
      ) : (
        <div className="skill-list">
          {progress.map((row) => (
            <article className="skill-card" key={row.id}>
              <div>
                <h3>{row.skill}</h3>
                <p>{row.subject} · {row.attempts} attempts · {row.correct} correct</p>
              </div>
              <div className="mastery-pill">{Math.round(row.mastery * 100)}%</div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
