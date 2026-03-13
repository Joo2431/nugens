import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const API   = import.meta.env.VITE_GEN_E_API_URL || "https://nugens-api.onrender.com";
const PINK  = "#e8185d";
const LIMIT = 20;

/* ── SUPPORTED LANGUAGES (free, world-scale) ── */
const LANGUAGES = {
  en:  { name:"English",    native:"English",           flag:"🇬🇧" },
  hi:  { name:"Hindi",      native:"हिंदी",               flag:"🇮🇳" },
  es:  { name:"Spanish",    native:"Español",            flag:"🇪🇸" },
  fr:  { name:"French",     native:"Français",           flag:"🇫🇷" },
  ar:  { name:"Arabic",     native:"العربية",             flag:"🇸🇦" },
  pt:  { name:"Portuguese", native:"Português",          flag:"🇧🇷" },
  de:  { name:"German",     native:"Deutsch",            flag:"🇩🇪" },
  zh:  { name:"Chinese",    native:"中文",                 flag:"🇨🇳" },
  ja:  { name:"Japanese",   native:"日本語",                flag:"🇯🇵" },
  ko:  { name:"Korean",     native:"한국어",                flag:"🇰🇷" },
  ru:  { name:"Russian",    native:"Русский",            flag:"🇷🇺" },
  id:  { name:"Indonesian", native:"Bahasa Indonesia",   flag:"🇮🇩" },
  tr:  { name:"Turkish",    native:"Türkçe",             flag:"🇹🇷" },
  bn:  { name:"Bengali",    native:"বাংলা",                flag:"🇧🇩" },
  ta:  { name:"Tamil",      native:"தமிழ்",               flag:"🇮🇳" },
  te:  { name:"Telugu",     native:"తెలుగు",              flag:"🇮🇳" },
  vi:  { name:"Vietnamese", native:"Tiếng Việt",         flag:"🇻🇳" },
  it:  { name:"Italian",    native:"Italiano",           flag:"🇮🇹" },
  sw:  { name:"Swahili",    native:"Kiswahili",          flag:"🇰🇪" },
  nl:  { name:"Dutch",      native:"Nederlands",         flag:"🇳🇱" },
};

/* html2canvas — loaded on demand only when user clicks Download as Image */
let _html2canvas = null;
async function getHtml2Canvas() {
  if (_html2canvas) return _html2canvas;
  return new Promise((resolve, reject) => {
    if (window.html2canvas) { _html2canvas = window.html2canvas; resolve(window.html2canvas); return; }
    if (document.getElementById("h2c-script")) {
      const iv = setInterval(() => { if (window.html2canvas) { clearInterval(iv); _html2canvas = window.html2canvas; resolve(window.html2canvas); } }, 50);
      return;
    }
    const s = document.createElement("script");
    s.id = "h2c-script";
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload  = () => { _html2canvas = window.html2canvas; resolve(window.html2canvas); };
    s.onerror = () => reject(new Error("html2canvas failed to load"));
    document.head.appendChild(s);
  });
}

/* ─── DATA ─────────────────────────────────────── */
const MODES = [
  { id:"CAREER",    label:"Career",    long:"Career Guidance", icon:"◎" },
  { id:"RESUME",    label:"Resume",    long:"ATS Resume",      icon:"▤" },
  { id:"INTERVIEW", label:"Interview", long:"Interview Prep",  icon:"◷" },
  { id:"SCORING",   label:"Score",     long:"Readiness Score", icon:"◈" },
];

const STARTERS = [
  { mode:"CAREER",    title:"Switch careers",   body:"I want to switch from non-IT to software development. Guide me step by step." },
  { mode:"RESUME",    title:"Build my resume",  body:"Help me build an ATS-optimised resume for a product manager role." },
  { mode:"INTERVIEW", title:"Interview prep",   body:"Prepare me for a React developer interview at a product company." },
  { mode:"SCORING",   title:"Score my profile", body:"Score my career readiness for a data science role and give a roadmap." },
  { mode:"CAREER",    title:"Get a roadmap",    body:"Create a 6-month roadmap for me to become a UX designer." },
  { mode:"RESUME",    title:"Optimise resume",  body:"Optimize my existing resume to be more ATS-friendly for tech roles." },
];

const TOOLS = [
  { label:"ATS Resume",      mode:"RESUME",    body:"Build an ATS-optimised resume for me. Ask what I need first." },
  { label:"Career Roadmap",  mode:"CAREER",    body:"Create a detailed personalised career roadmap for my situation." },
  { label:"Readiness Score", mode:"SCORING",   body:"Give me a full career readiness score with strengths, gaps, and 30-day plan." },
  { label:"Mock Interview",  mode:"INTERVIEW", body:"Start a mock interview. Ask me the role I'm targeting first." },
  { label:"Optimise CV",     mode:"RESUME",    body:"Help me optimize my existing resume for ATS. I'll upload it." },
  { label:"Job Match",       mode:"CAREER",    body:"Analyse my profile and find the best matching job roles for me." },
  { label:"Skill Gap",       mode:"CAREER",    body:"Do a skill gap analysis based on my target role and current skills." },
  { label:"LinkedIn Tips",   mode:"CAREER",    body:"Help me optimize my LinkedIn profile to attract recruiters." },
];

const GREETINGS = [
  "Hey! I'm **GEN-E**, your AI career guide.\n\nWhat's your current situation — looking to grow, switch careers, or start fresh?",
  "Hi! Welcome to **GEN-E**.\n\nI help with career guidance, ATS resumes, interview prep, and career scoring. What's on your mind?",
  "Hello! I'm **GEN-E**.\n\nCareer clarity starts here. Are you exploring new opportunities, building your resume, or prepping for interviews?",
];

/* ─── UTILS ─────────────────────────────────────── */
const isGreeting = m => /^(hi+|hello+|hey+|sup|yo|howdy)\s*[!.]?\s*$/i.test(m.trim());
const isImgExt   = n => [".png",".jpg",".jpeg",".webp",".gif"].includes(n.slice(n.lastIndexOf(".")).toLowerCase());
const uid        = () => `c-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
const freshChat  = (mode="CAREER") => ({ id:uid(), title:"New Chat", mode, messages:[], history:[] });

/* ─── Wake server — polls for up to 90s on cold start ─── */
let _serverWarmedUp = false;
let _wakePromise = null;
async function wakeServer() {
  if (_serverWarmedUp) return;
  if (_wakePromise) return _wakePromise;
  _wakePromise = (async () => {
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) {
      try {
        const r = await fetch(`${API}/health`, { signal: AbortSignal.timeout(8000) });
        if (r.ok) { _serverWarmedUp = true; _wakePromise = null; return; }
      } catch {}
      await new Promise(r => setTimeout(r, 4000));
    }
    _wakePromise = null;
  })();
  return _wakePromise;
}
wakeServer().catch(() => {});

/* ─── SMALL COMPONENTS ──────────────────────────── */

function PlanBadge({ plan }) {
  const map = { free:["Free","#aaa"], monthly:["Pro","#e8185d"], yearly:["Pro Yearly","#7c3aed"] };
  const [label, color] = map[plan] || map.free;
  return <span style={{ fontSize:10, fontWeight:700, color, letterSpacing:"0.04em" }}>{label}</span>;
}

/* ── SaveResumeModal component ── */
function SaveResumeModal({ defaultText, saving, onClose, onSave }) {
  const [title,   setTitle]   = useState("My Resume");
  const [role,    setRole]    = useState("");
  const [company, setCompany] = useState("");

  const firstHeadingMatch = defaultText?.match(/^##\s+(.+)$/m);
  const autoTitle = firstHeadingMatch
    ? firstHeadingMatch[1].replace(/^(PROFESSIONAL SUMMARY|RESUME|CV)\s*/i, "").trim()
    : "";

  const handleSave = () => {
    onSave({
      title:          title || "My Resume",
      target_role:    role,
      target_company: company,
      content_md:     defaultText,
    });
  };

  const inputStyle = {
    width:"100%", padding:"9px 12px", border:"1.5px solid #e5e7eb",
    borderRadius:8, fontSize:13, outline:"none", fontFamily:"inherit",
    transition:"border 0.15s", boxSizing:"border-box",
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:900,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"#fff",borderRadius:16,padding:"28px 24px",
        maxWidth:380,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ fontWeight:800,fontSize:17,color:"#111",marginBottom:4 }}>💾 Save to Resume Vault</div>
        <div style={{ fontSize:12.5,color:"#aaa",marginBottom:20 }}>Give this version a name so you can find it later.</div>

        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <div>
            <label style={{ fontSize:11.5,fontWeight:600,color:"#555",display:"block",marginBottom:4 }}>
              Resume Title *
            </label>
            <input value={title} onChange={e=>setTitle(e.target.value)}
              placeholder={autoTitle || "e.g. Resume v1 — TCS"}
              style={inputStyle}
              onFocus={e=>e.target.style.borderColor="#e8185d"}
              onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          </div>
          <div>
            <label style={{ fontSize:11.5,fontWeight:600,color:"#555",display:"block",marginBottom:4 }}>
              Target Role (optional)
            </label>
            <input value={role} onChange={e=>setRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              style={inputStyle}
              onFocus={e=>e.target.style.borderColor="#e8185d"}
              onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          </div>
          <div>
            <label style={{ fontSize:11.5,fontWeight:600,color:"#555",display:"block",marginBottom:4 }}>
              Target Company (optional)
            </label>
            <input value={company} onChange={e=>setCompany(e.target.value)}
              placeholder="e.g. Google, TCS, any startup"
              style={inputStyle}
              onFocus={e=>e.target.style.borderColor="#e8185d"}
              onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          </div>
        </div>

        <div style={{ display:"flex",gap:10,marginTop:20 }}>
          <button onClick={onClose}
            style={{ flex:1,padding:"10px 0",background:"#f5f5f5",border:"none",
              borderRadius:9,fontWeight:600,fontSize:13,color:"#888",cursor:"pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !title.trim()}
            style={{ flex:2,padding:"10px 0",background:"#e8185d",border:"none",
              borderRadius:9,fontWeight:700,fontSize:13,color:"#fff",
              cursor: saving ? "wait" : "pointer",opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save Resume →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── LanguagePicker component ── */
function LanguagePicker({ lang, setLang, open, setOpen }) {
  const cur = LANGUAGES[lang] || LANGUAGES.en;
  return (
    <div style={{ position:"relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Change language"
        style={{ background:"none", border:"1.5px solid #e8e8e8", borderRadius:8,
          padding:"4px 9px", cursor:"pointer", display:"flex", alignItems:"center", gap:5,
          fontSize:12, color:"#555", fontWeight:600, transition:"all 0.12s" }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="#e8185d"; e.currentTarget.style.color="#e8185d"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e8e8e8"; e.currentTarget.style.color="#555"; }}>
        <span style={{fontSize:14}}>{cur.flag}</span>
        <span>{cur.name}</span>
        <span style={{fontSize:9,opacity:0.5}}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position:"fixed", inset:0, zIndex:200 }} />
          <div style={{
            position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:201,
            background:"#fff", borderRadius:12, boxShadow:"0 8px 40px rgba(0,0,0,0.14)",
            border:"1px solid #f0f0f0", padding:"8px 6px",
            width:210, maxHeight:320, overflowY:"auto",
            display:"grid", gridTemplateColumns:"1fr 1fr", gap:2,
          }}>
            <div style={{ gridColumn:"1/-1", fontSize:10, fontWeight:700, color:"#aaa",
              letterSpacing:"0.08em", textTransform:"uppercase", padding:"2px 6px 6px" }}>
              Choose language
            </div>
            {Object.entries(LANGUAGES).map(([code, l]) => (
              <button key={code}
                onClick={() => { localStorage.setItem("gene-lang", code); setLang(code); setOpen(false); }}
                style={{
                  background: lang === code ? "#fff0f5" : "none",
                  border: lang === code ? "1px solid #fcc" : "1px solid transparent",
                  borderRadius:7, padding:"6px 8px", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:6,
                  textAlign:"left", transition:"all 0.1s",
                }}
                onMouseEnter={e=>{ if(lang!==code) e.currentTarget.style.background="#f9f9f9"; }}
                onMouseLeave={e=>{ if(lang!==code) e.currentTarget.style.background="none"; }}>
                <span style={{fontSize:14}}>{l.flag}</span>
                <div>
                  <div style={{fontSize:11.5, fontWeight: lang===code ? 700 : 500, color: lang===code ? "#e8185d" : "#333"}}>
                    {l.native}
                  </div>
                  <div style={{fontSize:10, color:"#aaa"}}>{l.name}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UpgradeModal({ feature, onClose, onUpgrade }) {
  const GATE_COPY = {
    limit:              { icon:"⚡", title:"Free limit reached",                  plan:"Pro Monthly or Yearly",                  cta:"View Plans →",     body:`You've used all ${LIMIT} free questions. Upgrade to Pro for unlimited career guidance.` },
    resume_builder:     { icon:"📄", title:"Pro Feature — ATS Resume Builder",    plan:"Pro Monthly (₹99/mo) or Yearly (₹699/yr)", cta:"Upgrade to Pro →", body:"Building an ATS-optimised resume is available on Pro plans. Upgrade to create and download your professional resume." },
    resume_review:      { icon:"🔍", title:"Pro Feature — Resume Review",         plan:"Pro Monthly (₹99/mo) or Yearly (₹699/yr)", cta:"Upgrade to Pro →", body:"Uploading and analysing your resume is a Pro feature. Upgrade to get detailed feedback on your CV." },
    interview_advanced: { icon:"🎯", title:"Pro Feature — Advanced Interview Prep",plan:"Pro Monthly (₹99/mo) or Yearly (₹699/yr)", cta:"Upgrade to Pro →", body:"Full interview prep with role-specific questions and a 1-week strategy is available on Pro plans." },
    job_search:         { icon:"🔎", title:"Yearly Plan — Job Match Analysis",    plan:"Pro Yearly only (₹699/yr)",                cta:"Get Pro Yearly →", body:"Live job search and job match analysis is exclusive to the Pro Yearly plan. Upgrade to find real openings tailored to your profile." },
  };
  const copy = GATE_COPY[feature] || GATE_COPY.limit;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:900,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"#fff",borderRadius:20,padding:"36px 32px",maxWidth:380,width:"100%",
        textAlign:"center",boxShadow:"0 24px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize:36,marginBottom:12 }}>{copy.icon}</div>
        <div style={{ fontWeight:800,fontSize:19,color:"#111",marginBottom:8,letterSpacing:"-0.02em",lineHeight:1.3 }}>{copy.title}</div>
        <div style={{ fontSize:13.5,color:"#666",lineHeight:1.7,marginBottom:8 }}>{copy.body}</div>
        <div style={{ display:"inline-block",fontSize:11,fontWeight:700,color:PINK,
          background:"#fff0f5",padding:"4px 12px",borderRadius:20,marginBottom:24,border:"1px solid #fcc" }}>{copy.plan}</div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px 0",background:"#f5f5f5",border:"none",
            borderRadius:10,fontWeight:600,fontSize:13,color:"#888",cursor:"pointer" }}>Not now</button>
          <button onClick={onUpgrade} style={{ flex:2,padding:"11px 0",background:PINK,border:"none",
            borderRadius:10,fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer" }}>{copy.cta}</button>
        </div>
      </div>
    </div>
  );
}

function CtxMenu({ x, y, onRename, onDelete, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div ref={ref} style={{ position:"fixed",top:y,left:x,zIndex:800,background:"#fff",
      borderRadius:10,padding:4,boxShadow:"0 8px 32px rgba(0,0,0,0.14)",
      border:"1px solid #f0f0f0",minWidth:140 }}>
      {[["Rename", onRename, false],["Delete", onDelete, true]].map(([lbl,fn,danger])=>(
        <button key={lbl} onClick={()=>{fn();onClose();}}
          style={{ display:"block",width:"100%",padding:"8px 12px",border:"none",
            background:"none",textAlign:"left",fontSize:12.5,cursor:"pointer",
            color:danger?"#e55":"#333",borderRadius:7 }}
          onMouseEnter={e=>e.currentTarget.style.background=danger?"#fff5f5":"#f9f9f9"}
          onMouseLeave={e=>e.currentTarget.style.background="none"}>
          {lbl}
        </button>
      ))}
    </div>
  );
}

function RenameModal({ chat, onSave, onClose }) {
  const [v, setV] = useState(chat?.title || "");
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:900,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:"#fff",borderRadius:14,padding:24,width:320,
        boxShadow:"0 12px 40px rgba(0,0,0,0.14)" }}>
        <div style={{ fontSize:14,fontWeight:700,color:"#111",marginBottom:12 }}>Rename chat</div>
        <input autoFocus value={v} onChange={e=>setV(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") onSave(v); if(e.key==="Escape") onClose(); }}
          style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e5e7eb",
            borderRadius:8,fontSize:13,outline:"none",marginBottom:12 }} />
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={onClose} style={{ flex:1,padding:"9px 0",background:"#f5f5f5",
            border:"none",borderRadius:8,fontSize:12.5,color:"#888",cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>onSave(v.trim()||chat?.title)} style={{ flex:1,padding:"9px 0",
            background:PINK,border:"none",borderRadius:8,fontSize:12.5,color:"#fff",
            fontWeight:700,cursor:"pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ──────────────────────────────────────── */
export default function GenEChat() {
  const nav = useNavigate();

  const [user,       setUser]       = useState(null);
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState({ profile:true, chats:true });
  const [chats,      setChats]      = useState([]);
  const [activeId,   setActiveId]   = useState(null);
  const [mode,       setMode]       = useState("CAREER");
  const [input,      setInput]      = useState("");
  const [busy,       setBusy]       = useState(false);
  const [staged,     setStaged]     = useState(null);
  const [showAttach, setShowAttach] = useState(false);
  const [sidebarOpen,setSidebarOpen]= useState(false);
  const [searchQ,    setSearchQ]    = useState("");
  const [upgrade,    setUpgrade]    = useState(false);
  const [lang,       setLang]       = useState(() => localStorage.getItem("gene-lang") || "en");
  const [langOpen,   setLangOpen]   = useState(false);
  const [saveModal,  setSaveModal]  = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [ctx,        setCtx]        = useState(null);
  const [renaming,   setRenaming]   = useState(null);
  const [editIdx,    setEditIdx]    = useState(null);
  const [editText,   setEditText]   = useState("");

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const saveTimer = useRef(null);
  const active    = chats.find(c => c.id === activeId);

  /* ─── Auth & load ─── */
  const loadProfile = async uid => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setProfile(data);
    setLoading(p => ({ ...p, profile:false }));
  };

  const loadChats = async uid => {
    const { data } = await supabase.from("chat_sessions").select("*")
      .eq("user_id", uid).order("updated_at", { ascending:false });
    if (data?.length) {
      const parseArr = v => {
        if (Array.isArray(v)) return v;
        if (typeof v === "string") { try { return JSON.parse(v); } catch { return []; } }
        return [];
      };
      const loaded = data.map(r => ({
        id:r.id, title:r.title, mode:r.mode,
        messages:parseArr(r.messages), history:parseArr(r.history)
      }));
      setChats(loaded); setActiveId(loaded[0].id);
    } else {
      const f = freshChat(); setChats([f]); setActiveId(f.id);
    }
    setLoading(p => ({ ...p, chats:false }));
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data:{ session } }) => {
      if (!session) { nav("/auth"); return; }
      setUser(session.user);
      await Promise.all([loadProfile(session.user.id), loadChats(session.user.id)]);
    });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange(async (ev, session) => {
      if (!session) { nav("/auth"); return; }
      if (ev === "TOKEN_REFRESHED") { setUser(session.user); loadProfile(session.user.id); }
    });
    return () => subscription.unsubscribe();
  }, [nav]);

  useEffect(() => {
    const h = () => { if (user) loadProfile(user.id); };
    window.addEventListener("focus", h);
    return () => window.removeEventListener("focus", h);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [active?.messages, busy]);

  useEffect(() => {
    const h = () => setCtx(null);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  /* ─── Chat persistence ─── */
  const save = useCallback((chat, uid) => {
    if (!uid || !chat) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase.from("chat_sessions").upsert(
        { id:chat.id, user_id:uid, title:chat.title, mode:chat.mode, messages:chat.messages, history:chat.history },
        { onConflict:"id" }
      );
    }, 800);
  }, []);

  const patch = useCallback((id, fn) => {
    setChats(prev => {
      const next = prev.map(c => c.id === id ? fn(c) : c);
      const u = next.find(c => c.id === id);
      if (u && user) save(u, user.id);
      return next;
    });
  }, [user, save]);

  /* ─── Chat actions ─── */
  const newChat = () => {
    const c = freshChat(mode);
    setChats(p => [c, ...p]); setActiveId(c.id);
    setInput(""); setStaged(null); setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const deleteChat = async id => {
    await supabase.from("chat_sessions").delete().eq("id", id);
    setChats(prev => {
      const rest = prev.filter(c => c.id !== id);
      if (!rest.length) { const f = freshChat(mode); setActiveId(f.id); return [f]; }
      if (id === activeId) setActiveId(rest[0].id);
      return rest;
    });
  };

  const renameChat = async (id, title) => {
    patch(id, c => ({ ...c, title })); setRenaming(null);
    await supabase.from("chat_sessions").update({ title }).eq("id", id);
  };

  /* ─── Helpers ─── */
  const canSend = () => profile && (profile.plan !== "free" || (profile.questions_used||0) < LIMIT);

  const getToken = async () => {
    const { data:{ session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  /* Download resume as image */
  const downloadResumeImage = async (msgText) => {
    try {
      const h2c = await getHtml2Canvas();
      const wrap = document.createElement("div");
      wrap.style.cssText = "position:fixed;left:-9999px;top:0;width:800px;padding:52px 60px;background:#fff;font-family:Inter,sans-serif;color:#222;font-size:13px;line-height:1.75;";
      const html = msgText
        .replace(/^## (.+)$/gm, '<h2 style="color:#e8185d;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:20px 0 5px;padding-bottom:5px;border-bottom:1.5px solid #ffe0e9">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:700;color:#111;margin:12px 0 3px">$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:#111">$1</strong>')
        .replace(/^[•\-] (.+)$/gm, '<div style="padding:1.5px 0 1.5px 16px;color:#333">&bull; $1</div>')
        .replace(/\n/g, "<br/>");
      wrap.innerHTML =
        '<div style="text-align:center;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #f0f0f0">' +
        '<div style="font-size:24px;font-weight:900;letter-spacing:-0.04em;color:#111">GEN<span style="color:#e8185d">-E</span></div>' +
        '<div style="font-size:10px;color:#aaa;margin-top:3px;letter-spacing:0.06em;text-transform:uppercase">AI-Generated Resume</div>' +
        '</div>' + html;
      document.body.appendChild(wrap);
      const canvas = await h2c(wrap, { scale:2, useCORS:true, backgroundColor:"#fff" });
      document.body.removeChild(wrap);
      const a = document.createElement("a");
      a.download = "resume-gene.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch(e) { alert("Image export failed: " + e.message); }
  };

  /* Save resume to vault */
  const saveResume = async ({ title, target_role, target_company, content_md }) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/api/resumes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ title, target_role, target_company, content_md }),
      });
      const data = await res.json();
      if (res.status === 403) { setUpgrade("resume_builder"); setSaveModal(null); return; }
      if (!res.ok) throw new Error((data.detail || data.error || "Save failed") + (data.code ? ` [${data.code}]` : ""));
      setSaveModal(null);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (e) {
      alert("Could not save resume: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  /* Edit a sent message */
  const startEdit  = (idx, text) => { setEditIdx(idx); setEditText(text); };
  const cancelEdit = () => { setEditIdx(null); setEditText(""); };
  const saveEdit   = async (chatId, idx) => {
    const txt = editText.trim();
    if (!txt) return;
    cancelEdit();
    patch(chatId, c => ({
      ...c,
      messages: c.messages.slice(0, idx),
      history:  c.history.slice(0, idx),
    }));
    await send(txt, chatId, mode, null);
  };

  const stageFile = file => {
    if (!file) return;
    setShowAttach(false);
    if ((profile?.plan || "free") === "free") { setUpgrade("resume_review"); return; }
    const s = { file, name:file.name, size:file.size, previewUrl:null };
    if (isImgExt(file.name)) {
      const r = new FileReader();
      r.onload = e => setStaged({ ...s, previewUrl:e.target.result });
      r.readAsDataURL(file);
    } else { setStaged(s); }
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const fetchWithTimeout = async (url, options = {}, timeoutMs = 60000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  /* ─── Core send ─── */
  const send = async (txt = input, chatId = activeId, chatMode = mode, stagedArg = staged) => {
    const msg = txt.trim();
    if ((!msg && !stagedArg) || busy) return;
    if (!canSend()) { setUpgrade("limit"); return; }
    setInput(""); setStaged(null);

    /* ── File upload path ── */
    if (stagedArg) {
      const userText = msg
        ? `${isImgExt(stagedArg.name) ? "🖼️" : "📄"} **${stagedArg.name}**\n\n${msg}`
        : `${isImgExt(stagedArg.name) ? "🖼️" : "📄"} Uploaded: **${stagedArg.name}**`;

      patch(chatId, c => ({
        ...c,
        messages:[...c.messages, { role:"user", text:userText, imagePreview:isImgExt(stagedArg.name)?stagedArg.previewUrl:null }],
      }));
      setBusy(true);

      try {
        const token = await getToken();
        await wakeServer();
        const fd = new FormData();
        fd.append("file", stagedArg.file);
        if (msg) fd.append("note", msg);

        const res = await fetchWithTimeout(
          `${API}/api/upload`,
          { method:"POST", body:fd, headers: token ? { Authorization:`Bearer ${token}` } : {} },
          90000
        );

        let data;
        try { data = await res.json(); } catch {
          data = { reply: "The server returned an unexpected response. Please try again in a moment." };
        }

        if (res.status === 403 && data.gate) {
          patch(chatId, c => ({ ...c, messages: c.messages.slice(0, -1) }));
          setUpgrade(data.gate); setBusy(false); return;
        }

        const replyText = data.reply || data.error || "Upload failed — please try again.";
        patch(chatId, c => ({
          ...c,
          messages:[...c.messages, { role:"assistant", text:replyText }],
          history:[...c.history,
            { role:"user",      content: msg ? `[FILE: ${stagedArg.name}] ${msg}` : `[FILE: ${stagedArg.name}]` },
            { role:"assistant", content: replyText }
          ]
        }));
      } catch (err) {
        const isTimeout = err.name === "AbortError";
        const errMsg = isTimeout
          ? "⏳ The server took too long to respond (Render free tier waking up).\n\nPlease **wait 30 seconds** and try uploading again."
          : "Upload failed. Please check your connection and try again.";
        patch(chatId, c => ({ ...c, messages:[...c.messages, { role:"assistant", text:errMsg }] }));
      } finally {
        setBusy(false);
      }
      return;
    }

    /* ── Text path ── */
    const hist = chats.find(c => c.id === chatId)?.history || [];
    const isFirst = !(chats.find(c => c.id === chatId)?.messages || []).some(m => m.role === "user");
    if (isFirst) patch(chatId, c => ({ ...c, title: msg.slice(0,44) + (msg.length>44?"…":"") }));

    patch(chatId, c => ({
      ...c,
      messages:[...c.messages, { role:"user", text:msg }],
      history:[...c.history,   { role:"user", content:msg }]
    }));
    setBusy(true);

    if (isGreeting(msg) && hist.length === 0) {
      const reply = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      setTimeout(() => {
        patch(chatId, c => ({
          ...c,
          messages:[...c.messages, { role:"assistant", text:reply }],
          history:[...c.history,   { role:"assistant", content:reply }]
        }));
        setBusy(false);
      }, 300);
      return;
    }

    try {
      const token = await getToken();
      await wakeServer();

      patch(chatId, c => ({ ...c, messages:[...c.messages, { role:"assistant", text:"", streaming:true }] }));

      const res = await fetch(`${API}/api/chat`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body:JSON.stringify({ message:`[MODE:${chatMode}] ${msg}`, history:hist, session_id:chatId, mode:chatMode, lang }),
      });

      if (res.status === 403) {
        const d = await res.json().catch(() => ({}));
        patch(chatId, c => ({ ...c, messages:c.messages.filter(m => !m.streaming).slice(0,-1) }));
        if (d.error === "limit_reached") { setUpgrade(true); setBusy(false); return; }
      }

      if (!res.ok || !res.body) throw new Error("Server error " + res.status);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "", pdfLink = null, jobCards = null, wasGated = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream:true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const p = JSON.parse(line.slice(6));
            if (p.chunk) {
              fullText += p.chunk;
              patch(chatId, c => ({ ...c, messages:c.messages.map(m => m.streaming ? {...m, text:fullText} : m) }));
            }
            if (p.jobs)  jobCards = p.jobs;
            if (p.gate)  {
              wasGated = true;
              patch(chatId, c => ({ ...c, messages: c.messages.filter(m => !m.streaming) }));
              setUpgrade(p.gate);
              setBusy(false);
            }
            if (p.done)  pdfLink = p.pdf || null;
            if (p.error) fullText = p.error;
          } catch {}
        }
      }

      if (wasGated) return;

      patch(chatId, c => ({
        ...c,
        messages: c.messages.map(m => m.streaming
          ? { role:"assistant", text:fullText || "No response. Please try again.", pdf:pdfLink, jobs:jobCards }
          : m
        ),
        history: [...c.history, { role:"assistant", content:fullText }],
      }));

      if (profile?.plan === "free") setProfile(p => p ? {...p, questions_used:(p.questions_used||0)+1} : p);

    } catch (err) {
      patch(chatId, c => ({
        ...c,
        messages: c.messages.filter(m => !m.streaming).concat([{
          role:"assistant",
          text:"⚠️ Could not reach server. Please try again.\n\n*(" + err.message + ")*"
        }]),
      }));
    } finally { setBusy(false); }
  };

  const sendTool = async tool => {
    if (!canSend()) { setUpgrade("limit"); return; }
    const p = profile?.plan || "free";
    if (tool.mode === "RESUME"    && p === "free")    { setUpgrade("resume_builder");    return; }
    if (tool.mode === "INTERVIEW" && p === "free")    { setUpgrade("interview_advanced"); return; }
    if (tool.label === "Job Match" && p !== "yearly") { setUpgrade("job_search");         return; }
    const c = freshChat(tool.mode);
    setChats(prev => [c,...prev]); setActiveId(c.id); setMode(tool.mode); setSidebarOpen(false);
    setTimeout(() => send(tool.body, c.id, tool.mode, null), 80);
  };

  const handleSignOut = async () => { await signOut(); nav("/auth"); };

  /* ─── Sidebar grouping ─── */
  const groupedChats = (() => {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yday  = new Date(+today - 864e5);
    const w7    = new Date(+today - 6*864e5);
    const m30   = new Date(+today - 29*864e5);
    const g = { "Today":[], "Yesterday":[], "Last 7 days":[], "Last 30 days":[], "Older":[] };
    const filtered = chats.filter(c => c.title.toLowerCase().includes(searchQ.toLowerCase()));
    filtered.forEach(c => {
      const d = new Date(parseInt(c.id.split("-")[1]) || 0);
      if      (d >= today) g["Today"].push(c);
      else if (d >= yday)  g["Yesterday"].push(c);
      else if (d >= w7)    g["Last 7 days"].push(c);
      else if (d >= m30)   g["Last 30 days"].push(c);
      else                 g["Older"].push(c);
    });
    return g;
  })();

  const curMode   = MODES.find(m => m.id === mode);
  const isLoading = loading.profile || loading.chats;

  if (isLoading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",
      height:"100vh",background:"#fff",flexDirection:"column",gap:10 }}>
      <div style={{ width:36,height:36,borderRadius:10,background:PINK,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontWeight:900,fontSize:12,color:"#fff",letterSpacing:"-0.03em" }}>GE</div>
      <div style={{ color:"#ccc",fontSize:13 }}>Loading…</div>
    </div>
  );

  /* ─── SIDEBAR ─── */
  const Sidebar = () => (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",
      background:"#fff",borderRight:"1px solid #f0f0f0",overflow:"hidden" }}>

      {/* Header */}
      <div style={{ padding:"14px 14px 10px",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
          <div style={{ fontWeight:800,fontSize:16,color:"#111",letterSpacing:"-0.03em" }}>
            GEN<span style={{ color:PINK }}>-E</span>
          </div>
          <button onClick={newChat} title="New chat"
            style={{ width:28,height:28,borderRadius:7,border:"1.5px solid #e5e7eb",
              background:"#fff",cursor:"pointer",fontSize:14,color:"#bbb",
              display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=PINK; e.currentTarget.style.color=PINK; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#bbb"; }}>
            +
          </button>
        </div>
        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
          placeholder="Search chats…"
          style={{ width:"100%",padding:"7px 10px",background:"#f9fafb",
            border:"1px solid #f0f0f0",borderRadius:8,fontSize:12.5,
            color:"#555",outline:"none" }} />
      </div>

      {/* Chat list */}
      <div style={{ flex:1,overflowY:"auto",padding:"0 8px" }} className="sb-scroll">
        {Object.entries(groupedChats).map(([grp, list]) => {
          if (!list.length) return null;
          return (
            <div key={grp} style={{ marginBottom:12 }}>
              <div style={{ padding:"6px 6px 2px",fontSize:10,fontWeight:600,
                color:"#ccc",letterSpacing:"0.06em",textTransform:"uppercase" }}>
                {grp}
              </div>
              {list.map(chat => {
                const isAct = chat.id === activeId;
                return (
                  <div key={chat.id}
                    onClick={() => { setActiveId(chat.id); setSidebarOpen(false); }}
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtx({ x:e.clientX, y:e.clientY, id:chat.id }); }}
                    style={{ display:"flex",alignItems:"center",padding:"6px 8px",
                      borderRadius:8,cursor:"pointer",marginBottom:1,
                      background:isAct?"#fff5f7":"transparent",userSelect:"none" }}>
                    <span style={{ flex:1,fontSize:12.5,
                      color:isAct?PINK:"#555",fontWeight:isAct?600:400,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                      {chat.title}
                    </span>
                    <button
                      onClick={e=>{ e.stopPropagation(); setCtx({ x:e.clientX, y:e.clientY, id:chat.id }); }}
                      style={{ opacity:0,background:"none",border:"none",color:"#ccc",
                        cursor:"pointer",fontSize:14,padding:"0 2px",flexShrink:0,
                        borderRadius:4,lineHeight:1 }}
                      className="row-more">
                      ⋯
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {!Object.values(groupedChats).some(g=>g.length) && (
          <div style={{ padding:"32px 12px",textAlign:"center",color:"#ddd",fontSize:12 }}>
            No chats yet.<br/>
            <button onClick={newChat} style={{ color:PINK,background:"none",border:"none",
              cursor:"pointer",fontSize:12,fontWeight:600,marginTop:4 }}>Start one →</button>
          </div>
        )}
      </div>

      {/* Tools */}
      <div style={{ padding:"10px 12px 6px",borderTop:"1px solid #f5f5f5",flexShrink:0 }}>
        {/* Nav Links */}
        <div style={{ display:"flex",flexDirection:"column",gap:3,marginBottom:10 }}>
          {[
            { icon:"📄", label:"Resume Vault", path:"/resumes", pro:true  },
            { icon:"📊", label:"Job Tracker",  path:"/jobs",    pro:false },
          ].map(item => {
            const locked = item.pro && (profile?.plan || "free") === "free";
            return (
              <button key={item.path}
                onClick={() => locked ? setUpgrade("resume_builder") : nav(item.path)}
                style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 10px",
                  background:"none",border:"1px solid #f0f0f0",borderRadius:8,
                  cursor:"pointer",textAlign:"left",fontSize:12,
                  color:locked?"#bbb":"#555",fontWeight:500,transition:"all 0.12s" }}
                onMouseEnter={e=>{ if(!locked){ e.currentTarget.style.background="#fff5f7"; e.currentTarget.style.borderColor="#fcc"; e.currentTarget.style.color=PINK; }}}
                onMouseLeave={e=>{ if(!locked){ e.currentTarget.style.background="none"; e.currentTarget.style.borderColor="#f0f0f0"; e.currentTarget.style.color="#555"; }}}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {locked && <span style={{marginLeft:"auto",fontSize:10}}>🔒</span>}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize:10,fontWeight:600,color:"#ccc",letterSpacing:"0.06em",
          textTransform:"uppercase",marginBottom:6 }}>Quick Tools</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5 }}>
          {TOOLS.slice(0,6).map(t => {
            const tp = profile?.plan || "free";
            const locked =
              ((t.mode === "RESUME" || t.mode === "INTERVIEW") && tp === "free") ||
              (t.label === "Job Match" && tp !== "yearly");
            return (
              <button key={t.label} onClick={() => sendTool(t)}
                style={{ padding:"7px 9px",borderRadius:8,border:"1px solid #f0f0f0",
                  background:"#fff",cursor:"pointer",textAlign:"left",fontSize:11.5,
                  color:locked?"#bbb":"#555",fontWeight:500,transition:"all 0.12s" }}
                onMouseEnter={e=>{ if(!locked){ e.currentTarget.style.background="#fff5f7"; e.currentTarget.style.borderColor="#fcc"; e.currentTarget.style.color=PINK; }}}
                onMouseLeave={e=>{ if(!locked){ e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#f0f0f0"; e.currentTarget.style.color="#555"; }}}>
                {t.label}{locked ? " 🔒" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* User */}
      <div style={{ padding:"10px 12px 14px",borderTop:"1px solid #f5f5f5",flexShrink:0 }}>
        {profile?.plan === "free" && (
          <div style={{ marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:10.5,color:"#bbb",marginBottom:4 }}>
              <span>{profile.questions_used||0} / {LIMIT} questions</span>
              <span style={{ color:(profile.questions_used||0)>=18?PINK:"#bbb" }}>
                {Math.max(0,LIMIT-(profile.questions_used||0))} left
              </span>
            </div>
            <div style={{ height:3,background:"#f0f0f0",borderRadius:4 }}>
              <div style={{ height:3,borderRadius:4,background:PINK,
                width:`${Math.min(100,((profile.questions_used||0)/LIMIT)*100)}%`,
                transition:"width 0.4s" }}/>
            </div>
            <button onClick={() => nav("/pricing")}
              style={{ marginTop:8,width:"100%",padding:"7px 0",background:PINK,
                border:"none",borderRadius:8,fontSize:11.5,color:"#fff",
                cursor:"pointer",fontWeight:700 }}>
              Upgrade to Pro
            </button>
          </div>
        )}

        <div style={{ display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:30,height:30,borderRadius:"50%",background:"#f5f5f5",
            border:`2px solid ${PINK}22`,flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#555",fontWeight:700,fontSize:12 }}>
            {(profile?.full_name||user?.email||"U").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12,fontWeight:600,color:"#222",
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
              {profile?.full_name||user?.email?.split("@")[0]}
            </div>
            <PlanBadge plan={profile?.plan||"free"} />
          </div>
          <div style={{ display:"flex",gap:4 }}>
            {profile?.plan !== "free" && (
              <button onClick={()=>nav("/pricing")} title="Manage plan"
                style={{ fontSize:11,color:"#bbb",background:"none",border:"none",
                  cursor:"pointer",padding:"4px 6px",borderRadius:6 }}
                onMouseEnter={e=>e.currentTarget.style.color=PINK}
                onMouseLeave={e=>e.currentTarget.style.color="#bbb"}>Plan</button>
            )}
            <button onClick={handleSignOut} title="Sign out"
              style={{ fontSize:11,color:"#bbb",background:"none",border:"none",
                cursor:"pointer",padding:"4px 6px",borderRadius:6 }}
              onMouseEnter={e=>e.currentTarget.style.color="#e55"}
              onMouseLeave={e=>e.currentTarget.style.color="#bbb"}>Out</button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── RENDER ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;font-family:'Inter',sans-serif;background:#fff;color:#111}

        .sb-scroll::-webkit-scrollbar{width:0}
        .sb-scroll:hover::-webkit-scrollbar{width:3px}
        .sb-scroll::-webkit-scrollbar-thumb{background:#eee;border-radius:4px}
        .chat-scroll::-webkit-scrollbar{width:4px}
        .chat-scroll::-webkit-scrollbar-thumb{background:#f0f0f0;border-radius:4px}
        div:hover > span + .row-more { opacity: 1 !important; }

        .starter{padding:14px 16px;border:1.5px solid #f3f4f6;border-radius:14px;
          cursor:pointer;text-align:left;background:#fff;transition:all 0.13s}
        .starter:hover{border-color:#f9c;background:#fff8fa;transform:translateY(-1px);
          box-shadow:0 4px 16px rgba(232,24,93,0.07)}

        .md-ai p{margin-bottom:8px;line-height:1.72;font-size:14px;color:#374151}
        .md-ai p:last-child{margin-bottom:0}
        .md-ai h2{font-size:11px;font-weight:700;color:${PINK};margin:14px 0 5px;
          text-transform:uppercase;letter-spacing:0.07em}
        .md-ai h3{font-size:13.5px;font-weight:700;color:#111;margin:12px 0 4px}
        .md-ai ul,.md-ai ol{padding-left:20px;margin-bottom:8px}
        .md-ai li{margin-bottom:4px;line-height:1.65;font-size:14px;color:#374151}
        .md-ai strong{color:#111;font-weight:700}
        .md-ai em{color:#6b7280}
        .md-ai code{background:#fef2f4;color:${PINK};padding:2px 6px;border-radius:4px;
          font-size:12px;font-family:monospace}
        .md-ai hr{border:none;border-top:1px solid #f3f4f6;margin:12px 0}
        .md-ai table{width:100%;border-collapse:collapse;margin:10px 0;font-size:13px}
        .md-ai th{background:#fef2f4;color:${PINK};padding:7px 10px;
          text-align:left;font-weight:700;border:1px solid #fcd5de}
        .md-ai td{padding:6px 10px;border:1px solid #f3f4f6;color:#374151}
        .md-ai blockquote{border-left:3px solid ${PINK};padding:4px 12px;
          color:#6b7280;margin:8px 0;background:#fef9fb;border-radius:0 6px 6px 0}

        .md-user p{margin:0;line-height:1.65;font-size:14px}
        .md-user strong{color:#fff;font-weight:700}
        .md-user code{background:rgba(255,255,255,0.22);padding:1px 5px;border-radius:3px;font-size:12px}

        @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .msg-in{animation:fadeUp 0.18s ease}
        @keyframes blink{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
        .d1{animation:blink 1.1s infinite}
        .d2{animation:blink 1.1s 0.18s infinite}
        .d3{animation:blink 1.1s 0.36s infinite}
        @keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
        .streaming-msg::after{content:"▋";color:#e8185d;animation:cur 0.7s infinite;margin-left:2px;font-size:13px}
        .msg-wrap:hover .edit-btn{opacity:1!important}
        .edit-btn:hover{color:#e8185d!important;background:rgba(255,255,255,0.25)!important}

        .desktop-sb{display:flex}
        .mob-btn{display:none!important}
        .sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:199}
        .sb-overlay.open{display:block}
        .sb-drawer{position:fixed;top:0;left:0;height:100%;width:248px;z-index:200;
          transform:translateX(-100%);transition:transform 0.22s ease;
          box-shadow:4px 0 24px rgba(0,0,0,0.08)}
        .sb-drawer.open{transform:translateX(0)}
        @media(max-width:720px){
          .desktop-sb{display:none!important}
          .mob-btn{display:flex!important}
        }
      `}</style>

      {/* ── Modals & Toasts ── */}
      {upgrade && (
        <UpgradeModal
          feature={upgrade}
          onClose={() => setUpgrade(false)}
          onUpgrade={() => { setUpgrade(false); nav("/pricing"); }}
        />
      )}
      {saveModal && (
        <SaveResumeModal
          defaultText={saveModal.text}
          saving={saving}
          onClose={() => setSaveModal(null)}
          onSave={saveResume}
        />
      )}
      {savedToast && (
        <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
          background:"#15803d",color:"#fff",padding:"10px 20px",borderRadius:10,
          fontSize:13,fontWeight:700,zIndex:999,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
          display:"flex",alignItems:"center",gap:8 }}>
          ✅ Resume saved to Vault!
          <button onClick={()=>nav("/resumes")}
            style={{ background:"none",border:"none",color:"#fff",
              textDecoration:"underline",cursor:"pointer",fontSize:13 }}>
            View →
          </button>
        </div>
      )}
      {renaming && (
        <RenameModal
          chat={chats.find(c=>c.id===renaming)}
          onSave={t=>renameChat(renaming,t)}
          onClose={()=>setRenaming(null)}
        />
      )}
      {ctx && (
        <CtxMenu
          x={ctx.x} y={ctx.y}
          onRename={() => setRenaming(ctx.id)}
          onDelete={() => deleteChat(ctx.id)}
          onClose={() => setCtx(null)}
        />
      )}

      <div style={{ display:"flex",height:"100vh",overflow:"hidden" }}>

        {/* Desktop sidebar */}
        <aside className="desktop-sb"
          style={{ width:248,flexShrink:0,flexDirection:"column",overflow:"hidden" }}>
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        <div className={`sb-overlay ${sidebarOpen?"open":""}`} onClick={()=>setSidebarOpen(false)}/>
        <div className={`sb-drawer ${sidebarOpen?"open":""}`}><Sidebar /></div>

        {/* ─── MAIN AREA ─── */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0 }}>

          {/* Topbar */}
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"0 18px",
            height:52,borderBottom:"1px solid #f3f4f6",background:"#fff",flexShrink:0 }}>
            <button className="mob-btn" onClick={()=>setSidebarOpen(true)}
              style={{ background:"none",border:"none",fontSize:20,cursor:"pointer",
                color:"#999",padding:"4px",display:"none",alignItems:"center" }}>
              ☰
            </button>
            <div style={{ display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0 }}>
              <span style={{ fontSize:12,fontWeight:600,color:PINK,
                background:"#fff5f7",padding:"2px 9px",borderRadius:20,
                border:"1px solid #fcc",flexShrink:0 }}>
                {curMode?.long}
              </span>
              <span style={{ fontSize:13,color:"#bbb",
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                {active?.title||"New Chat"}
              </span>
            </div>
            <div style={{ display:"flex",gap:5,alignItems:"center",flexShrink:0 }}>
              {profile?.plan === "free" ? (
                <button onClick={()=>nav("/pricing")}
                  style={{ padding:"4px 11px",background:"#fff5f7",border:"1px solid #fcc",
                    borderRadius:20,fontSize:11,color:PINK,cursor:"pointer",fontWeight:700 }}>
                  {Math.max(0,LIMIT-(profile.questions_used||0))} left
                </button>
              ) : <PlanBadge plan={profile?.plan}/>}
              <LanguagePicker lang={lang} setLang={setLang} open={langOpen} setOpen={setLangOpen} />
              <button onClick={newChat} title="New chat"
                style={{ width:28,height:28,background:"#f9fafb",border:"1px solid #e5e7eb",
                  borderRadius:8,cursor:"pointer",color:"#aaa",fontSize:14,
                  display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=PINK; e.currentTarget.style.color=PINK; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#aaa"; }}>
                +
              </button>
            </div>
          </div>

          {/* ─── Messages / Welcome ─── */}
          {(!active || !active.messages.length) && !busy ? (
            <div className="chat-scroll"
              style={{ flex:1,overflowY:"auto",display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",padding:"40px 24px",gap:28 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontWeight:800,fontSize:26,color:"#111",
                  letterSpacing:"-0.04em",marginBottom:8 }}>
                  GEN<span style={{color:PINK}}>-E</span>
                </div>
                <div style={{ fontSize:15,fontWeight:500,color:"#555",marginBottom:6 }}>
                  AI Career Intelligence
                </div>
                <div style={{ fontSize:13.5,color:"#aaa",maxWidth:380,lineHeight:1.7,margin:"0 auto" }}>
                  {profile?.full_name ? `Hey ${profile.full_name.split(" ")[0]}! ` : ""}
                  Career guidance, ATS resumes, interview prep &amp; readiness scoring — all in one place.
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
                gap:10,width:"100%",maxWidth:580 }}>
                {STARTERS.map(s => (
                  <button key={s.title} className="starter"
                    onClick={() => {
                      const pl = profile?.plan || "free";
                      if (s.mode === "RESUME"    && pl === "free") { setUpgrade("resume_builder");    return; }
                      if (s.mode === "INTERVIEW" && pl === "free") { setUpgrade("interview_advanced"); return; }
                      setMode(s.mode); send(s.body, activeId, s.mode, null);
                    }}>
                    <div style={{ fontSize:12,fontWeight:700,color:"#111",marginBottom:4 }}>{s.title}</div>
                    <div style={{ fontSize:11.5,color:"#aaa",lineHeight:1.55 }}>{s.body.slice(0,54)}…</div>
                  </button>
                ))}
              </div>

              <div style={{ display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center" }}>
                {MODES.map(m => (
                  <button key={m.id}
                    onClick={() => {
                      if ((m.id === "RESUME" || m.id === "INTERVIEW") && (profile?.plan || "free") === "free") {
                        setUpgrade(m.id === "RESUME" ? "resume_builder" : "interview_advanced");
                      } else { setMode(m.id); }
                    }}
                    style={{ padding:"5px 13px",borderRadius:20,cursor:"pointer",fontSize:12,
                      border:`1.5px solid ${mode===m.id?PINK:"#e5e7eb"}`,
                      background:mode===m.id?"#fff5f7":"#fff",
                      color:mode===m.id?PINK:"#aaa",fontWeight:mode===m.id?700:400,
                      transition:"all 0.12s" }}>
                    {m.long}{(m.id==="RESUME"||m.id==="INTERVIEW")&&(profile?.plan||"free")==="free"?" 🔒":""}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-scroll"
              style={{ flex:1,overflowY:"auto",padding:"24px 20px 12px" }}>
              <div style={{ maxWidth:720,margin:"0 auto",display:"flex",flexDirection:"column",gap:18 }}>
                {active?.messages.map((msg, i) => (
                  <div key={i} className="msg-in"
                    style={{ display:"flex",
                      justifyContent:msg.role==="user"?"flex-end":"flex-start",
                      alignItems:"flex-start",gap:10 }}>

                    {msg.role === "assistant" && (
                      <div style={{ width:28,height:28,borderRadius:8,background:PINK,flexShrink:0,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:900,fontSize:9,color:"#fff",marginTop:2,letterSpacing:"-0.03em" }}>
                        GE
                      </div>
                    )}

                    <div style={{ maxWidth:"80%",display:"flex",flexDirection:"column",
                      alignItems:msg.role==="user"?"flex-end":"flex-start",gap:5 }}>
                      {msg.imagePreview && (
                        <img src={msg.imagePreview} alt=""
                          style={{ maxWidth:220,maxHeight:160,objectFit:"cover",
                            borderRadius:10,border:"1px solid #f0f0f0" }} />
                      )}
                      <div className="msg-wrap" style={{ position:"relative" }}>
                        <div style={{ padding:"11px 15px",borderRadius:14,fontSize:14,lineHeight:1.7,
                          ...(msg.role==="user"
                            ? { background:PINK,color:"#fff",borderBottomRightRadius:4,boxShadow:`0 2px 12px ${PINK}30` }
                            : { background:"#f9fafb",color:"#111",border:"1px solid #f3f4f6",borderBottomLeftRadius:4 }) }}>

                          {msg.role==="user" && editIdx===i ? (
                            <div>
                              <textarea autoFocus value={editText} onChange={e=>setEditText(e.target.value)}
                                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();saveEdit(activeId,i);} if(e.key==="Escape") cancelEdit(); }}
                                style={{ width:"100%",minHeight:60,background:"rgba(255,255,255,0.15)",
                                  border:"1px solid rgba(255,255,255,0.4)",borderRadius:8,
                                  padding:"6px 10px",color:"#fff",fontSize:14,lineHeight:1.55,
                                  fontFamily:"inherit",resize:"vertical",outline:"none" }}/>
                              <div style={{ display:"flex",gap:6,marginTop:6,justifyContent:"flex-end" }}>
                                <button onClick={cancelEdit}
                                  style={{ padding:"4px 10px",background:"rgba(255,255,255,0.15)",
                                    border:"1px solid rgba(255,255,255,0.3)",borderRadius:6,
                                    color:"#fff",fontSize:11,cursor:"pointer" }}>Cancel</button>
                                <button onClick={()=>saveEdit(activeId,i)}
                                  style={{ padding:"4px 10px",background:"#fff",border:"none",
                                    borderRadius:6,color:PINK,fontSize:11,fontWeight:700,cursor:"pointer" }}>Send ↑</button>
                              </div>
                            </div>
                          ) : (
                            <div className={msg.role==="user" ? "md-user" : ("md-ai" + (msg.streaming ? " streaming-msg" : ""))}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                            </div>
                          )}

                          {/* PDF download */}
                          {msg.pdf && profile?.plan !== "free" && (
                            <a href={`${API}${msg.pdf}`} target="_blank" rel="noopener noreferrer"
                              style={{ display:"inline-flex",alignItems:"center",gap:5,marginTop:12,
                                padding:"6px 14px",background:"rgba(255,255,255,0.2)",color:"#fff",
                                borderRadius:8,fontSize:12,fontWeight:700,textDecoration:"none",
                                border:"1px solid rgba(255,255,255,0.3)" }}>
                              Download Resume PDF
                            </a>
                          )}
                          {msg.pdf && profile?.plan === "free" && (
                            <button onClick={()=>nav("/pricing")}
                              style={{ marginTop:10,padding:"6px 14px",background:"#f5f3ff",
                                border:"1px solid #ddd6fe",color:"#7c3aed",borderRadius:8,
                                fontSize:12,fontWeight:700,cursor:"pointer" }}>
                              Upgrade to download PDF
                            </button>
                          )}

                          {/* ── Resume action buttons (Image download + Save to Vault) ── */}
                          {msg.role==="assistant" && msg.text?.includes("##") && msg.text?.length > 400 && !msg.streaming && (
                            <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginTop:8 }}>
                              <button onClick={()=>downloadResumeImage(msg.text)}
                                style={{ display:"inline-flex",alignItems:"center",gap:4,
                                  padding:"5px 12px",background:"#f0fdf4",border:"1px solid #86efac",
                                  color:"#15803d",borderRadius:8,fontSize:11.5,fontWeight:700,cursor:"pointer" }}>
                                🖼️ Download as Image
                              </button>
                              {profile?.plan !== "free" && (
                                <button onClick={() => setSaveModal({ text: msg.text })}
                                  style={{ display:"inline-flex",alignItems:"center",gap:4,
                                    padding:"5px 12px",background:"#f0fdf4",border:"1px solid #bbf7d0",
                                    borderRadius:8,cursor:"pointer",fontSize:11.5,color:"#15803d",fontWeight:700 }}>
                                  💾 Save to Vault
                                </button>
                              )}
                            </div>
                          )}

                          {/* Inline job cards */}
                          {msg.role==="assistant" && msg.jobs?.length > 0 && (
                            <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:8 }}>
                              <div style={{ fontSize:10.5,fontWeight:700,color:"#aaa",letterSpacing:"0.06em",
                                textTransform:"uppercase",marginBottom:2 }}>
                                {msg.jobs.length} Live Opening{msg.jobs.length!==1?"s":""} Found
                              </div>
                              {msg.jobs.map(j => (
                                <a key={j.id} href={j.url} target="_blank" rel="noopener noreferrer"
                                  style={{ display:"block",textDecoration:"none",background:"#fff",
                                    border:"1.5px solid #efefef",borderRadius:12,padding:"12px 14px" }}
                                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="#fcc"; e.currentTarget.style.boxShadow="0 3px 12px rgba(232,24,93,0.08)"; }}
                                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="#efefef"; e.currentTarget.style.boxShadow="none"; }}>
                                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
                                    <div style={{ flex:1,minWidth:0 }}>
                                      <div style={{ fontSize:13,fontWeight:700,color:"#111",
                                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                                        {j.title}
                                      </div>
                                      <div style={{ fontSize:11.5,color:"#666",marginTop:2 }}>
                                        {j.company}&nbsp;·&nbsp;{j.location}
                                      </div>
                                    </div>
                                    <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0 }}>
                                      {j.remote && (
                                        <span style={{ fontSize:9.5,background:"#f0fdf4",color:"#15803d",
                                          padding:"2px 7px",borderRadius:20,fontWeight:600,border:"1px solid #86efac" }}>
                                          Remote
                                        </span>
                                      )}
                                      <span style={{ fontSize:9.5,background:"#f9fafb",color:"#bbb",
                                        padding:"2px 7px",borderRadius:20,border:"1px solid #f0f0f0" }}>
                                        {j.source}
                                      </span>
                                    </div>
                                  </div>
                                  {j.salary && (
                                    <div style={{ fontSize:11.5,color:PINK,fontWeight:700,marginTop:5 }}>{j.salary}</div>
                                  )}
                                  {j.tags?.length > 0 && (
                                    <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginTop:6 }}>
                                      {j.tags.slice(0,4).map(t => (
                                        <span key={t} style={{ fontSize:9.5,background:"#f5f5f5",
                                          color:"#666",padding:"2px 7px",borderRadius:20 }}>{t}</span>
                                      ))}
                                    </div>
                                  )}
                                  <div style={{ marginTop:8,fontSize:10.5,color:PINK,fontWeight:600 }}>
                                    Apply → {j.source}
                                  </div>
                                </a>
                              ))}
                              <div style={{ fontSize:10,color:"#ccc",textAlign:"center",paddingTop:2 }}>
                                Live from Remotive · Arbeitnow · Adzuna · Results may vary
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Edit pencil */}
                        {msg.role==="user" && editIdx!==i && (
                          <button onClick={()=>startEdit(i, msg.text)}
                            className="edit-btn"
                            title="Edit message"
                            style={{ position:"absolute",top:6,left:-30,width:22,height:22,opacity:0,
                              background:"rgba(0,0,0,0.06)",border:"none",borderRadius:6,cursor:"pointer",
                              color:"#888",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",
                              transition:"opacity 0.15s" }}>
                            ✎
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {busy && !active?.messages?.some(m => m.streaming) && (
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:28,height:28,borderRadius:8,background:PINK,flexShrink:0,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontWeight:900,fontSize:9,color:"#fff",letterSpacing:"-0.03em" }}>GE</div>
                    <div style={{ padding:"10px 14px",background:"#f9fafb",border:"1px solid #f3f4f6",
                      borderRadius:14,borderBottomLeftRadius:4,display:"flex",gap:4,alignItems:"center" }}>
                      {["d1","d2","d3"].map(c => (
                        <div key={c} className={c}
                          style={{ width:5,height:5,borderRadius:"50%",background:"#d1d5db" }}/>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
            </div>
          )}

          {/* ─── INPUT ─── */}
          <div style={{ padding:"10px 20px 16px",background:"#fff",flexShrink:0,
            borderTop:"1px solid #f3f4f6" }}>
            <div style={{ maxWidth:720,margin:"0 auto" }}>

              {staged && (
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8,
                  padding:"6px 12px",background:"#fff5f7",borderRadius:10,border:"1px solid #fcc" }}>
                  {staged.previewUrl
                    ? <img src={staged.previewUrl} alt="" style={{ width:32,height:32,objectFit:"cover",borderRadius:6,flexShrink:0 }}/>
                    : <span style={{ fontSize:18,flexShrink:0 }}>📄</span>
                  }
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:12,fontWeight:600,color:"#333",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                      {staged.name}
                    </div>
                    <div style={{ fontSize:10.5,color:"#bbb" }}>Add a message or send as-is</div>
                  </div>
                  <button onClick={()=>{ setStaged(null); inputRef.current?.focus(); }}
                    style={{ background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:18,lineHeight:1,flexShrink:0 }}
                    onMouseEnter={e=>e.currentTarget.style.color=PINK}
                    onMouseLeave={e=>e.currentTarget.style.color="#ccc"}>
                    ×
                  </button>
                </div>
              )}

              <div style={{ display:"flex",alignItems:"flex-end",gap:8,background:"#f9fafb",
                border:"1.5px solid #e5e7eb",borderRadius:14,padding:"8px 8px 8px 14px",
                transition:"border-color 0.15s" }}
                onFocusCapture={e=>e.currentTarget.style.borderColor="#fcc"}
                onBlurCapture={e=>e.currentTarget.style.borderColor="#e5e7eb"}>

                <div style={{ position:"relative",flexShrink:0 }}>
                  <button onClick={()=>setShowAttach(v=>!v)} title="Attach file"
                    style={{ width:32,height:32,background:"#fff",border:"1px solid #e5e7eb",
                      borderRadius:8,cursor:"pointer",color:staged?PINK:"#bbb",fontSize:15,
                      display:"flex",alignItems:"center",justifyContent:"center" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=PINK; e.currentTarget.style.color=PINK; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color=staged?PINK:"#bbb"; }}>
                    📎
                  </button>

                  {showAttach && (
                    <div onClick={e=>e.stopPropagation()}
                      style={{ position:"absolute",bottom:40,left:0,background:"#fff",
                        border:"1px solid #f0f0f0",borderRadius:12,padding:6,
                        minWidth:210,zIndex:50,boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>
                      <div style={{ fontSize:10,fontWeight:600,color:"#ccc",
                        padding:"3px 8px 6px",letterSpacing:"0.06em",textTransform:"uppercase" }}>
                        Attach
                      </div>
                      {[
                        ["Image / Screenshot",        ".png,.jpg,.jpeg,.webp,.gif"],
                        ["Resume / CV (PDF, DOCX)",    ".pdf,.doc,.docx,.txt"],
                        ["Job Description",            ".pdf,.docx,.txt"],
                      ].map(([lbl, acc]) => (
                        <label key={lbl}
                          style={{ display:"flex",alignItems:"center",padding:"8px 10px",
                            fontSize:12.5,color:"#444",borderRadius:8,cursor:"pointer" }}
                          onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          {lbl}
                          <input type="file" style={{ display:"none" }} accept={acc}
                            onChange={e=>{ if(e.target.files[0]) stageFile(e.target.files[0]); setShowAttach(false); }}/>
                        </label>
                      ))}
                      <div style={{ margin:"4px 8px",borderTop:"1px solid #f5f5f5" }}/>
                      <div style={{ padding:"3px 10px",fontSize:10.5,color:"#bbb",lineHeight:1.5 }}>
                        Attach → type your request → Send
                      </div>
                    </div>
                  )}
                </div>

                <textarea ref={inputRef} value={input} rows={1}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }}
                  placeholder={
                    staged       ? `Tell GEN-E what to do with "${staged.name.slice(0,28)}"…`
                    : canSend()  ? `Ask anything… (${curMode?.long})`
                    : "Upgrade to continue chatting"
                  }
                  disabled={!canSend() && !staged}
                  style={{ flex:1,background:"transparent",border:"none",resize:"none",
                    fontSize:14,lineHeight:1.55,color:"#111",outline:"none",
                    maxHeight:130,overflowY:"auto",minHeight:22,paddingTop:5,fontFamily:"inherit" }}/>

                {!canSend() && !staged ? (
                  <button onClick={() => nav("/pricing")}
                    style={{ height:32,padding:"0 14px",background:PINK,border:"none",
                      borderRadius:8,fontWeight:700,fontSize:12,color:"#fff",cursor:"pointer",flexShrink:0 }}>
                    Upgrade
                  </button>
                ) : (
                  <button onClick={() => send()}
                    disabled={busy || (!input.trim() && !staged)}
                    style={{ height:32,padding:"0 14px",flexShrink:0,
                      background:(busy||(!input.trim()&&!staged))?"#e5e7eb":PINK,
                      border:"none",borderRadius:8,fontWeight:700,fontSize:12,
                      color:(busy||(!input.trim()&&!staged))?"#aaa":"#fff",
                      cursor:(busy||(!input.trim()&&!staged))?"not-allowed":"pointer",
                      transition:"all 0.15s" }}>
                    {busy ? "…" : "Send"}
                  </button>
                )}
              </div>

              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                marginTop:8,flexWrap:"wrap",gap:6 }}>
                <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                  {MODES.map(m => (
                    <button key={m.id}
                      onClick={() => {
                        if ((m.id==="RESUME"||m.id==="INTERVIEW") && (profile?.plan||"free")==="free") {
                          setUpgrade(m.id==="RESUME" ? "resume_builder" : "interview_advanced");
                        } else { setMode(m.id); }
                      }}
                      style={{ padding:"3px 10px",borderRadius:20,cursor:"pointer",fontSize:11.5,
                        border:`1.5px solid ${mode===m.id?PINK:"#e5e7eb"}`,
                        background:mode===m.id?"#fff5f7":"transparent",
                        color:mode===m.id?PINK:"#bbb",fontWeight:mode===m.id?600:400,
                        transition:"all 0.12s" }}>
                      {m.long}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:10.5,color:"#ddd" }}>Enter to send · Shift+Enter new line</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
