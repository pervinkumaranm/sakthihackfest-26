import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiService } from '../services/api'
import type { AppSettings } from '../types'
import { IS_REGISTRATION_CLOSED } from '../../config/event'

interface SettingsContextValue {
  registrationOpen: boolean
  accommodationOpen: boolean
  loading: boolean
  lastUpdated: string
  refreshSettings: () => Promise<void>
  setLocalSettings: (next: Partial<AppSettings>) => void
}

const defaultRegistrationOpen = !IS_REGISTRATION_CLOSED

const SettingsContext = createContext<SettingsContextValue>({
  registrationOpen: defaultRegistrationOpen,
  accommodationOpen: true,
  loading: false,
  lastUpdated: '',
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
    return {
      registrationOpen: defaultRegistrationOpen,
      accommodationOpen: true,
      lastUpdated: new Date().toISOString(),
    }
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
      console.warn('Could not fetch live form settings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLiveSettings()

    // Listen to custom cross-component update events (fired when Admin toggles a setting)
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

    // Also sync on focus and periodically
    window.addEventListener('shf_settings_updated' as any, handleUpdate as any)
    window.addEventListener('focus', fetchLiveSettings)
    const interval = setInterval(fetchLiveSettings, 15000)

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
