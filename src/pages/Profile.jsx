import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import '../styles/ProfilePage.css'
export default function Profile({ setPage }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ full_name:"", username:"", phone:"", state:"", gender:"" });
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name || data.first_name || "",
          username: data.username || "",
          phone: data.phone || data.phone_number || "",
          state: data.state || "",
          gender: data.gender || ""
        });
        setPreview(data.avatar_url || "");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
    setPreview(publicUrl);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.username) {
      alert("Please enter username");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      username: form.username.toLowerCase().replace(/\s/g,''),
      phone: form.phone,
      state: form.state,
      gender: form.gender,
      avatar_url: preview
    }).eq("id", user.id);

    if (error) alert(error.message);
    else alert("Profile saved! ✅");
    setSaving(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setPage("login");
  };

  if (loading) return <div style={{padding:40, textAlign:'center'}}>Loading...</div>;

  return (
    <main style={{ background: 'linear-gradient(135deg, #14fa9a 0%, #14e58e 40%, #0d6b37 75%, #0c3e1e 100%)', minHeight:'100vh', padding:20, paddingBottom:90 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <button onClick={()=>setPage("home")} style={{ background:'#fff', border:'none', borderRadius:'50%', width:40, height:40 }}>←</button>
        <h2 style={{ margin:0 }}>My Profile</h2>
      </div>

      <div style={{ background:'#fff', borderRadius:20, padding:24, textAlign:'center', marginBottom:16 }}>
        <div style={{ position:'relative', width:100, height:100, margin:'0 auto' }}>
          <img
            src={preview || `https://ui-avatars.com/api/?name=${form.username || form.full_name || profile?.email}&background=FF4D6D&color=fff&size=200`}
            style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', border:'3px solid #FCEEF2' }}
            alt="avatar"
          />
          <label style={{ position:'absolute', bottom:0, right:0, background:'#000', color:'#fff', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            📷
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display:'none' }} />
          </label>
        </div>
        {uploading && <p style={{ fontSize:12, color:'#FF4D6D' }}>Uploading...</p>}
        <h3 style={{ margin:'12px 0 4px' }}>{form.username || form.full_name || "CheqPay User"}</h3>
        <p style={{ color:'#888', margin:0, fontSize:14 }}>{profile?.email}</p>
        {profile?.is_admin && <span style={{ background:'#000', color:'#fff', padding:'4px 10px', borderRadius:20, fontSize:11, marginTop:8, display:'inline-block' }}>ADMIN</span>}
      </div>

      <div style={{ background:'#fff', borderRadius:16, padding:16 }}>
        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Full Name</label>
          <input value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} style={inputStyle} placeholder="Your full name" />
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Username (single name)</label>
          <input
            type="text"
            value={form.username}
            onChange={e=>setForm({...form, username:e.target.value.toLowerCase().replace(/\s/g,'')})}
            style={inputStyle}
            placeholder="e.g terseer"
          />
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Phone Number</label>
          <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={inputStyle} placeholder="080..." />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>State</label>
          <input value={form.state} onChange={e=>setForm({...form, state:e.target.value})} style={inputStyle} placeholder="e.g Lagos" />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Gender</label>
          <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} style={inputStyle}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div style={{ marginBottom:4 }}>
          <label style={labelStyle}>Email (cannot change)</label>
          <input value={profile?.email || ""} disabled style={{...inputStyle, background:'#f5f5f5'}} />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving || uploading} style={{ background:'#000', color:'#fff', border:'none', width:'100%', padding:15, borderRadius:12, marginTop:20, fontWeight:'bold', opacity: saving?0.6:1 }}>
        Save Changes
      </button>

      <button onClick={handleLogout} style={{ background:'#FF4D6D', color:'#fff', border:'none', width:'100%', padding:14, borderRadius:12, marginTop:12 }}>
        Logout
      </button>

      {(saving || loggingOut) && (
        <>
          <style>{`@keyframes pump{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}`}</style>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <img src="/logo.png" style={{ width: 80, height: 80, borderRadius: 18, animation: 'pump 0.7s ease-in-out infinite' }} />
          </div>
        </>
      )}
    </main>
  );
}

const labelStyle = { fontSize:12, color:'#888', marginBottom:6, display:'block' };
const inputStyle = { width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #eee', background:'#fafafa', fontSize:14, boxSizing:'border-box' };