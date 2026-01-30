import { NextResponse } from 'next/server'

export async function POST() {
  // Clear session cookie
  const response = NextResponse.json({
    success: true,
    message: 'Signed out successfully'
  })
  
  response.cookies.delete('dojchecker_session')
  
  return response
}