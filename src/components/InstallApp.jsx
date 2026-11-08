import { useState, useEffect } from 'react'

export default function InstallApp() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
    setIsIos(/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()))
  }, [])

  if (isInstalled) return null

  return (
    <>
      <div style={{ background: '#0A0A0A', color: '#fff', padding: '14px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 16px' }}>
        <div>
          <p style={{ fontWeight: 'bold', margin: 0 }}>📱 Download Cheqpay App</p>
          <p style={{ fontSize: '12px', margin: 0, opacity: 0.8 }}>Faster, works like PalmPay</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#F59E0B', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Install
        </button>
      </div>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#000', width: '100%', maxWidth: '420px', padding: '20px', borderRadius: '20px 20px 0 0' }}>
            <h3 style={{ margin: '0 0 12px' }}>How to Install Cheqpay</h3>
            {isIos ? (
              <ol style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '18px' }}>
                <li>Tap <b>Share ⬆️</b> for bottom of Safari</li>
                <li>Scroll down, tap <b>Add to Home Screen</b></li>
                <li>Tap <b>Add</b> for top right</li>
              </ol>
            ) : (
              <ol style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '18px' }}>
                <li>Tap <b>⋮</b> (3 dots) for top right of Chrome</li>
                <li>Tap <b>Install app</b> / <b>Add to Home screen</b></li>
                <li>Tap <b>Install</b></li>
              </ol>
            )}
            <p style={{ fontSize: '12px', color: '#666' }}>If you no see Install, look for small Install icon ⬇️ for address bar.</p>
            <button onClick={() => setShowModal(false)} style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', marginTop: '10px' }}>Got it</button>
          </div>
        </div>
      )}
    </>
  )
}