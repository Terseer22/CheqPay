export default function FastTest({ setPage }) {
  return (
    <div style={{padding: 40, textAlign: 'center'}}>
      <h1>Test - If you see this fast, Login.jsx na problem</h1>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  )
}