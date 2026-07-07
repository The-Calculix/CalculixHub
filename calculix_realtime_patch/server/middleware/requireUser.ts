import type { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error('Missing Supabase URL or anon key');
}

const supabaseAuth = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Bearer token' });
    }

    const accessToken = authHeader.slice('Bearer '.length);
    const { data, error } = await supabaseAuth.auth.getUser(accessToken);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = data.user.id;
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
