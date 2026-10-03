import { NextRequest, NextResponse } from 'next/server';
import {
  registerUser,
  authenticateUser,
  getUserByToken,
  invalidateSession,
  syncUserProgress,
} from '@/lib/auth';

function getTokenFromRequest(req: NextRequest): string {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookie = req.cookies.get('lingua_token');
  return cookie?.value || '';
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = getUserByToken(token);
    return NextResponse.json({ user });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auth verification error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Register
    if (action === 'register') {
      const { name, email, password, initialStats, initialVocab, initialSettings } = body;
      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Name, email, and password are required.' },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const { user, token } = registerUser({
        name,
        email,
        password,
        initialStats,
        initialVocab,
        initialSettings,
      });

      const response = NextResponse.json({ user, token });
      response.cookies.set('lingua_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    // Action 2: Login
    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required.' },
          { status: 400 }
        );
      }

      const { user, token } = authenticateUser(email, password);
      const response = NextResponse.json({ user, token });
      response.cookies.set('lingua_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    // Action 3: Logout
    if (action === 'logout') {
      const token = getTokenFromRequest(req);
      if (token) {
        invalidateSession(token);
      }
      const response = NextResponse.json({ success: true });
      response.cookies.delete('lingua_token');
      return response;
    }

    // Action 4: Sync Progress
    if (action === 'sync') {
      const token = getTokenFromRequest(req);
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { stats, vocabulary, settings } = body;
      const success = syncUserProgress(token, { stats, vocabulary, settings });
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication operation error' },
      { status: 400 }
    );
  }
}
