import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa_dismissed') === '1') return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      // pequeño delay para no aparecer inmediatamente al cargar
      setTimeout(() => setVisible(true), 1800)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setVisible(false)
      localStorage.setItem('pwa_dismissed', '1')
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    setPrompt(null)
    setVisible(false)
    if (outcome === 'accepted') localStorage.setItem('pwa_dismissed', '1')
  }

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa_dismissed', '1')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 z-[9999] w-[min(380px,94vw)]"
          style={{ transform: 'translateX(-50%)' }}>
          <div className="glass rounded-2xl p-4 shadow-2xl"
            style={{ border: '1px solid rgba(255,255,255,.12)', background: 'rgba(13,13,20,.95)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg">
                <img src="/favicon.svg" alt="META WZ" className="w-7 h-7 object-contain" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">Instalar META WZ</p>
                <p className="text-xs text-white/40 mt-0.5 leading-tight">Acceso rápido, funciona offline</p>
              </div>

              {/* Dismiss */}
              <button onClick={dismiss}
                className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0 text-sm">
                ✕
              </button>
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={install}
                className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 border border-green-500/40 text-sm font-semibold hover:bg-green-500/30 transition-all flex items-center justify-center gap-2">
                <span>⬇</span> Instalar app
              </button>
              <button onClick={dismiss}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-white/40 border border-white/[0.08] text-xs hover:text-white/70 transition-all">
                Ahora no
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
