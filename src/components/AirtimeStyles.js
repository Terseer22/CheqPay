export const styles = {

  netBtn: { 
  background: "#2C3440", 
  color: "#fff", 
  fontWeight: 800, 
  padding: "12px 0", 
  borderRadius: "14px", 
  border: "none", 
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  fontSize: "11px"
},
icon: { width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", background: "#fff" },
icons: { width: "70px", height: "32px", borderRadius: "10%", objectFit: "cover", background: "#fff" },
  rowCard: { background: "#1E232E", borderRadius: "24px", padding: "20px", width: "100%" },
  title: { color: "#fff", fontWeight: 800, margin: "0 0 12px 0" },
  networkRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" },
  netBtn: { background: "#2C3440", color: "#fff", fontWeight: 900, padding: "16px 0", borderRadius: "14px", border: "none", cursor: "pointer" },
  modalWrapper: { position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  backdrop: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" },
  modalCard: { position: "relative", width: "100%", maxWidth: "420px", background: "#1E232E", borderRadius: "32px", padding: "28px" },
  input: { width: "100%", background: "#2C3440", color: "#fff", borderRadius: "16px", padding: "16px", border: "none", outline: "none", marginBottom: "10px", boxSizing: "border-box" },
  payBtn: { width: "100%", background: "#FFEB3B", color: "#000", fontWeight: 900, padding: "18px", borderRadius: "100px", border: "none", cursor: "pointer", marginTop: "10px" },
  quickBtn: { padding: "8px 14px", borderRadius: "20px", border: "1px solid #555", background: "transparent", color: "#fff", cursor: "pointer" },
  quickActive: { background: "#fff", color: "#000" }
}