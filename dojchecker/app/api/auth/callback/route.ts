import { NextResponse } from 'next/server'

// For Discord OAuth later, but for now just redirect
export async function GET(request: Request) {
  // Get callback parameters
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (code) {
    // In real app: Exchange code for token with Discord
    // For now: Simulate success
    const fakeUser = {
      id: 'discord_user_123',
      name: 'Discord User',
      email: 'user@discord.com',
      avatar: 'https://cdn.discordapp.com/avatars/123/abc.png'
    }
    
    // Set session
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('dojchecker_session', 'discord_token_123', {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: '/'
    })
    
    return response
  }
  
  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}