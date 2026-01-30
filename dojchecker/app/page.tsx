export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'black', 
      color: 'white', 
      padding: '20px',
      fontFamily: 'Arial'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>DOJChecker</h1>
      <p style={{ color: '#aaa', fontSize: '1.2rem' }}>
        Professional Roblox Forensic Scanner
      </p>
      
      <div style={{ marginTop: '40px', maxWidth: '800px' }}>
        <div style={{ 
          background: '#111', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #333',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Getting Started</h2>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Generate a PIN in dashboard</li>
            <li>Run DOJChecker.exe on target PC</li>
            <li>Enter the PIN when prompted</li>
            <li>View results here</li>
          </ol>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
          <a href="/dashboard" style={{
            background: 'linear-gradient(45deg, #dc2626, #7c3aed)',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'white',
            fontWeight: 'bold'
          }}>
            Go to Dashboard
          </a>
          
          <a href="/login" style={{
            background: '#333',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'white',
            fontWeight: 'bold'
          }}>
            Login
          </a>
        </div>
      </div>
    </div>
  )
}