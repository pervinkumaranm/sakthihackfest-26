import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiService } from '../services/api'
import type { AppSettings } from '../types'

interface SettingsContextValue {
  registrationOpen: boolean
  accommodationOpen: boolean
  loading: boolean
  lastUpdated: string
  updatedBy?: string
  refreshSettings: () => Promise<void>
  setLocalSettings: (next: Partial<AppSettings>) => void
}

// Requirement 7: Authoritative initial state is FALSE for both until live Google Sheet is fetched
const INITIAL_SETTINGS: AppSettings = {
  registrationOpen: false,
  accommodationOpen: false,
  lastUpdated: '',
  updatedBy: '',
}

const SettingsContext = createContext<SettingsContextValue>({
  registrationOpen: false,
  accommodationOpen: false,
  loading: false,
  lastUpdated: '',
  updatedBy: '',
  refreshSettings: async () => {},
  setLocalSettings: () => {},
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const cached = localStorage.getItem('shf26_app_settings')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (typeof parsed.accommodationOpen === 'boolean' && typeof parsed.registrationOpen === 'boolean') {
          return parsed
        }
      }
    } catch (_) {}
    return INITIAL_SETTINGS
  })
  const [loading, setLoading] = useState(true)

  const fetchLiveSettings = useCallback(async () => {
    try {
      const res = await apiService.getFormSettings()
      if (res && typeof res.registrationOpen === 'boolean' && typeof res.accommodationOpen === 'boolean') {
        setSettings(res)
        try {
          localStorage.setItem('shf26_app_settings', JSON.stringify(res))
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Could not fetch live form settings from Google Sheet:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLiveSettings()

    // Listen to cross-component toggle updates (fired when Admin toggles a setting)
    const handleUpdate = (e: CustomEvent<AppSettings>) => {
      if (e.detail) {
        setSettings((prev: AppSettings) => {
          const updated = { ...prev, ...e.detail }
          try {
            localStorage.setItem('shf26_app_settings', JSON.stringify(updated))
          } catch (_) {}
          return updated
        })
      }
    }

    window.addEventListener('shf_settings_updated' as any, handleUpdate as any)
    window.addEventListener('focus', fetchLiveSettings)
    const interval = setInterval(fetchLiveSettings, 20000)

    return () => {
      window.removeEventListener('shf_settings_updated' as any, handleUpdate as any)
      window.removeEventListener('focus', fetchLiveSettings)
      clearInterval(interval)
    }
  }, [fetchLiveSettings])

  const setLocalSettings = useCallback((next: Partial<AppSettings>) => {
    setSettings((prev: AppSettings) => {
      const updated = { ...prev, ...next }
      try {
        localStorage.setItem('shf26_app_settings', JSON.stringify(updated))
      } catch (_) {}
      return updated
    })
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        registrationOpen: settings.registrationOpen,
        accommodationOpen: settings.accommodationOpen,
        loading,
        lastUpdated: settings.lastUpdated || '',
        updatedBy: settings.updatedBy || '',
        refreshSettings: fetchLiveSettings,
        setLocalSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useAppSettings() {
  return useContext(SettingsContext)
}
