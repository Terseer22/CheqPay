import { useEffect, useState } from 'react'

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    setIsIos(ios)

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    const installedHandler = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstalled(true)
      }
    } else {
      // Fallback for laptop - show manual instruction
      setShowHelp(true)
    }
  }

  if (isInstalled) return null

  if (isIos) {
    return (
      <div style={{ background: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #eee', margin: '12px 16px' }}>
        <p style={{ fontWeight: 'bold', margin: 0 }}>📱 Download Cheqpay App</p>
        <p style={{ fontSize: '13px', margin: '4px 0 0' }}>Tap Share ⬆️, then tap <b>"Add to Home Screen"</b></p>
      </div>
    )
  }

  // NOW E GO ALWAYS SHOW - no more hidden
  return (
    <div style={{ background: '#0A0A0A', color: '#fff', padding: '14px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 16px' }}>
      <div>
        <p style={{ fontWeight: 'bold', margin: 0 }}>📱 Download Cheqpay App</p>
        <p style={{ fontSize: '12px', margin: 0, opacity: 0.8 }}>
          {showHelp ? 'Click ⬇️ for address bar -> Install' : 'Faster, works like PalmPay'}
        </p>
      </div>
      <button
        onClick={handleInstall}
        style={{ background: '#F59E0B', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        Install
      </button>
    </div>
  )
}