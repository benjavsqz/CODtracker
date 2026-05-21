import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
}
function isInStandaloneMode() {
  return (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
}
function isDismissedRecently() {
  const ts = localStorage.getItem('pwa_dismissed_at')
  if (!ts) return false
  // expire after 7 days so user can be reminded
  return Date.now() - Number(ts) < 7 * 24 * 60 * 60 * 1000
}

export default function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [isIOSDevice] = useState(isIOS)

  useEffect(() => {
    if (isInStandaloneMode()) return      // already installed
    if (isDismissedRecently()) return     // dismissed within 7 days

    if (isIOS()) {
      // iOS never fires beforeinstallprompt — show native guide after delay
      const t = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(t)
    }

    // Check if the event was already captured at app boot (global stash)
    const stashed = (window as any).__pwaPromptEvent as BeforeInstallPromptEvent | undefined
    if (stashed) {
      setPrompt(stashed)
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setVisible(true), 1500)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setVisible(false)
      localStorage.setItem('pwa_dismissed_at', String(Date.now()))
    })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    setPrompt(null)
    setVisible(false)
    if (outcome === 'accepted') localStorage.setItem('pwa_dismissed_at', String(Date.now()))
  }

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa_dismissed_at', String(Date.now()))
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="fixed top-1/2 left-1/2 z-[9999] w-[min(380px,94vw)]"
          style={{ transform: 'translate(-50%, -50%)' }}>
          <div className="rounded-2xl p-4 shadow-2xl"
            style={{ border: '1px solid rgba(255,255,255,.12)', background: 'rgba(13,13,20,.97)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-black border border-white/[0.12] flex items-center justify-center shrink-0 shadow-lg">
                <img src="/favicon.svg" alt="META WZ" className="w-7 h-7 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">Instalar META WZ</p>
                <p className="text-xs text-white/40 mt-0.5 leading-tight">
                  {isIOSDevice ? 'Toca Compartir → "Agregar a inicio"' : 'Acceso rápido · funciona offline'}
                </p>
              </div>
              <button onClick={dismiss}
                className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0 text-sm">
                ✕
              </button>
            </div>

            {!isIOSDevice && (
              <div className="flex gap-2 mt-3">
                <button onClick={install}
                  className="flex-1 py-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 text-sm font-semibold hover:bg-red-600/30 transition-all flex items-center justify-center gap-2">
                  ⬇ Instalar app
                </button>
                <button onClick={dismiss}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-white/40 border border-white/[0.08] text-xs hover:text-white/70 transition-all">
                  Ahora no
                </button>
              </div>
            )}

            {isIOSDevice && (
              <div className="mt-3 flex items-center gap-2 text-xs text-white/35">
                <span>Toca</span>
                <span className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/50">⬆ Compartir</span>
                <span>→</span>
                <span className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/50">+ Agregar</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
