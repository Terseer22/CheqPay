export default function SuccessAlert({ show, onClose, type="success", title, message, amount, details }) {
  if (!show) return null;
  const isSuccess = type === "success";

  return (
    <div style={{
      position: 'fixed', inset: 0, 
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 20, 
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#fff', 
        borderRadius: 24, 
        padding: 24,
        width: '100%', 
        maxWidth: 340, 
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        animation: 'pop 0.3s ease'
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, 
          background: isSuccess ? '#00c950' : '#ef4444', 
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', 
          fontSize: 36, 
          color: '#fff',
          fontWeight: 900
        }}>
          {isSuccess ? "✓" : "✕"}
        </div>

        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#000' }}>
          {title || (isSuccess ? "Transaction Successful" : "Transaction Failed")}
        </h3>
        
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>
          {message}
        </p>

        {amount && (
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 12, marginTop: 16, border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5 }}>AMOUNT</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: isSuccess ? '#000' : '#ef4444', marginTop: 2 }}>
              ₦{amount}
            </div>
            {details && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{details}</div>}
          </div>
        )}

        <button onClick={onClose} style={{
          width: '100%', marginTop: 18, padding: 14,
          borderRadius: 12, 
          background: isSuccess ? '#000' : '#ef4444', 
          color: '#fff',
          border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer'
        }}>
          {isSuccess ? "Done" : "Close"}
        </button>

        {isSuccess && (
          <button onClick={onClose} style={{
            width: '100%', marginTop: 8, padding: 10,
            borderRadius: 12, background: '#f1f5f9', color: '#000',
            border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer'
          }}>
            View Receipt
          </button>
        )}
      </div>

      <style>{`
        @keyframes pop { 
          from { transform: scale(0.85); opacity:0 } 
          to { transform: scale(1); opacity:1 } 
        }
      `}</style>
    </div>
  )
}