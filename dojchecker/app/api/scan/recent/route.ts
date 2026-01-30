import { NextResponse } from 'next/server'

// In-memory storage for demo
const scans = new Map()

export async function GET() {
  try {
    // Get all scans, convert to array, sort by timestamp
    const allScans = Array.from(scans.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20) // Limit to 20 most recent
    
    return NextResponse.json({
      success: true,
      scans: allScans,
      count: allScans.length
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scans' },
      { status: 500 }
    )
  }
}