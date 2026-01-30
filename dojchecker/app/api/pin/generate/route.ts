import { NextResponse } from 'next/server'

// Store PINs in memory (in real app, use database)
const pins = new Map()

export async function GET() {
  // Generate random 6-digit PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  
  // Store PIN
  pins.set(pin, {
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt,
    scanData: null,
    used: false
  })
  
  console.log(`Generated PIN: ${pin}`)
  console.log(`Active PINs: ${pins.size}`)
  
  return NextResponse.json({
    success: true,
    pin: pin,
    expires: new Date(expiresAt).toISOString(),
    message: 'PIN generated successfully. Give this to the person being checked.'
  })
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }
    
    // Generate PIN with user association
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000)
    
    pins.set(pin, {
      userId: userId,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt,
      scanData: null,
      used: false
    })
    
    return NextResponse.json({
      success: true,
      pin: pin,
      userId: userId,
      expires: new Date(expiresAt).toISOString(),
      url: `/results/${pin}` // URL to view results
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate PIN' },
      { status: 500 }
    )
  }
}

// Optional: Add endpoint to check PIN status
export async function PUT(request: Request) {
  const { pin } = await request.json()
  
  if (!pin) {
    return NextResponse.json(
      { error: 'PIN required' },
      { status: 400 }
    )
  }
  
  const pinData = pins.get(pin)
  
  if (!pinData) {
    return NextResponse.json({
      exists: false,
      message: 'PIN not found'
    })
  }
  
  if (Date.now() > pinData.expiresAt) {
    return NextResponse.json({
      exists: true,
      valid: false,
      message: 'PIN expired'
    })
  }
  
  return NextResponse.json({
    exists: true,
    valid: true,
    created: pinData.createdAt,
    hasResults: !!pinData.scanData,
    used: pinData.used
  })
}