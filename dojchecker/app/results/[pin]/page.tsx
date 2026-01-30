'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  Database, 
  FileText, 
  HardDrive, 
  Network, 
  Shield,
  Terminal,
  User,
  Wifi,
  XCircle,
  RefreshCw,
  Download,
  Copy
} from 'lucide-react'

type ScanData = {
  id: string
  pin: string
  timestamp: string
  status: 'completed' | 'scanning' | 'failed'
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  system: {
    hostname: string
    os: string
    processor: string
    ram: string
    installDate: string
    wifi: string
  }
  findings: {
    exploits: Array<{ name: string, type: string, risk: string }>
    processes: Array<{ name: string, pid: number, risk: string }>
    registry: Array<{ path: string, type: string }>
    files: Array<{ path: string, name: string }>
  }
  roblox: {
    installed: boolean
    users: string[]
    logs: Array<{ file: string, size: number }>
  }
  network: {
    vpnDetected: boolean
    interfaces: Array<{ name: string, ip: string }>
  }
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const pin = params.pin as string
  const [scan, setScan] = useState<ScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!pin || pin.length !== 6) {
      router.push('/dashboard')
      return
    }
    
    fetchScanData()
    
    // Poll for updates if still scanning
    const interval = setInterval(fetchScanData, 3000)
    return () => clearInterval(interval)
  }, [pin, router])

  const fetchScanData = async () => {
    try {
      const response = await fetch(`/api/scan/${pin}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setScan(data.scan)
        }
      }
    } catch (error) {
      console.error('Failed to fetch scan:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const exportResults = () => {
    if (!scan) return
    
    const dataStr = JSON.stringify(scan, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `dojchecker_scan_${pin}_${Date.now()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p>Loading scan results for PIN: {pin}</p>
          <p className="text-sm text-gray-400 mt-2">This may take a moment...</p>
        </div>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Scan Not Found</h1>
          <p className="text-gray-400 mb-6">No scan results found for PIN: {pin}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-sm"
              >
                ← Back
              </button>
              <div className="text-2xl font-mono bg-gray-900 px-4 py-2 rounded-lg">
                {pin}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm border ${getRiskColor(scan.riskLevel)}`}>
                {scan.riskLevel.toUpperCase()}
              </div>
            </div>
            <p className="text-gray-400">
              Scan from {new Date(scan.timestamp).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportResults}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Risk Assessment</h2>
              <p className="text-gray-400">Overall system security score</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{scan.riskScore}/100</div>
              <div className={`px-3 py-1 rounded-full text-sm inline-block mt-2 ${getRiskColor(scan.riskLevel)}`}>
                {scan.riskLevel.toUpperCase()} RISK
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-900 h-4 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                scan.riskLevel === 'critical' ? 'bg-red-500' :
                scan.riskLevel === 'high' ? 'bg-orange-500' :
                scan.riskLevel === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${scan.riskScore}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'system', label: 'System', icon: Cpu },
            { id: 'exploits', label: 'Exploits', icon: AlertTriangle },
            { id: 'roblox', label: 'Roblox', icon: Terminal },
            { id: 'network', label: 'Network', icon: Network },
            { id: 'files', label: 'Files', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-red-500 text-white' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    System Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Computer Name</div>
                      <div className="font-medium">{scan.system.hostname}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Operating System</div>
                      <div className="font-medium">{scan.system.os}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Processor</div>
                      <div className="font-medium">{scan.system.processor}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">RAM</div>
                      <div className="font-medium">{scan.system.ram}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Windows Installed</div>
                      <div className="font-medium">{scan.system.installDate}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Wi-Fi Network</div>
                      <div className="font-medium">{scan.system.wifi}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Threats Found
                  </h3>
                  <div className="space-y-4">
                    {scan.findings.exploits.map((exploit, idx) => (
                      <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{exploit.name}</div>
                            <div className="text-sm text-gray-400">{exploit.type}</div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs ${getRiskColor(exploit.risk)}`}>
                            {exploit.risk.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6">Detailed System Analysis</h3>
                {/* Add detailed system info */}
              </div>
            )}

            {activeTab === 'exploits' && (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6">Detected Exploits</h3>
                {/* Add exploits details */}
              </div>
            )}

            {activeTab === 'roblox' && (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6">Roblox Analysis</h3>
                {/* Add Roblox details */}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Scan Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="font-medium">{scan.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scan Time</span>
                  <span className="font-medium">
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Exploits Found</span>
                  <span className="font-medium">{scan.findings.exploits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Suspicious Processes</span>
                  <span className="font-medium">{scan.findings.processes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">VPN Detected</span>
                  <span className="font-medium">
                    {scan.network.vpnDetected ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Recommendations</h3>
              <div className="space-y-3">
                {scan.riskLevel === 'critical' && (
                  <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
                    ⚠ Immediate action required. System compromised.
                  </div>
                )}
                {scan.findings.exploits.length > 0 && (
                  <div className="text-sm text-amber-400 bg-amber-500/10 p-3 rounded-lg">
                    Remove detected cheats and run antivirus scan.
                  </div>
                )}
                {scan.network.vpnDetected && (
                  <div className="text-sm text-blue-400 bg-blue-500/10 p-3 rounded-lg">
                    VPN usage detected. Verify legitimate use.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}