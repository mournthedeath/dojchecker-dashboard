export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to DOJChecker</h1>
      <p className="text-gray-400 mb-6">
        Professional Roblox forensic analysis tool
      </p>
      <div className="grid gap-4">
        <div className="border border-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p>1. Sign in with Discord</p>
          <p>2. Generate a scan PIN</p>
          <p>3. Run the scanner on target PC</p>
          <p>4. View results here</p>
        </div>
      </div>
    </div>
  )
}