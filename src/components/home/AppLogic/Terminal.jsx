'use client'

import { useState } from 'react'

export default function Terminal() {
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)

  async function runCommand() {
    if (!command.trim() || running) return

    setRunning(true)

    try {
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Command failed')
      }

      setOutput(data.stdout || data.output || data.stderr || '')
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setRunning(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      runCommand()
    }
  }

  return (
    <div className="bg-[#1e1e1e] w-full h-full rounded-lg p-4 text-white font-mono flex flex-col">
      
      {/* Output */}
      <div className="flex-1 overflow-auto whitespace-pre-wrap">
        {output}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-green-400">$</span>

        <input
          autoFocus
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={running}
          placeholder={running ? 'Running...' : 'Enter command...'}
          className="flex-1 bg-transparent outline-none text-white"
        />

        <button
          onClick={runCommand}
          disabled={running || !command.trim()}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 disabled:opacity-50"
        >
          {running ? 'Running...' : 'Run'}
        </button>
      </div>
    </div>
  )
}
