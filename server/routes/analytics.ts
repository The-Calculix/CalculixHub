import { Router } from 'express';
import { createDatabaseStore } from '../databaseStore';

export const analyticsRouter = Router();
const databaseStore = createDatabaseStore();

analyticsRouter.get('/health', async (_req, res) => {
  const status = await databaseStore.getStatus();
  res.json(status);
});

analyticsRouter.post('/events', async (req, res) => {
  try {
    const event = await databaseStore.recordLearningEvent({
      userId: req.body?.userId,
      eventType: req.body?.eventType,
      subject: req.body?.subject,
      skill: req.body?.skill,
      lessonId: req.body?.lessonId,
      score: req.body?.score,
      durationSeconds: req.body?.durationSeconds,
      metadata: req.body?.metadata,
    });

    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to persist learning event' });
  }
});

analyticsRouter.get('/progress/:userId', async (req, res) => {
  try {
    const progress = await databaseStore.getProgress(req.params.userId);
    res.json({ progress });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to read progress' });
  }
});

analyticsRouter.get('/events/:userId', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 50), 100);
    const events = await databaseStore.getEvents(req.params.userId, limit);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to read learning events' });
  }
});
