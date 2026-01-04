'use client'

import { useState, useEffect, useRef } from 'react'
import { Bug, X, Trash2, Download, ChevronDown, ChevronUp, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LogEntry {
  id: number
  timestamp: Date
  type: 'log' | 'warn' | 'error' | 'info'
  message: string
  stack?: string
}

// Global log storage that persists across component mounts
let globalLogs: LogEntry[] = []
let logId = 0
let isInitialized = false

export function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>(globalLogs)
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'log'>('all')
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isInitialized) {
      // Just sync with global logs
      const interval = setInterval(() => {
        setLogs([...globalLogs])
      }, 500)
      return () => clearInterval(interval)
    }
    
    isInitialized = true
    
    // Store original console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    }

    const addLog = (type: LogEntry['type'], args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      }).join(' ')

      const entry: LogEntry = {
        id: logId++,
        timestamp: new Date(),
        type,
        message,
        stack: type === 'error' && args[0] instanceof Error ? args[0].stack : undefined
      }

      globalLogs = [...globalLogs.slice(-499), entry] // Keep last 500 logs
      setLogs([...globalLogs])
    }

    // Override console methods
    console.log = (...args) => {
      originalConsole.log(...args)
      addLog('log', args)
    }

    console.warn = (...args) => {
      originalConsole.warn(...args)
      addLog('warn', args)
    }

    console.error = (...args) => {
      originalConsole.error(...args)
      addLog('error', args)
    }

    console.info = (...args) => {
      originalConsole.info(...args)
      addLog('info', args)
    }

    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      addLog('error', [`Unhandled Error: ${event.message}`, event.error?.stack || ''])
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      addLog('error', [`Unhandled Promise Rejection: ${event.reason}`])
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    // Add initial log
    addLog('info', ['🐛 Debug Console initialized'])

    return () => {
      // Restore original console
      console.log = originalConsole.log
      console.warn = originalConsole.warn
      console.error = originalConsole.error
      console.info = originalConsole.info
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isOpen, isMinimized])

  const clearLogs = () => {
    globalLogs = []
    logId = 0
    setLogs([])
  }

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.type.toUpperCase()}] ${log.message}${log.stack ? '\n' + log.stack : ''}`
    ).join('\n\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cafe-pos-debug-${new Date().toISOString().slice(0, 10)}.log`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredLogs = logs.filter(log => filter === 'all' || log.type === filter)
  const errorCount = logs.filter(l => l.type === 'error').length
  const warnCount = logs.filter(l => l.type === 'warn').length

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
      case 'info': return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
      default: return <div className="h-4 w-4 text-gray-400 flex-shrink-0">›</div>
    }
  }

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-950/30'
      case 'warn': return 'text-yellow-400 bg-yellow-950/30'
      case 'info': return 'text-blue-400 bg-blue-950/30'
      default: return 'text-gray-300'
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 left-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg",
          errorCount > 0 
            ? "bg-red-600 hover:bg-red-700" 
            : warnCount > 0 
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-gray-700 hover:bg-gray-600"
        )}
        title="Open Debug Console"
      >
        <Bug className="h-5 w-5" />
        {(errorCount > 0 || warnCount > 0) && (
          <span className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-red-600">
            {errorCount || warnCount}
          </span>
        )}
      </Button>
    )
  }

  return (
    <div className={cn(
      "fixed left-4 z-50 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden transition-all",
      isMinimized 
        ? "bottom-4 w-80 h-12" 
        : "bottom-4 w-[600px] max-w-[calc(100vw-2rem)] h-[400px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-white">Debug Console</span>
          {errorCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-red-600 text-white">{errorCount} errors</span>
          )}
          {warnCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-600 text-white">{warnCount} warnings</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Clear logs"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadLogs}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Download logs"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Filter buttons */}
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-850 border-b border-gray-700">
            {(['all', 'error', 'warn', 'info', 'log'] as const).map(f => (
              <Button
                key={f}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  "h-6 px-2 text-xs",
                  filter === f 
                    ? "bg-gray-700 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                )}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="ml-1 text-gray-500">
                    ({logs.filter(l => l.type === f).length})
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Logs */}
          <div className="overflow-y-auto h-[calc(100%-88px)] font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No logs to display
              </div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-start gap-2 px-3 py-1.5 border-b border-gray-800 hover:bg-gray-800/50",
                    getLogColor(log.type)
                  )}
                >
                  {getIcon(log.type)}
                  <span className="text-gray-500 flex-shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <pre className="whitespace-pre-wrap break-all flex-1">
                    {log.message}
                    {log.stack && (
                      <span className="block text-gray-500 mt-1 text-[10px]">{log.stack}</span>
                    )}
                  </pre>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </>
      )}
    </div>
  )
}
