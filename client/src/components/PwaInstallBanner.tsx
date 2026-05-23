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
  return Date.now() - Number(ts) < 24 * 60 * 60 * 1000
}

export default function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [isIOSDevice] = useState(isIOS)

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (isDismissedRecently()) return

    if (isIOS()) {
      const t = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(t)
    }

    // Check if the event was already captured at app boot
    const stashed = (window as any).__pwaPromptEvent as BeforeInstallPromptEvent | undefined
    if (stashed) {
      setPrompt(stashed)
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      clearTimeout(fallback)
      setPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setVisible(true), 1500)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setVisible(false)
      localStorage.setItem('pwa_dismissed_at', String(Date.now()))
    })

    // Fallback: show banner even if beforeinstallprompt never fires
    // (Chrome doesn't fire it in incognito or on first visit)
    const fallback = setTimeout(() => setVisible(true), 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(fallback)
    }
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    setPrompt(null)
    if (outcome === 'accepted') {
      setVisible(false)
      localStorage.setItem('pwa_dismissed_at', String(Date.now()))
    }
  }

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa_dismissed_at', String(Date.now()))
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-20 sm:bottom-6 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full max-w-sm pointer-events-auto">
          <div className="rounded-2xl p-4 shadow-2xl"
            style={{ border: '1px solid rgba(255,255,255,.12)', background: 'rgba(13,13,20,.97)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-3">
              <img src="/icon-192.png" alt="META WZ"
                className="w-11 h-11 rounded-xl shrink-0 shadow-lg object-cover"
                style={{ border: '1px solid rgba(255,255,255,.12)' }} />
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

            {/* Android con evento de instalación disponible */}
            {!isIOSDevice && prompt && (
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

            {/* Android sin evento — instrucciones manuales */}
            {!isIOSDevice && !prompt && (
              <div className="mt-3 flex items-center gap-2 text-xs text-white/40 flex-wrap">
                <span>Toca</span>
                <span className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/55">⋮ Menú</span>
                <span>→</span>
                <span className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/55">Instalar aplicación</span>
              </div>
            )}

            {/* iOS */}
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
        </div>
      )}
    </AnimatePresence>
  )
}
