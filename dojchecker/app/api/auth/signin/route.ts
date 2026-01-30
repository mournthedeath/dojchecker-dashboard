import { NextResponse } from 'next/server'

// Simple sign-in endpoint
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    // For demo: Accept any non-empty credentials
    if (username && password) {
      // Create a simple session token
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      
      // Set cookie (simplified)
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'user_' + Date.now(),
          name: username,
          email: `${username}@example.com`
        },
        token: token
      })
      
      // Set cookie
      response.cookies.set('dojchecker_session', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24, // 1 day
        path: '/'
      })
      
      return response
    } else {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 500 }
    )
  }
}