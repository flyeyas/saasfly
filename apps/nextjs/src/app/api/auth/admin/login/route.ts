import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@saasfly/db';
import { encode } from 'next-auth/jwt';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Map username to email
    const emailMap: Record<string, string> = {
      admin: 'admin@saasfly.io',
    };

    const email = emailMap[username];
    if (!email) {
      return NextResponse.json(
        { error: 'Invalid username' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'password'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check if user is admin by email
    if (user.email !== 'admin@saasfly.io') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Create NextAuth JWT token
    try {
      const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
      
      const token = {
        id: user.id,
        name: user.email.split('@')[0],
        email: user.email,
        picture: null,
        isAdmin: true,
      };

      const jwtToken = await encode({
        token,
        secret,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
      
      // Set NextAuth session cookie
      const cookieStore = cookies();
      cookieStore.set('next-auth.session-token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });

      return NextResponse.json(
        { 
          success: true, 
          message: 'Login successful',
          redirectUrl: '/admin/dashboard'
        },
        { status: 200 }
      );
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}