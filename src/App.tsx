import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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
import ManageRegistrations from './pages/admin/ManageRegistrations'

import LiveTimer from './pages/LiveTimer'
import WinnerLeaderboard from './pages/WinnerLeaderboard'

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
    <div className="min-h-screen bg-brand-bg text-brand-text relative">
      <ScrollToTop />
      {!isAdmin && !isStageScreen && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/success" element={<Success />} />
            <Route path="/registration-success/:id" element={<Success />} />
            <Route path="/registration-success" element={<Success />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
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
      </AnimatePresence>
      {!isAdmin && !isStageScreen && <Footer />}
    </div>
  )
}
