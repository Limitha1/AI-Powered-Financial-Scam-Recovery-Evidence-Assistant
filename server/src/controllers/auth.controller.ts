import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db.js';
import { supabaseAdmin, hasSupabaseConfig } from '../lib/supabaseAdmin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'shieldtrace-secure-jwt-secret-key-2026';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, full_name, phone_number } = req.body;

    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Email, password, and full name are required.' });
      return;
    }

    let userId: string;

    if (hasSupabaseConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: { data: { full_name, phone_number } }
      });
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      userId = data.user?.id || 'usr-' + Date.now();
    } else {
      userId = 'usr-' + Buffer.from(email).toString('hex').slice(0, 16);
    }

    const profile = await db.upsertProfile({
      id: userId,
      full_name,
      phone_number
    });

    const token = jwt.sign({ id: userId, email, full_name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        email,
        full_name: profile.full_name,
        phone_number: profile.phone_number
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during registration', details: String(err) });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    // Demo user bypass for instant testing
    if (email === 'demo@shieldtrace.ai' || email === 'rahul@example.com') {
      const profile = await db.getProfile('demo-user-123');
      const token = jwt.sign(
        { id: 'demo-user-123', email, full_name: profile?.full_name || 'Rahul Sharma' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.json({
        token,
        user: {
          id: 'demo-user-123',
          email,
          full_name: profile?.full_name || 'Rahul Sharma',
          phone_number: profile?.phone_number || '+91-9876543210'
        }
      });
      return;
    }

    if (hasSupabaseConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        res.status(401).json({ error: error.message });
        return;
      }

      const profile = await db.getProfile(data.user.id);
      const token = data.session?.access_token || jwt.sign(
        { id: data.user.id, email, full_name: profile?.full_name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: data.user.id,
          email,
          full_name: profile?.full_name || 'Registered Victim',
          phone_number: profile?.phone_number
        }
      });
      return;
    }

    // Local authentication fallback
    const userId = 'usr-' + Buffer.from(email).toString('hex').slice(0, 16);
    let profile = await db.getProfile(userId);
    if (!profile) {
      profile = await db.upsertProfile({
        id: userId,
        full_name: email.split('@')[0],
        phone_number: '+91-9876543210'
      });
    }

    const token = jwt.sign({ id: userId, email, full_name: profile.full_name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: userId,
        email,
        full_name: profile.full_name,
        phone_number: profile.phone_number
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during login', details: String(err) });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const profile = await db.getProfile(req.user.id);
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        full_name: profile?.full_name || req.user.full_name,
        phone_number: profile?.phone_number || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current user', details: String(err) });
  }
}
