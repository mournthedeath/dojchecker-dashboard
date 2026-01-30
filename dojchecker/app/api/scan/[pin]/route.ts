import { NextResponse } from 'next/server'

// Mock data storage (replace with database)
const scans = new Map()

// Add some mock data for testing
scans.set('123456', {
  id: 'scan_1',
  pin: '123456',
  timestamp: new Date().toISOString(),
  status: 'completed',
  riskScore: 75,
  riskLevel: 'high',
  system: {
    hostname: 'GAMING-PC',
    os: 'Windows 11 Pro',
    processor: 'Intel Core i7-12700K',
    ram: '32 GB',
    installDate: '2023-05-15',
    wifi: 'Home-WiFi'
  },
  findings: {
    exploits: [
      { name: 'Xeno', type: 'running_process', risk: 'high' },
      { name: 'Fluxus', type: 'file', risk: 'medium' }
    ],
    processes: [
      { name: 'injector.exe', pid: 1234, risk: 'high' }
    ],
    registry: [],
    files: []
  },
  roblox: {
    installed: true,
    users: ['123456789', '987654321'],
    logs: [
      { file: 'Player.log', size: 1024 },
      { file: 'Studio.log', size: 2048 }
    ]
  },
  network: {
    vpnDetected: true,
    interfaces: [
      { name: 'Wi-Fi', ip: '192.168.1.100' },
      { name: 'Ethernet', ip: '10.0.0.5' }
    ]
  }
})

export async function GET(
  request: Request,
  { params }: { params: { pin: string } }
) {
  const pin = params.pin
  
  if (!pin || pin.length !== 6) {
    return NextResponse.json(
      { error: 'Invalid PIN format' },
      { status: 400 }
    )
  }
  
  const scan = scans.get(pin)
  
  if (!scan) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Scan not found',
        message: 'No scan results for this PIN yet. The scan may still be in progress.'
      },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    scan: scan
  })
}