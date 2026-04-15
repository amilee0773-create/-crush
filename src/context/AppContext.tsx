import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AnalysisData } from '../types'

interface AppContextType {
  analysisData: AnalysisData | null
  setAnalysisData: (data: AnalysisData | null) => void
  report: string
  setReport: (report: string) => void
  appendReport: (chunk: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [report, setReport] = useState('')

  const appendReport = (chunk: string) => {
    setReport(prev => prev + chunk)
  }

  return (
    <AppContext.Provider value={{ analysisData, setAnalysisData, report, setReport, appendReport }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
