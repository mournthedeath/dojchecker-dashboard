import { NextResponse } from 'next/server'

// In-memory storage (replace with database later)
const scans = new Map()
const pins = new Map() // Same as in generate/route.ts

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      )
    }
    
    if (!data.results) {
      return NextResponse.json(
        { error: 'Scan results are required' },
        { status: 400 }
      )
    }
    
    const pin = data.pin.toString()
    
    // Check if PIN exists (in real app, check database)
    // For now, accept any 6-digit PIN
    
    // Generate scan ID
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate risk score
    const riskScore = calculateRiskScore(data.results)
    const riskLevel = getRiskLevel(riskScore)
    
    // Store scan
    scans.set(scanId, {
      pin: pin,
      results: data.results,
      riskScore: riskScore,
      riskLevel: riskLevel,
      timestamp: new Date().toISOString(),
      systemInfo: data.results.system || {},
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })
    
    // Mark PIN as used
    if (pins.has(pin)) {
      pins.set(pin, {
        ...pins.get(pin),
        used: true,
        scanId: scanId,
        scanTimestamp: new Date().toISOString()
      })
    }
    
    console.log(`Scan uploaded: ${scanId}`)
    console.log(`Risk: ${riskLevel} (${riskScore}/100)`)
    
    return NextResponse.json({
      success: true,
      scanId: scanId,
      pin: pin,
      riskScore: riskScore,
      riskLevel: riskLevel,
      timestamp: new Date().toISOString(),
      message: 'Scan results saved successfully',
      viewUrl: `/results/${pin}`
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload scan results' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateRiskScore(results: any): number {
  let score = 0
  
  // Check for exploits
  if (results.exploits && results.exploits.length > 0) {
    score += results.exploits.length * 15
  }
  
  // Check for suspicious processes
  if (results.processes && results.processes.suspiciousCount > 0) {
    score += results.processes.suspiciousCount * 10
  }
  
  // Check for VPN usage
  if (results.network && results.network.vpnDetected) {
    score += 25
  }
  
  // Check for registry modifications
  if (results.registry && results.registry.modifiedCount > 0) {
    score += results.registry.modifiedCount * 5
  }
  
  // Cap at 100
  return Math.min(100, score)
}

function getRiskLevel(score: number): string {
  if (score >= 70) return 'critical'
  if (score >= 40) return 'high'
  if (score >= 20) return 'medium'
  return 'low'
}