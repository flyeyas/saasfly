import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear NextAuth session cookie
    const cookieStore = cookies();
    
    // Clear all possible NextAuth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url'
    ];
    
    cookiesToClear.forEach(cookieName => {
      cookieStore.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Logout successful',
        redirectUrl: '/admin/login'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Redirect GET requests to POST for logout
  return POST(request);
}