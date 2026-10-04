import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Register from './pages/Register'
import Success from './pages/Success'
import Rules from './pages/Rules'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import AccommodationForm from './pages/AccommodationForm'
import ManageRegistrations from './pages/admin/ManageRegistrations'

import LiveTimer from './pages/LiveTimer'
import WinnerLeaderboard from './pages/WinnerLeaderboard'

import { SettingsProvider } from './context/SettingsContext'

export default function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  const isAdmin =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/manage-registrations')

  const isStageScreen =
    location.pathname === '/timer' ||
    location.pathname === '/live-timer' ||
    location.pathname === '/leaderboard' ||
    location.pathname === '/winners'

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} />

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-brand-bg text-brand-text relative">
      <ScrollToTop />
      {!isAdmin && !isStageScreen && <Navbar />}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/success" element={<Success />} />
            <Route path="/registration-success/:id" element={<Success />} />
            <Route path="/registration-success" element={<Success />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/accommodation-form" element={<AccommodationForm />} />
            <Route path="/accommodation" element={<Navigate to="/accommodation-form" replace />} />
            {/* Live Synchronized Stage Timer */}
            <Route path="/live-timer" element={<LiveTimer />} />
            <Route path="/timer" element={<LiveTimer />} />
            {/* Live Grand Finale Winner Reveal Screen */}
            <Route path="/leaderboard" element={<WinnerLeaderboard />} />
            <Route path="/winners" element={<WinnerLeaderboard />} />
            {/* Private Admin Route */}
            <Route path="/manage-registrations" element={<ManageRegistrations />} />
            <Route path="/admin" element={<Navigate to="/manage-registrations" replace />} />
            <Route path="/admin/login" element={<Navigate to="/manage-registrations" replace />} />
          </Routes>
        </motion.div>
      {!isAdmin && !isStageScreen && <Footer />}
      </div>
    </SettingsProvider>
  )
}
