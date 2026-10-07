export default function ServicesGrid({ setPage }) {
  const services = [
    { label: "Airtime", icon: "📱", page: "airtime" },
    { label: "Data", icon: "🌐", page: "data" },
    { label: "Electricity", icon: "💡", page: "electricity" },
    { label: "Cable TV", icon: "📺", page: "cable" },
    { label: "Bulk SMS", icon: "📩", page: "bulk-sms" },
    { label: "More", icon: "•••", page: "more" },
  ];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {services.map((s) => (
          <div
            key={s.label}
            onClick={() => setPage(s.page)}
            style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 16, padding: 16, textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}