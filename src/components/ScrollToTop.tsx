import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Disable browser's default scroll restoration to avoid sticking to old positions
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    if (!hash) {
      // Immediate scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0

      // Re-assert in next tick to handle any Framer Motion exit/enter animation transitions
      const frameId = requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' as ScrollBehavior,
        })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      })

      return () => cancelAnimationFrame(frameId)
    }
  }, [pathname, hash])

  return null
}
