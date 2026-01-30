'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, RefreshCw, Eye, Terminal, Download, AlertTriangle } from 'lucide-react'

type ScanResult = {
  id: string
  pin: string
  status: 'pending' | 'scanning' | 'completed' | 'failed'
  timestamp: string
  riskScore?: number
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  system?: string
}

export default function DashboardPage() {
  const [generatedPin, setGeneratedPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [scans, setScans] = useState<ScanResult[]>([])
  const [viewPin, setViewPin] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check login
    const userData = localStorage.getItem('dojchecker_user')
    if (!userData) {
      router.push('/login')
    } else {
      setUser(JSON.parse(userData))
      loadRecentScans()
      
      // Poll for new scan results
      const interval = setInterval(loadRecentScans, 5000)
      return () => clearInterval(interval)
    }
  }, [router])

  const loadRecentScans = async () => {
    try {
      const response = await fetch('/api/scans/recent')
      if (response.ok) {
        const data = await response.json()
        setScans(data.scans || [])
      }
    } catch (error) {
      console.error('Failed to load scans:', error)
    }
  }

  const generatePin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/pin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          userName: user?.name 
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setGeneratedPin(data.pin)
        
        // Add to scans list
        setScans(prev => [{
          id: `pin_${Date.now()}`,
          pin: data.pin,
          status: 'pending',
          timestamp: new Date().toISOString(),
          system: 'Waiting for scan...'
        }, ...prev])
        
        // Show notification
        showNotification(`PIN Generated: ${data.pin}`, 'success')
      }
    } catch (error) {
      showNotification('Failed to generate PIN', 'error')
    } finally {
      setLoading(false)
    }
  }

  const viewResults = () => {
    if (!viewPin || viewPin.length !== 6) {
      showNotification('Enter a valid 6-digit PIN', 'error')
      return
    }
    
    // Redirect to results page
    router.push(`/results/${viewPin}`)
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Simple alert for now
    alert(message)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showNotification('Copied to clipboard!', 'success')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'scanning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 text-red-400'
      case 'high': return 'bg-orange-500/20 text-orange-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'low': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400">Loading dashboard...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Logged in as {user.name}</span>
              </div>
              <button
                onClick={() => {
                  localStorage.clear()
                  router.push('/login')
                }}
                className="px-4 py-1.5 text-sm bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-400 bg-gray-900/50 px-4 py-3 rounded-lg border border-gray-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Running DOJChecker v4.0</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Scans', value: scans.length, color: 'from-blue-500 to-cyan-500' },
            { label: 'Active PINs', value: scans.filter(s => s.status === 'pending').length, color: 'from-purple-500 to-pink-500' },
            { label: 'Completed', value: scans.filter(s => s.status === 'completed').length, color: 'from-green-500 to-emerald-500' },
            { label: 'High Risk', value: scans.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length, color: 'from-red-500 to-orange-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: PIN Generator */}
          <div className="lg:col-span-2 space-y-8">
            {/* PIN Generator Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Generate Scan PIN</h2>
                  <p className="text-gray-400">
                    Create a unique 6-digit PIN for computer scanning
                  </p>
                </div>
                <div className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="text-sm">Session: {user.id?.slice(0, 8)}...</span>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Scan Type</label>
                    <select className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                      <option>Full System Scan</option>
                      <option>Quick Scan</option>
                      <option>Roblox Only</option>
                      <option>Registry Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expires After</label>
                    <select className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                      <option>24 Hours</option>
                      <option>12 Hours</option>
                      <option>6 Hours</option>
                      <option>1 Hour</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={generatePin}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-700 hover:opacity-90 rounded-xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Generate New PIN
                    </>
                  )}
                </button>
              </div>
              
              {generatedPin && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">✅ PIN Generated</h3>
                      <p className="text-sm text-gray-400">Give this to the person being checked</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedPin)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-center mb-4">
                      <code className="text-5xl font-mono tracking-wider bg-black/50 px-6 py-4 rounded-lg border-2 border-gray-800">
                        {generatedPin}
                      </code>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        How to use this PIN:
                      </h4>
                      <ol className="list-decimal pl-5 text-sm text-gray-400 space-y-1">
                        <li>Download DOJChecker.exe from the website</li>
                        <li>Run it as Administrator on the target PC</li>
                        <li>When asked, enter this PIN: <code className="bg-gray-900 px-2 py-1 rounded">{generatedPin}</code></li>
                        <li>Wait for the scan to complete</li>
                        <li>Results will appear here automatically</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t border-gray-800 pt-4">
                    <p>📍 This PIN expires in 24 hours</p>
                    <p>🔒 Only you can view the results</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Scans */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Recent Scans</h2>
              
              {scans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400">No scans yet</p>
                  <p className="text-sm text-gray-500 mt-2">Generate a PIN above to start scanning</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scans.map((scan) => (
                    <div key={scan.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(scan.status)}`}>
                            {scan.status.toUpperCase()}
                          </div>
                          <div className="font-mono text-lg">{scan.pin}</div>
                          {scan.riskLevel && (
                            <div className={`px-3 py-1 rounded-full text-xs ${getRiskColor(scan.riskLevel)}`}>
                              {scan.riskLevel.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">
                            {new Date(scan.timestamp).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={() => router.push(`/results/${scan.pin}`)}
                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </div>
                      {scan.system && (
                        <div className="mt-3 text-sm text-gray-400">
                          {scan.system}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions */}
          <div className="space-y-8">
            {/* View Results Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">View Results</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Enter PIN</label>
                  <input
                    type="text"
                    value={viewPin}
                    onChange={(e) => setViewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-wider"
                  />
                </div>
                
                <button
                  onClick={viewResults}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  View Scan Results
                </button>
                
                <div className="text-sm text-gray-400 pt-4 border-t border-gray-800">
                  <p className="mb-2">📋 You can view results for:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>PINs you generated</li>
                    <li>PINs shared with you</li>
                    <li>Your previous scans</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Download Scanner */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Download Scanner</h2>
              
              <div className="space-y-4">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 rounded-lg font-medium flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download DOJChecker.exe
                </button>
                
                <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Instructions:
                  </h4>
                  <ol className="list-decimal pl-5 text-sm text-gray-400 space-y-1">
                    <li>Download and extract ZIP</li>
                    <li>Right-click DOJChecker.exe</li>
                    <li>Select "Run as administrator"</li>
                    <li>Enter PIN when prompted</li>
                    <li>Wait for scan to complete</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}