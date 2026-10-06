import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  RefreshCw,
  Flashlight,
  Search,
  AlertTriangle,
  Sparkles,
  QrCode,
} from 'lucide-react'
import jsQR from 'jsqr'

interface Props {
  onScan: (teamCode: string, teamNameFallback?: string) => void
  onManualLookup: (code: string) => void
}

export default function AttendanceScanner({ onScan, onManualLookup }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameIdRef = useRef<number | null>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [torchOn, setTorchOn] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [scanActive, setScanActive] = useState(true)

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null)
    setScanActive(true)

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.setAttribute('playsinline', 'true')
        await videoRef.current.play()
      }

      // Check if torch/flashlight is supported
      const videoTrack = mediaStream.getVideoTracks()[0]
      const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any
      if (capabilities && capabilities.torch) {
        setHasTorch(true)
      } else {
        setHasTorch(false)
      }
    } catch (err: any) {
      console.warn('Camera stream request failed:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser or enter the Team Code manually below.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera detected on this device. Please enter the Team Code manually below.')
      } else {
        setCameraError('Unable to start camera preview. Please check your browser settings or use manual lookup.')
      }
    }
  }, [facingMode])

  // Start scanning on mount or facingMode change
  useEffect(() => {
    startCamera()
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [startCamera])

  // Parse QR content
  const handleQrDecoded = useCallback((rawData: string) => {
    if (!scanActive) return
    setScanActive(false)

    // Haptic vibration feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(80)
      } catch {}
    }

    let teamCode = ''
    let teamNameFallback = ''

    // Attempt JSON parse e.g. {"id":"SHF26-XM73ED","team":"Synovate"}
    try {
      const parsed = JSON.parse(rawData)
      if (parsed && typeof parsed === 'object') {
        teamCode = parsed.id || parsed.teamCode || parsed.registrationId || ''
        teamNameFallback = parsed.team || parsed.teamName || ''
      }
    } catch {
      // Plain text or URL
      const trimmed = rawData.trim()
      // Match SHF26-XXXXXX format
      const match = trimmed.match(/SHF26-[A-Z0-9-]+/i)
      if (match) {
        teamCode = match[0].toUpperCase()
      } else {
        teamCode = trimmed
      }
    }

    if (teamCode) {
      onScan(teamCode.trim().toUpperCase(), teamNameFallback)
    } else {
      alert('Unrecognized QR code format. Please scan an official Sakthi HackFest pass.')
      setScanActive(true)
    }
  }, [scanActive, onScan])

  // Continuous Frame Analysis Loop with jsQR
  useEffect(() => {
    if (!stream || !scanActive) return

    let isScanning = true

    const scanFrame = () => {
      if (!isScanning) return

      const video = videoRef.current
      const canvas = canvasRef.current

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })

          if (code && code.data) {
            isScanning = false
            handleQrDecoded(code.data)
            return
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame)
    }

    animFrameIdRef.current = requestAnimationFrame(scanFrame)

    return () => {
      isScanning = false
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
    }
  }, [stream, scanActive, handleQrDecoded])

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!stream) return
    const track = stream.getVideoTracks()[0]
    if (!track) return

    try {
      const nextTorch = !torchOn
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      })
      setTorchOn(nextTorch)
    } catch (e) {
      console.warn('Torch constraint error:', e)
    }
  }

  // Switch Camera Facing Mode
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'))
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    onManualLookup(manualCode.trim().toUpperCase())
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Viewfinder Card */}
      <div className="w-full bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Top Camera Controls Header */}
        <div className="px-4 py-3 bg-brand-bg/80 border-b border-brand-border/50 flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-white tracking-wider">
              LIVE QR SCANNER
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                title="Toggle Flashlight"
                className={`p-2 rounded-xl border text-xs transition-colors ${
                  torchOn
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <Flashlight size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={toggleFacingMode}
              title="Flip Camera"
              className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white text-xs transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative aspect-[4/3] sm:aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                <AlertTriangle size={24} />
              </div>
              <p className="text-sm text-zinc-300 mb-4 font-sans">{cameraError}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand-primary/20 hover:opacity-95"
                >
                  <RefreshCw size={13} />
                  <span>Retry Camera</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Viewfinder Reticle Overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {/* Dark Vignette Border */}
                <div className="absolute inset-0 border-[36px] sm:border-[48px] border-black/40 backdrop-blur-[1px]" />

                {/* Target Scanning Box */}
                <div className="w-56 h-56 sm:w-64 sm:h-64 relative border-2 border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
                  {/* Neon Corner Brackets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-brand-primary rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-brand-primary rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-brand-primary rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-brand-primary rounded-br-lg" />

                  {/* Animated Laser Scanning Line */}
                  <motion.div
                    animate={{
                      y: [-100, 100],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-full h-0.5 bg-gradient-to-r from-transparent via-brand-primary to-transparent shadow-[0_0_12px_#FF3B30]"
                  />

                  {/* Center Hint Icon */}
                  <div className="absolute opacity-20 pointer-events-none">
                    <QrCode size={40} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Bottom Instructions Banner */}
              <div className="absolute bottom-3 inset-x-4 bg-black/60 backdrop-blur-md py-2 px-3 rounded-xl border border-white/10 text-center">
                <p className="text-[11px] sm:text-xs text-zinc-300 font-mono flex items-center justify-center gap-1.5">
                  <Sparkles size={12} className="text-brand-primary" />
                  <span>Align the Team Pass QR code inside the box</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Quick Manual Search Input Section */}
        <div className="p-4 bg-brand-surface/90 border-t border-brand-border/60">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="Or enter Team Code (e.g. SHF26-M7PYJZ)"
                className="w-full bg-brand-bg/90 border border-brand-border rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary font-mono uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              Lookup
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
