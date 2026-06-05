import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Just return success - let client handle redirect
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    // Clear cookies
    response.cookies.set('auth_token', '', {
      maxAge: 0,
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    });
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' }, 
      { status: 500 }
    );
  }
}
