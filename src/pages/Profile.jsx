import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase/supabaseClient";
import { ArrowLeft, Camera, ShieldCheck, Lock, User, Phone, MapPin, Mail, LogOut, CheckCircle2, ChevronRight, BadgeCheck, Pencil, X, KeyRound } from "lucide-react";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function Profile({ setPage }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ full_name:"", username:"", phone:"", state:"", gender:"" });
  const [preview, setPreview] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalForm, setOriginalForm] = useState(null);

  // --- PIN - EXACT AS AIRTIME ---
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [confirmDigits, setConfirmDigits] = useState(["", "", "", ""]);
  const [hasPin, setHasPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [showPinSection, setShowPinSection] = useState(false);
  const [pinError, setPinError] = useState("");
  const pinRefs = useRef([]);
  const confirmRefs = useRef([]);
  const pin = pinDigits.join("");
  const confirmPin = confirmDigits.join("");

  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [resetDigits, setResetDigits] = useState(["", "", "", ""]);
  const [resetConfirmDigits, setResetConfirmDigits] = useState(["", "", "", ""]);
  const [resetLoading, setResetLoading] = useState(false);
  const resetRefs = useRef([]);
  const resetConfirmRefs = useRef([]);
  const resetPin = resetDigits.join("");
  const resetConfirmPin = resetConfirmDigits.join("");

  const avatarSrc = preview || DEFAULT_AVATAR;

  const makePinHandlers = (digits, setDigits, refs) => ({
    onChange: (index, value) => {
      const digit = value.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);
      setPinError("");
      if (digit && index < 3) refs.current[index + 1]?.focus();
    },
    onKeyDown: (index, e) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const next = [...digits];
        if (next[index]) { next[index] = ""; setDigits(next); }
        else if (index > 0) { next[index - 1] = ""; setDigits(next); refs.current[index - 1]?.focus(); }
      }
      if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
      if (e.key === "ArrowRight" && index < 3) refs.current[index + 1]?.focus();
    },
    onPaste: (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4).split("");
      if (!pasted.length) return;
      const next = ["", "", "", ""];
      pasted.forEach((d, i) => { next[i] = d; });
      setDigits(next);
      setPinError("");
      refs.current[Math.min(pasted.length, 4) - 1]?.focus();
    }
  });

  const pinH = makePinHandlers(pinDigits, setPinDigits, pinRefs);
  const confirmH = makePinHandlers(confirmDigits, setConfirmDigits, confirmRefs);
  const resetH = makePinHandlers(resetDigits, setResetDigits, resetRefs);
  const resetConfirmH = makePinHandlers(resetConfirmDigits, setResetConfirmDigits, resetConfirmRefs);

  const closePinModal = () => { setShowPinSection(false); setPinDigits(["","","",""]); setConfirmDigits(["","","",""]); setPinError(""); };

  useEffect(() => {
    const load = async () => {
      const start = Date.now();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));
        setLoading(false); return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile(data);
        const initial = {
          full_name: data.full_name || data.first_name || "",
          username: data.username || "",
          phone: data.phone || data.phone_number || "",
          state: data.state || "",
          gender: data.gender || ""
        };
        setForm(initial);
        setOriginalForm(initial);
        setPreview(data.avatar_url || "");
      }
      const { data: hasPinData } = await supabase.rpc("has_user_pin");
      setHasPin(!!hasPinData);
      const elapsed = Date.now() - start;
      if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));
      setLoading(false);
    };
    load();
  }, []);

  const checkHasPin = async () => {
    const { data } = await supabase.rpc("has_user_pin");
    setHasPin(!!data);
  };

  const handleSetPin = async () => {
    if (pin.length !== 4 || confirmPin.length !== 4) { setPinError("Enter 4 digits for both"); return; }
    if (pin !== confirmPin) { setPinError("PINs don't match"); return; }
    if (["0000","1111","1234","4321","2222","3333"].includes(pin)) { setPinError("Too weak. Use different digits"); return; }
    setPinLoading(true);
    try {
      const { data, error } = await supabase.rpc("set_user_pin", { p_pin: pin });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      setSavedMsg(hasPin ? "PIN updated successfully!" : "PIN set! You can now pay securely.");
      setTimeout(()=>setSavedMsg(""), 3000);
      closePinModal();
      checkHasPin();
    } catch (e) { setPinError(e.message); } finally { setPinLoading(false); }
  };

  const handleSendResetOtp = async () => {
    if(!profile?.email) return alert("No email found");
    setResetLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: profile.email, options: { shouldCreateUser: false } });
    setResetLoading(false);
    if(error) return alert(error.message);
    setResetStep(2);
    alert(`OTP sent to ${profile.email}`);
  };

  const handleVerifyOtp = async () => {
    if(otp.length !== 6) return alert("Enter 6-digit OTP");
    setResetLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: profile.email, token: otp, type: 'email' });
    setResetLoading(false);
    if(error) return alert("Invalid or expired OTP: " + error.message);
    setResetStep(3);
  };

  const handleResetPin = async () => {
    if(resetPin.length !== 4 || resetConfirmPin.length !== 4) return alert("Enter 4 digits");
    if(resetPin !== resetConfirmPin) return alert("PINs don't match");
    if(["0000","1111","1234","4321","2222","3333"].includes(resetPin)) return alert("Too weak. Use different digits");
    setResetLoading(true);
    try {
      const { data, error } = await supabase.rpc("set_user_pin", { p_pin: resetPin });
      if(error) throw error;
      if(!data.success) throw new Error(data.message);
      setSavedMsg("PIN reset successfully! You can now pay.");
      setTimeout(()=>setSavedMsg(""), 3000);
      setShowReset(false); setResetStep(1); setOtp(""); setResetDigits(["","","",""]); setResetConfirmDigits(["","","",""]);
      checkHasPin();
    } catch(e){ alert(e.message); } finally { setResetLoading(false); }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
    if (uploadError) { alert("Upload failed: " + uploadError.message); setUploading(false); return; }
    const { data: { publicUrl } } = await supabase.storage.from("avatars").getPublicUrl(fileName);
    setPreview(publicUrl);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.username) { alert("Please enter username"); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      username: form.username.toLowerCase().replace(/\s/g,''),
      phone: form.phone,
      state: form.state,
      gender: form.gender,
      avatar_url: preview || null
    }).eq("id", user.id);
    if (error) alert(error.message);
    else { setSavedMsg("Profile saved successfully"); setTimeout(()=>setSavedMsg(""), 3000); setOriginalForm(form); setIsEditing(false); }
    setSaving(false);
  };

  const handleCancelEdit = () => { if (originalForm) setForm(originalForm); setIsEditing(false); };

  const handleLogout = async () => {
    if(!window.confirm("Are you sure you want to log out?")) return;
    setLoggingOut(true);
    await supabase.auth.signOut();
    setPage("login");
  };

  if (loading) return (
    <main style={{ background: '#F6F7F9', minHeight:'100vh', paddingBottom:90 }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        @keyframes softFade { 0% { opacity: 0.4; } 50% { opacity: 0.9; } 100% { opacity: 0.4; } }
        .sk { background: linear-gradient(90deg, #EDEEF1 25%, #F6F7F9 50%, #EDEEF1 75%); background-size: 200px 100%; animation: shimmer 1.4s infinite linear; border-radius: 10px; }
        .sk-dark { background: linear-gradient(90deg, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 75%); background-size: 200px 100%; animation: shimmer 1.4s infinite linear; border-radius: 10px; }
        .sk-fade { animation: softFade 1.6s ease-in-out infinite; }
        .sk-input { background: #F2F3F5; border: 1px solid #EEF0F2; border-radius: 12px; height: 48px; width: 100%; animation: softFade 1.6s ease-in-out infinite; }
        .sk-btn { background: #E8E9EC; border-radius: 20px; animation: softFade 1.6s ease-in-out infinite; }
      `}</style>
      <div style={{ background:'#fff', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid #EEF0F2' }}>
        <div className="sk" style={{ width:38, height:38, borderRadius:'50%' }} />
        <div>
          <div className="sk" style={{ width:110, height:16, marginBottom:6 }} />
          <div className="sk" style={{ width:170, height:11 }} />
        </div>
      </div>
      <div style={{ margin:16, background:'#111', borderRadius:20, padding:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ position:'relative' }}>
            <div className="sk-dark sk-fade" style={{ width:72, height:72, borderRadius:'50%' }} />
            <div style={{ position:'absolute', bottom:0, right:0, width:24, height:24, borderRadius:'50%', background:'#2A2A2A', border:'2px solid #111' }} />
          </div>
          <div style={{ flex:1 }}>
            <div className="sk-dark" style={{ width:'75%', height:18, marginBottom:8 }} />
            <div className="sk-dark" style={{ width:'45%', height:13, marginBottom:6 }} />
            <div className="sk-dark" style={{ width:'65%', height:12 }} />
          </div>
        </div>
        <div className="sk-dark" style={{ marginTop:16, height:42, borderRadius:12 }} />
      </div>
      <div style={{ margin:'0 16px 16px', background:'#fff', borderRadius:16, padding:16, border:'1px solid #EEF0F2' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="sk" style={{ width:44, height:44, borderRadius:12 }} />
          <div style={{ flex:1 }}>
            <div className="sk" style={{ width:120, height:14, marginBottom:6 }} />
            <div className="sk" style={{ width:170, height:11 }} />
          </div>
          <div className="sk-btn" style={{ width:74, height:32 }} />
        </div>
      </div>
      <div style={{ margin:'0 16px 16px', background:'#fff', borderRadius:16, padding:18, border:'1px solid #EEF0F2' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <div className="sk" style={{ width:150, height:16, marginBottom:6 }} />
            <div className="sk" style={{ width:190, height:11 }} />
          </div>
          <div className="sk-btn" style={{ width:78, height:30 }} />
        </div>
        <div style={{ marginBottom:14 }}><div className="sk" style={{ width:65, height:10, marginBottom:8 }} /><div className="sk-input" /></div>
        <div style={{ marginBottom:14 }}><div className="sk" style={{ width:95, height:10, marginBottom:8 }} /><div className="sk-input" /></div>
        <div style={{ marginBottom:14 }}><div className="sk" style={{ width:70, height:10, marginBottom:8 }} /><div className="sk-input" /></div>
        <div style={{ marginBottom:14 }}><div className="sk" style={{ width:100, height:10, marginBottom:8 }} /><div className="sk-input" /></div>
        <div style={{ marginBottom:14 }}><div className="sk" style={{ width:40, height:10, marginBottom:8 }} /><div className="sk-input" /></div>
        <div style={{ marginBottom:14 }}><div className="sk" style={{ width:50, height:10, marginBottom:8 }} /><div className="sk-input" /></div>
      </div>
      <div style={{ margin:'0 16px', background:'#fff', borderRadius:16, border:'1px solid #EEF0F2', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:16, borderBottom:'1px solid #F0F0F0' }}>
          <div className="sk" style={{ width:36, height:36, borderRadius:10 }} />
          <div className="sk" style={{ flex:1, height:14 }} />
          <div className="sk" style={{ width:16, height:16 }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:16, borderBottom:'1px solid #F0F0F0' }}>
          <div className="sk" style={{ width:36, height:36, borderRadius:10 }} />
          <div className="sk" style={{ flex:1, height:14 }} />
          <div className="sk" style={{ width:16, height:16 }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:16 }}>
          <div className="sk" style={{ width:36, height:36, borderRadius:10 }} />
          <div className="sk" style={{ flex:1, height:14 }} />
        </div>
      </div>
      <div className="sk" style={{ width:160, height:11, margin:'16px auto 0' }} />
    </main>
  );

  return (
    <main style={{ background: '#F6F7F9', minHeight:'100vh', paddingBottom:90, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background:'#fff', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:10, borderBottom:'1px solid #EEF0F2' }}>
        <button onClick={()=>setPage("mobileHome")} style={{ background:'#e0c91f', border:'none', borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ArrowLeft size={15} /></button>
        <div><div style={{ fontWeight:800, fontSize:16 }}>My Profile</div><div style={{ fontSize:11, color:'#888' }}>Manage your personal information</div></div>
      </div>

      {savedMsg && <div style={{ margin:'12px 16px 0', background:'#E6F9EE', color:'#c7b10d', padding:'10px 14px', borderRadius:12, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}><CheckCircle2 size={16} /> {savedMsg}</div>}

      <div style={{ margin:16, background:'#111', borderRadius:20, padding:20, color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-60, width:100, height:170, background:'rgba(233, 219, 17, 0.08)', borderRadius:'50%' }} />
        <div style={{ display:'flex', alignItems:'center', gap:14, position:'relative' }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <img src={avatarSrc} onError={(e) => { e.target.src = DEFAULT_AVATAR }} style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(255,255,255,0.3)', background:'#fff' }} alt="avatar" />
            <label style={{ position:'absolute', bottom:0, right:0, background:'#FFEB3B', color:'#000', width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid #111' }}><Camera size={12} /><input type="file" accept="image/*" onChange={handleImageChange} style={{ display:'none' }} /></label>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ fontSize:18, fontWeight:800, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{form.full_name || form.username || "CheqPay User"}</span><BadgeCheck size={18} color="#FFEB3B" /></div>
            <div style={{ fontSize:13, color:'#CBD5E1', marginTop:2 }}>@{form.username || "username"}</div>
            <div style={{ fontSize:12, color:'#94A3B8', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{profile?.email}</div>
          </div>
        </div>
        <div style={{ marginTop:16, position:'relative', background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#94A3B8', fontWeight:600 }}>TRANSACTION PIN</span>
          <span style={{ fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>{hasPin ? <><Lock size={13} color="#FFEB3B" /> Secured</> : <><Lock size={13} color="#f02d06" /> Not Set</>}</span>
        </div>
      </div>

      <div style={{ margin:'0 16px 16px', background:'#070505', borderRadius:16, padding:16, border:'1px solid #EEF0F2' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:32, height:32, borderRadius:7, background: hasPin ? '#f8fffb' : '#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center' }}>{hasPin ? <Lock size={20} color="#e2bd19" /> : <ShieldCheck size={20} color="#DC2626" />}</div>
            <div><div style={{ fontWeight:800, fontSize:14,color:"white" }}>Transaction PIN</div><div style={{ fontSize:12, color: hasPin ? '#e6d113' : '#DC2626', fontWeight:600 }}>{hasPin ? 'Set • Secured for payments' : 'Not set • Required to pay'}</div></div>
          </div>
          <button onClick={() => setShowPinSection(true)} style={{ background:'#e6d113', color:'#0b0000', border:'none', padding:'9px 16px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer' }}>{hasPin ? 'Change' : 'Set PIN'}</button>
        </div>
        {hasPin && (
          <button onClick={()=>{ setShowReset(true); }} style={{ background:'none', border:'none', color:'#25eb49', fontSize:12, fontWeight:700, cursor:'pointer', marginTop:10, display:'flex', alignItems:'center', gap:5 }}>
            <KeyRound size={13} /> Forgot PIN? Reset via Email
          </button>
        )}
      </div>

      <div style={{ margin:'0 16px 16px', background:'#fff', borderRadius:16, padding:18, border:'1px solid #EEF0F2' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div><div style={{ fontWeight:800, fontSize:15 }}>Personal Information</div><div style={{ fontSize:12, color:'#888', marginTop:2 }}>{isEditing ? "You can now edit your details" : "Tap Update to edit your details"}</div></div>
          {!isEditing && <button onClick={()=>setIsEditing(true)} style={{ background:'#e6d113', color:'#110101', border:'none', padding:'8px 14px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Pencil size={13} /> Update</button>}
        </div>

        <Field icon={<User size={16} color="#888" />} label="Full Name" value={form.full_name} onChange={v=>setForm({...form, full_name:v})} placeholder="Your full name" disabled={!isEditing} />

        <div style={{ marginBottom:14, opacity: 0.9 }}>
          <label style={labelStyle}>Email Address</label>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:'#F6F7F9', padding:'0 14px', borderRadius:12, border:'1px solid #EEF0F2' }}>
            <Mail size={16} color="#888" />
            <span style={{ fontSize:14, color:'#666', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', padding:'13px 0' }}>{profile?.email || ""}</span>
            <span style={{ fontSize:10, background:'#E6F9EE', color:'#15803D', padding:'3px 8px', borderRadius:20, fontWeight:700 }}>LOCKED</span>
          </div>
        </div>

        <Field icon={<User size={16} color="#888" />} label="Username" value={form.username} onChange={v=>setForm({...form, username:v.toLowerCase().replace(/\s/g,'')})} placeholder="e.g terseer" disabled={!isEditing} />
        <Field icon={<Phone size={16} color="#888" />} label="Phone Number" value={form.phone} onChange={v=>setForm({...form, phone:v})} placeholder="080..." disabled={!isEditing} />
        <Field icon={<MapPin size={16} color="#888" />} label="State" value={form.state} onChange={v=>setForm({...form, state:v})} placeholder="e.g Lagos" disabled={!isEditing} />

        <div style={{ marginBottom:14, opacity: isEditing ? 1 : 0.6 }}>
          <label style={labelStyle}>Gender</label>
          <div style={{ display:'flex', alignItems:'center', gap:10, border:'1px solid #E5E7EB', borderRadius:12, background: isEditing ? '#FAFAFA' : '#F6F7F9', padding:'0 14px' }}>
            <User size={16} color="#888" />
            <select disabled={!isEditing} value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} style={{ flex:1, padding:'13px 0', border:'none', background:'transparent', fontSize:14, outline:'none', color:'#111', cursor: isEditing ? 'pointer' : 'not-allowed', appearance:'none' }}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <span style={{ fontSize:12, color:'#999' }}>▼</span>
          </div>
        </div>

        {isEditing && (
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button onClick={handleCancelEdit} style={{ flex:1, padding:15, borderRadius:12, border:'1px solid #E5E7EB', background:'#fff', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}><X size={16} /> Cancel</button>
            <button onClick={handleSave} disabled={saving || uploading} style={{ flex:1.5, background:'#e6d113', color:'#040404', border:'none', padding:15, borderRadius:12, fontWeight:700, cursor:'pointer', opacity: saving?0.6:1 }}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        )}
      </div>

      <p style={{ textAlign:'center', fontSize:11, color:'#AAA', marginTop:16 }}>CheqPay • Version 1.0 • Secured</p>

      {/* ============ SET / CHANGE PIN - EXACT AS AIRTIME / DATA / CABLE / ELECTRICITY ============ */}
      {showPinSection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 10000, padding: 0 }} onClick={closePinModal}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#141A24', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '12px 24px 28px', width: '100%', maxWidth: 420, textAlign: 'center', borderTop: '1px solid #2C3440', boxShadow: '0 -20px 50px rgba(0,0,0,0.5)', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ width: 44, height: 5, borderRadius: 99, background: '#2C3440', margin: '0 auto 20px' }} />
            {/* SAME AS AIRTIME */}
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FFEB3B', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(255,235,59,0.25)' }}>
              <Lock size={26} color="#000" strokeWidth={2.4} />
            </div>
            <h3 style={{ margin: '0 0 6px', color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>{hasPin ? 'Change Transaction PIN' : 'Create Transaction PIN'}</h3>
            <p style={{ fontSize: 13, color: '#9AA3B2', margin: '0 0 22px', lineHeight: 1.5 }}>This PIN go secure all your payments</p>

            {/* NEW PIN - AT THE TOP */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6, textAlign: 'left', letterSpacing: '0.3px' }}>{hasPin ? 'NEW PIN' : 'CREATE 4-DIGIT PIN'}</div>
            <PinBoxes digits={pinDigits} refs={pinRefs} handlers={pinH} error={pinError} />
            <PinDots digits={pinDigits} />

            {/* CONFIRM PIN - DIRECTLY UNDER NEW PIN */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6, marginTop: 16, textAlign: 'left', letterSpacing: '0.3px' }}>CONFIRM PIN</div>
            <PinBoxes digits={confirmDigits} refs={confirmRefs} handlers={confirmH} error={pinError} />
            <PinDots digits={confirmDigits} />

            {pin.length === 4 && confirmPin.length === 4 && (
              <div style={{ fontSize: 12, fontWeight: 700, color: pin === confirmPin ? '#00ff88' : '#FF5252', margin: '6px 0 10px' }}>
                {pin === confirmPin ? '✓ PINs match' : '✕ PINs don\'t match'}
              </div>
            )}

            {pinError && (
              <div style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', color: '#FF8A8A', fontSize: 12.5, fontWeight: 600, padding: '10px 12px', borderRadius: 12, marginBottom: 14 }}>{pinError}</div>
            )}

            <button onClick={handleSetPin} disabled={pinLoading || pin.length !== 4 || confirmPin.length !== 4} style={{ width: '100%', padding: 15, borderRadius: 14, border: 'none', background: pin.length === 4 && confirmPin.length === 4 ? '#FFEB3B' : '#2C3440', color: pin.length === 4 && confirmPin.length === 4 ? '#000' : '#777', fontWeight: 800, fontSize: 15, cursor: pin.length === 4 && confirmPin.length === 4 ? 'pointer' : 'not-allowed', marginBottom: 10, opacity: pinLoading ? 0.7 : 1 }}>
              {pinLoading ? "Saving..." : hasPin ? "Update PIN" : "Set PIN"}
            </button>
            <button onClick={closePinModal} style={{ background: 'none', border: 'none', color: '#9AA3B2', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 8 }}>Cancel</button>
            <p style={{ fontSize: 11, color: '#5C6675', margin: '12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Lock size={11} color="#5C6675" /> Your PIN is encrypted and never stored on this device
            </p>
          </div>
        </div>
      )}

      {/* ============ RESET PIN - OTP + NEW PIN - ALSO EXACT AS AIRTIME ============ */}
      {showReset && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 10000, padding: 0 }} onClick={() => setShowReset(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#141A24', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '12px 24px 28px', width: '100%', maxWidth: 420, textAlign: 'center', borderTop: '1px solid #2C3440', boxShadow: '0 -20px 50px rgba(0,0,0,0.5)', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ width: 44, height: 5, borderRadius: 99, background: '#2C3440', margin: '0 auto 20px' }} />
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FFEB3B', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(255,235,59,0.25)' }}>
              <Lock size={26} color="#000" strokeWidth={2.4} />
            </div>
            <h3 style={{ margin: '0 0 6px', color: '#fff', fontSize: 20, fontWeight: 800 }}>Reset PIN</h3>
            <p style={{ fontSize: 13, color: '#9AA3B2', margin: '0 0 22px' }}>We will send a 6-digit OTP to <b style={{ color: '#fff' }}>{profile?.email}</b></p>

            {resetStep === 1 && (
              <button onClick={handleSendResetOtp} disabled={resetLoading} style={{ width: '100%', padding: 15, borderRadius: 14, border: 'none', background: '#FFEB3B', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>{resetLoading ? "Sending..." : "Send OTP to Email"}</button>
            )}

            {resetStep === 2 && (
              <>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6, textAlign: 'left' }}>ENTER 6-DIGIT OTP</div>
                <input inputMode="numeric" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="123456" style={{ width:'100%', padding:14, borderRadius:12, border:'1.5px solid #2C3440', background:'#0F131A', color:'#fff', fontSize:20, letterSpacing:8, textAlign:'center', margin:'6px 0 12px', boxSizing:'border-box', outline:'none' }} />
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={handleSendResetOtp} style={{ flex:1, padding:13, borderRadius:14, border:'1px solid #2C3440', background:'transparent', color:'#fff', cursor:'pointer', fontWeight:700 }}>Resend</button>
                  <button onClick={handleVerifyOtp} disabled={resetLoading || otp.length!==6} style={{ flex:1, padding:13, borderRadius:14, border:'none', background: otp.length===6 ? '#FFEB3B' : '#2C3440', color: otp.length===6 ? '#000' : '#777', fontWeight:800, cursor:'pointer' }}>{resetLoading ? "..." : "Verify OTP"}</button>
                </div>
              </>
            )}

            {resetStep === 3 && (
              <>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6, textAlign: 'left', letterSpacing: '0.3px' }}>NEW 4-DIGIT PIN</div>
                <PinBoxes digits={resetDigits} refs={resetRefs} handlers={resetH} />
                <PinDots digits={resetDigits} />
                <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6, marginTop: 16, textAlign: 'left', letterSpacing: '0.3px' }}>CONFIRM NEW PIN</div>
                <PinBoxes digits={resetConfirmDigits} refs={resetConfirmRefs} handlers={resetConfirmH} />
                <PinDots digits={resetConfirmDigits} />
                <button onClick={handleResetPin} disabled={resetLoading || resetPin.length!==4} style={{ width:'100%', padding:15, borderRadius:14, border:'none', background: resetPin.length===4 ? '#FFEB3B' : '#2C3440', color: resetPin.length===4 ? '#000' : '#777', fontWeight:800, fontSize:15, cursor:'pointer', marginTop:10 }}>{resetLoading ? "..." : "Reset PIN"}</button>
              </>
            )}

            <button onClick={()=>{setShowReset(false); setResetStep(1); setOtp(""); setResetDigits(["","","",""]); setResetConfirmDigits(["","","",""]);}} style={{ background: 'none', border: 'none', color: '#9AA3B2', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 8, marginTop: 10 }}>Cancel</button>
            <p style={{ fontSize: 11, color: '#5C6675', margin: '12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Lock size={11} color="#5C6675" /> Your PIN is encrypted and never stored on this device
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

// --- EXACT AS AIRTIME / DATA / CABLE / ELECTRICITY ---
function PinBoxes({ digits, refs, handlers, error }) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlers.onChange(i, e.target.value)}
          onKeyDown={(e) => handlers.onKeyDown(i, e)}
          onPaste={handlers.onPaste}
          onFocus={(e) => e.target.select()}
          autoFocus={i === 0}
          style={{
            width: 58, height: 62, borderRadius: 16, textAlign: 'center',
            fontSize: 26, fontWeight: 800, color: '#fff',
            background: digit ? '#1E2633' : '#0F131A',
            border: `1.5px solid ${error ? '#FF5252' : digit ? '#FFEB3B' : '#2C3440'}`,
            outline: 'none', transition: 'all 0.15s ease',
            boxShadow: digit ? '0 0 0 3px rgba(255,235,59,0.12)' : 'none',
            caretColor: '#FFEB3B'
          }}
        />
      ))}
    </div>
  );
}

function PinDots({ digits }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
      {digits.map((d, i) => (
        <div key={i} style={{ width: d ? 20 : 8, height: 6, borderRadius: 99, background: d ? '#FFEB3B' : '#2C3440', transition: 'all 0.2s' }} />
      ))}
    </div>
  );
}

function Field({ icon, label, value, onChange, placeholder, disabled }) {
  return (
    <div style={{ marginBottom:14, opacity: disabled ? 0.6 : 1 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display:'flex', alignItems:'center', gap:10, border:'1px solid #E5E7EB', borderRadius:12, background: disabled ? '#F6F7F9' : '#FAFAFA', padding:'0 14px' }}>
        {icon}
        <input disabled={disabled} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ flex:1, padding:'13px 0', border:'none', background:'transparent', fontSize:14, outline:'none', color:'#111' }} />
      </div>
    </div>
  );
}

const labelStyle = { fontSize:11, fontWeight:700, color:'#666', marginBottom:6, display:'block', letterSpacing:'0.3px' };