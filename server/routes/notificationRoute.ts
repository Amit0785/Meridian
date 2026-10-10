import { Router, Request, Response } from 'express';
import { notificationCenter } from '../notificationEvents';

const router = Router();

router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  notificationCenter.addClient(clientId, res);

  res.write(`data: ${JSON.stringify({ type: 'system', message: 'Connected to Meridian live events', time: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    notificationCenter.removeClient(clientId);
  });
});

router.get('/history', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: notificationCenter.getRecentNotifications(30),
  });
});

export default router;
