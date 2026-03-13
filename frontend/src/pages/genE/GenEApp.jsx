import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { geneApi } from "../../lib/api";

const PINK = "#e8185d";
const B = "#f0f0f0";
const DARK = "#0a0a0a";

function cls(...args) { return args.filter(Boolean).join(" "); }

export default function GenEApp() {
  const [tab, setTab] = useState("chat");
  const [sideOpen, setSideOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── Chat state ────────────────────────────────────
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${user?.full_name?.split(" ")[0] || "there"}! I'm Gen-E, your AI career advisor.\n\nI can help you with career planning, resume analysis, job matching, skill gaps, and more.\n\nWhat would you like to work on today?` }
  ]);
  const [input, setInput]       = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId]     = useState(null);
  const chatEndRef = useRef(null);

  // ── Resume state ──────────────────────────────────
  const [resumeText, setResumeText]   = useState("");
  const [targetRole, setTargetRole]   = useState("");
  const [resumeScore, setResumeScore] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [pastResumes, setPastResumes] = useState([]);

  // ── Jobs state ────────────────────────────────────
  const [jobs, setJobs]           = useState([]);
  const [savedJobIds, setSavedJobIds] = useState({});  // { job_id: saved_job_db_id }
  const [jobsLoading, setJobsLoading] = useState(false);

  // ── Skills state ──────────────────────────────────
  const [skillsData, setSkillsData]   = useState(null);
  const [skillsLoading, setSkillsLoading] = useState(false);

  // ── Roadmap state ─────────────────────────────────
  const [roadmap, setRoadmap]         = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // ── Usage state ───────────────────────────────────
  const [usage, setUsage] = useState(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Load data when tab changes
  useEffect(() => {
    if (tab === "jobs" && !jobs.length)         loadJobs();
    if (tab === "skills" && !skillsData)        loadSkills();
    if (tab === "roadmap" && !roadmap)          loadRoadmap();
    if (tab === "resume" && !pastResumes.length) loadResumes();
  }, [tab]);

  // Load usage on mount
  useEffect(() => { loadUsage(); }, []);

  async function loadUsage() {
    try { const d = await geneApi.getUsage(); setUsage(d); } catch {}
  }

  async function loadResumes() {
    try { const d = await geneApi.getResumes(); setPastResumes(d.resumes || []); } catch {}
  }

  async function loadJobs() {
    setJobsLoading(true);
    try {
      const d = await geneApi.getJobs();
      setJobs(d.jobs || []);
      // Build map of saved jobs
      const savedMap = {};
      (d.saved_ids || []).forEach(id => { savedMap[id] = id; });
      setSavedJobIds(savedMap);
    } catch { setJobs([]); }
    setJobsLoading(false);
  }

  async function loadSkills() {
    setSkillsLoading(true);
    try { const d = await geneApi.getSkills(); setSkillsData(d); }
    catch { setSkillsData(null); }
    setSkillsLoading(false);
  }

  async function loadRoadmap() {
    setRoadmapLoading(true);
    try { const d = await geneApi.getRoadmap(); setRoadmap(d.roadmap); }
    catch { setRoadmap(null); }
    setRoadmapLoading(false);
  }

  // ── Send chat ─────────────────────────────────────
  async function sendMessage() {
    if (!input.trim() || chatLoading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setChatLoading(true);
    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const d = await geneApi.chat(apiMessages, sessionId);
      setMessages(prev => [...prev, { role: "assistant", content: d.reply }]);
      if (d.session_id && !sessionId) setSessionId(d.session_id);
      loadUsage();
    } catch (err) {
      const msg = err.status === 429
        ? `${err.data?.message || "Monthly AI limit reached."} Upgrade to Premium for unlimited access.`
        : "Something went wrong. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: msg }]);
    }
    setChatLoading(false);
  }

  // ── Analyze resume ────────────────────────────────
  async function analyzeResume() {
    if (!resumeText.trim()) return;
    setResumeLoading(true);
    setResumeScore(null);
    try {
      const d = await geneApi.analyzeResume(resumeText, targetRole, "My Resume");
      setResumeScore(d.analysis);
      loadResumes();
      loadUsage();
    } catch (err) {
      if (err.status === 429) {
        setResumeScore({ error: err.data?.message || "Monthly limit reached. Upgrade to Premium." });
      }
    }
    setResumeLoading(false);
  }

  // ── Toggle save job ───────────────────────────────
  async function toggleSaveJob(job) {
    const savedId = savedJobIds[job.id];
    if (savedId) {
      await geneApi.unsaveJob(savedId).catch(() => {});
      setSavedJobIds(prev => { const next = { ...prev }; delete next[job.id]; return next; });
    } else {
      try {
        const d = await geneApi.saveJob({
          job_title: job.title, company: job.company, location: job.location,
          job_type: job.type, salary: job.salary, match_score: job.match, tags: job.tags,
        });
        setSavedJobIds(prev => ({ ...prev, [job.id]: d.id }));
      } catch {}
    }
  }

  const TABS = [
    { id: "chat", icon: "◎", label: "AI Chat" },
    { id: "resume", icon: "◈", label: "Resume" },
    { id: "jobs", icon: "⬡", label: "Jobs" },
    { id: "skills", icon: "◉", label: "Skills" },
    { id: "roadmap", icon: "◇", label: "Roadmap" },
  ];

  const tabTitles = { chat: "AI Career Chat", resume: "Resume Analyzer", jobs: "Job Matches", skills: "Skill Gap Analysis", roadmap: "Career Roadmap" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .ge-app { display: flex; height: calc(100vh - 0px); font-family: 'Plus Jakarta Sans', sans-serif; background: #f7f7f7; overflow: hidden; }

        .ge-sidebar { width: 220px; background: #fff; border-right: 1px solid ${B}; display: flex; flex-direction: column; flex-shrink: 0; transition: width 0.2s; overflow: hidden; }
        .ge-sidebar.closed { width: 56px; }
        .ge-logo-row { display: flex; align-items: center; gap: 10px; padding: 16px 14px; border-bottom: 1px solid ${B}; }
        .ge-logo-dot { width: 28px; height: 28px; border-radius: 7px; background: ${PINK}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 800; flex-shrink: 0; }
        .ge-logo-text { font-size: 13px; font-weight: 700; color: ${DARK}; letter-spacing: -0.02em; white-space: nowrap; }
        .ge-logo-sub { font-size: 10px; color: #9ca3af; font-weight: 400; }
        .ge-nav { flex: 1; padding: 10px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .ge-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; color: #6b7280; font-size: 13px; font-weight: 500; transition: all 0.15s; white-space: nowrap; border: none; background: none; width: 100%; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; }
        .ge-nav-item:hover { background: #f9fafb; color: ${DARK}; }
        .ge-nav-item.active { background: #fff1f4; color: ${PINK}; font-weight: 600; }
        .ge-nav-icon { font-size: 14px; flex-shrink: 0; width: 18px; text-align: center; }
        .ge-nav-divider { height: 1px; background: ${B}; margin: 6px 0; }
        .ge-sidebar-footer { padding: 10px 8px; border-top: 1px solid ${B}; }
        .ge-user-chip { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; }
        .ge-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, ${PINK}, #7c3aed); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0; }

        .ge-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
        .ge-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 52px; background: #fff; border-bottom: 1px solid ${B}; flex-shrink: 0; }
        .ge-topbar-title { font-size: 14px; font-weight: 700; color: ${DARK}; letter-spacing: -0.02em; }
        .ge-topbar-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; background: #fff1f4; color: ${PINK}; font-size: 11px; font-weight: 600; }
        .ge-topbar-dot { width: 6px; height: 6px; border-radius: 50%; background: ${PINK}; animation: pulse 1.8s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .ge-content { flex: 1; overflow-y: auto; padding: 20px; }

        /* chat */
        .ge-chat-wrap { display: flex; flex-direction: column; height: 100%; min-height: 0; }
        .ge-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding-bottom: 8px; min-height: 0; }
        .ge-msg { display: flex; gap: 10px; align-items: flex-start; }
        .ge-msg.user { flex-direction: row-reverse; }
        .ge-msg-avatar { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
        .ge-msg-avatar.ai { background: ${DARK}; color: #fff; }
        .ge-msg-avatar.user { background: linear-gradient(135deg, ${PINK}, #7c3aed); color: #fff; }
        .ge-bubble { max-width: 72%; padding: 12px 14px; border-radius: 12px; font-size: 13.5px; line-height: 1.65; white-space: pre-wrap; }
        .ge-bubble.ai { background: #fff; border: 1px solid ${B}; color: ${DARK}; border-radius: 12px 12px 12px 4px; }
        .ge-bubble.user { background: ${DARK}; color: #fff; border-radius: 12px 12px 4px 12px; }
        .ge-chat-input-row { display: flex; gap: 8px; padding: 14px 0 0; border-top: 1px solid ${B}; flex-shrink: 0; }
        .ge-chat-input { flex: 1; padding: 11px 14px; border: 1px solid ${B}; border-radius: 10px; font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; color: ${DARK}; transition: border-color 0.15s; resize: none; }
        .ge-chat-input:focus { border-color: #9ca3af; }
        .ge-send-btn { padding: 11px 18px; border-radius: 10px; background: ${DARK}; color: #fff; font-size: 13px; font-weight: 600; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity 0.15s; white-space: nowrap; }
        .ge-send-btn:hover { opacity: 0.8; }
        .ge-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ge-quick-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; flex-shrink: 0; }
        .ge-quick { padding: 6px 12px; border-radius: 20px; border: 1px solid ${B}; background: #fff; font-size: 12px; color: #6b7280; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
        .ge-quick:hover { border-color: ${PINK}; color: ${PINK}; }
        .ge-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
        .ge-typing span { width: 6px; height: 6px; border-radius: 50%; background: #d1d5db; animation: typing 1.2s infinite; }
        .ge-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ge-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

        /* cards */
        .ge-card { background: #fff; border: 1px solid ${B}; border-radius: 12px; padding: 20px; }
        .ge-card-title { font-size: 13px; font-weight: 700; color: ${DARK}; margin-bottom: 14px; letter-spacing: -0.01em; }

        /* resume */
        .ge-resume-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ge-textarea { width: 100%; height: 240px; border: 1px solid ${B}; border-radius: 8px; padding: 12px 14px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; color: ${DARK}; resize: none; outline: none; line-height: 1.6; }
        .ge-textarea:focus { border-color: #9ca3af; }
        .ge-input { width: 100%; padding: 9px 12px; border: 1px solid ${B}; border-radius: 8px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; color: ${DARK}; outline: none; margin-bottom: 10px; }
        .ge-input:focus { border-color: #9ca3af; }
        .ge-btn-pink { padding: 10px 20px; border-radius: 8px; background: ${PINK}; color: #fff; font-size: 13px; font-weight: 600; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity 0.15s; }
        .ge-btn-pink:hover { opacity: 0.88; }
        .ge-btn-pink:disabled { opacity: 0.4; cursor: not-allowed; }
        .ge-list-item { display: flex; gap: 8px; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid #f9fafb; font-size: 13px; color: #374151; line-height: 1.5; }
        .ge-list-item:last-child { border-bottom: none; }
        .ge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }

        /* jobs */
        .ge-jobs-list { display: flex; flex-direction: column; gap: 10px; }
        .ge-job-card { background: #fff; border: 1px solid ${B}; border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; transition: border-color 0.15s; }
        .ge-job-card:hover { border-color: #9ca3af; }
        .ge-job-logo { width: 40px; height: 40px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #374151; flex-shrink: 0; }
        .ge-job-info { flex: 1; min-width: 0; }
        .ge-job-title { font-size: 14px; font-weight: 600; color: ${DARK}; letter-spacing: -0.01em; }
        .ge-job-meta { font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .ge-job-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
        .ge-tag { padding: 2px 8px; border-radius: 4px; background: #f3f4f6; font-size: 11px; color: #6b7280; font-weight: 500; }
        .ge-match-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .ge-match-high { background: #ecfdf5; color: #059669; }
        .ge-match-mid { background: #fffbeb; color: #d97706; }
        .ge-save-btn { padding: 7px 14px; border-radius: 7px; border: 1px solid ${B}; background: #fff; font-size: 12px; font-weight: 500; color: #6b7280; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; flex-shrink: 0; }
        .ge-save-btn:hover { border-color: ${PINK}; color: ${PINK}; }
        .ge-save-btn.saved { background: #fff1f4; border-color: ${PINK}; color: ${PINK}; }

        /* skills */
        .ge-skill-row { margin-bottom: 16px; }
        .ge-skill-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .ge-skill-name { font-size: 13px; font-weight: 500; color: ${DARK}; }
        .ge-skill-nums { font-size: 12px; color: #9ca3af; }
        .ge-skill-bar-bg { height: 6px; background: #f3f4f6; border-radius: 3px; position: relative; }
        .ge-skill-bar { height: 6px; border-radius: 3px; transition: width 1s ease; }
        .ge-skill-marker { position: absolute; top: -3px; width: 2px; height: 12px; background: #d1d5db; border-radius: 1px; }

        /* roadmap */
        .ge-road-item { display: flex; gap: 16px; }
        .ge-road-line { display: flex; flex-direction: column; align-items: center; }
        .ge-road-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .ge-road-connector { width: 2px; flex: 1; background: ${B}; margin: 4px 0; min-height: 32px; }
        .ge-road-content { padding-bottom: 24px; flex: 1; }
        .ge-road-week { font-size: 11px; font-weight: 600; color: #9ca3af; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 4px; }
        .ge-road-title { font-size: 14px; font-weight: 700; color: ${DARK}; letter-spacing: -0.01em; margin-bottom: 4px; }
        .ge-road-desc { font-size: 13px; color: #6b7280; line-height: 1.6; }
        .ge-road-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 600; margin-top: 8px; }

        .ge-loading { display: flex; align-items: center; justify-content: center; padding: 48px; }
        .ge-spinner { width: 24px; height: 24px; border: 2px solid ${B}; border-top-color: ${PINK}; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ge-empty { text-align: center; padding: 48px 24px; color: #9ca3af; }
        .ge-empty-icon { font-size: 32px; margin-bottom: 12px; }

        /* usage bar */
        .ge-usage-bar { height: 3px; background: ${B}; border-radius: 2px; overflow: hidden; margin-top: 4px; }
        .ge-usage-fill { height: 3px; background: ${PINK}; border-radius: 2px; }

        @media (max-width: 760px) {
          .ge-sidebar { display: none; }
          .ge-resume-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ge-app">
        {/* ── SIDEBAR ── */}
        <div className={cls("ge-sidebar", !sideOpen && "closed")}>
          <div className="ge-logo-row">
            <div className="ge-logo-dot">GE</div>
            {sideOpen && <div><div className="ge-logo-text">Gen-E AI</div><div className="ge-logo-sub">Career Intelligence</div></div>}
          </div>

          <nav className="ge-nav">
            {TABS.map(t => (
              <button key={t.id} className={cls("ge-nav-item", tab === t.id && "active")} onClick={() => setTab(t.id)}>
                <span className="ge-nav-icon">{t.icon}</span>
                {sideOpen && <span>{t.label}</span>}
              </button>
            ))}
            <div className="ge-nav-divider" />
            <Link to="/gene" className="ge-nav-item" style={{ textDecoration: "none" }}>
              <span className="ge-nav-icon" style={{ fontSize: 12 }}>←</span>
              {sideOpen && <span>Overview</span>}
            </Link>

            {/* Usage indicator */}
            {sideOpen && usage && usage.plan === "free" && (
              <div style={{ padding: "10px", marginTop: "auto" }}>
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
                  AI chats: {usage.chat_count}/20 this month
                </div>
                <div className="ge-usage-bar">
                  <div className="ge-usage-fill" style={{ width: `${Math.min((usage.chat_count / 20) * 100, 100)}%` }} />
                </div>
                <div style={{ fontSize: 11, color: PINK, marginTop: 6, fontWeight: 600, cursor: "pointer" }}>
                  Upgrade to Premium →
                </div>
              </div>
            )}
          </nav>

          <div className="ge-sidebar-footer">
            <div className="ge-user-chip">
              <div className="ge-avatar">{user?.full_name?.[0]?.toUpperCase() || "U"}</div>
              {sideOpen && (
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.full_name || "User"}</div>
                  <button onClick={logout} style={{ fontSize: 10.5, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="ge-main">
          <div className="ge-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setSideOpen(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9ca3af", padding: "4px 6px" }}>☰</button>
              <span className="ge-topbar-title">{tabTitles[tab]}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="ge-topbar-badge"><span className="ge-topbar-dot" />Gen-E Online</span>
              {user?.plan && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: user.plan === "free" ? "#f3f4f6" : "#fff1f4", color: user.plan === "free" ? "#6b7280" : PINK, fontWeight: 600, textTransform: "uppercase" }}>{user.plan}</span>}
            </div>
          </div>

          <div className="ge-content">

            {/* ── AI CHAT ── */}
            {tab === "chat" && (
              <div className="ge-chat-wrap" style={{ height: "100%" }}>
                <div className="ge-quick-btns">
                  {["Review my resume", "I want to change careers", "What skills should I build?", "Help me prepare for interviews", "Build me a career roadmap"].map(q => (
                    <button key={q} className="ge-quick" onClick={() => setInput(q)}>{q}</button>
                  ))}
                </div>
                <div className="ge-messages">
                  {messages.map((m, i) => (
                    <div key={i} className={cls("ge-msg", m.role)}>
                      <div className={cls("ge-msg-avatar", m.role === "assistant" ? "ai" : "user")}>{m.role === "assistant" ? "GE" : user?.full_name?.[0]?.toUpperCase() || "U"}</div>
                      <div className={cls("ge-bubble", m.role === "assistant" ? "ai" : "user")}>{m.content}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="ge-msg">
                      <div className="ge-msg-avatar ai">GE</div>
                      <div className="ge-bubble ai" style={{ padding: 0 }}>
                        <div className="ge-typing"><span /><span /><span /></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="ge-chat-input-row">
                  <textarea className="ge-chat-input" placeholder="Ask Gen-E anything about your career..." value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    rows={1} style={{ height: 44 }}
                  />
                  <button className="ge-send-btn" onClick={sendMessage} disabled={chatLoading || !input.trim()}>
                    {chatLoading ? "..." : "Send →"}
                  </button>
                </div>
              </div>
            )}

            {/* ── RESUME ── */}
            {tab === "resume" && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 4 }}>Resume Analyzer</div>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>Paste your resume text. Gen-E will score it and give you specific fixes.</div>
                </div>

                <div className="ge-resume-grid">
                  <div className="ge-card">
                    <div className="ge-card-title">Paste your resume</div>
                    <input className="ge-input" placeholder="Target role (optional) — e.g. Product Designer" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
                    <textarea className="ge-textarea" placeholder="Paste your full resume text here..." value={resumeText} onChange={e => setResumeText(e.target.value)} />
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{resumeText.length} chars</span>
                      <button className="ge-btn-pink" onClick={analyzeResume} disabled={resumeLoading || !resumeText.trim()}>
                        {resumeLoading ? "Analyzing..." : "Analyze Resume →"}
                      </button>
                    </div>

                    {/* Past resumes */}
                    {pastResumes.length > 0 && (
                      <div style={{ marginTop: 20, borderTop: `1px solid ${B}`, paddingTop: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", marginBottom: 10 }}>Past analyses</div>
                        {pastResumes.map(r => (
                          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid #f9fafb` }}>
                            <span style={{ fontSize: 13, color: DARK }}>{r.title}</span>
                            <div style={{ display: "flex", gap: 8 }}>
                              <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>ATS {r.ats_score}</span>
                              <span style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    {!resumeScore && !resumeLoading && (
                      <div className="ge-card"><div className="ge-empty"><div className="ge-empty-icon">◈</div><div style={{ fontSize: 13, color: "#9ca3af" }}>Paste your resume and click Analyze to see your ATS score, strengths, and fixes.</div></div></div>
                    )}
                    {resumeLoading && <div className="ge-card"><div className="ge-loading"><div className="ge-spinner" /></div></div>}
                    {resumeScore && !resumeScore.error && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="ge-card">
                          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
                            {[["Overall", resumeScore.score, "#0a0a0a"], ["ATS Score", resumeScore.ats, PINK]].map(([label, val, color]) => (
                              <div key={label} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 38, fontWeight: 800, color: val >= 80 ? "#059669" : val >= 60 ? "#d97706" : PINK, letterSpacing: "-0.04em" }}>{val}</div>
                                <div style={{ fontSize: 11, color: "#9ca3af" }}>{label}</div>
                              </div>
                            ))}
                            <div style={{ flex: 1, fontSize: 13, color: "#374151", lineHeight: 1.6, display: "flex", alignItems: "center" }}>{resumeScore.verdict}</div>
                          </div>
                          {resumeScore.suggested_roles?.length > 0 && (
                            <div><span style={{ fontSize: 12, color: "#9ca3af" }}>Matched roles: </span>{resumeScore.suggested_roles.map(r => <span key={r} style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, marginLeft: 4 }}>{r}</span>)}</div>
                          )}
                        </div>
                        {[
                          { label: "✓ Strengths", items: resumeScore.strengths, color: "#059669" },
                          { label: "⚠ Fix These", items: resumeScore.improvements, color: "#d97706" },
                          { label: "✕ Missing", items: resumeScore.missing, color: PINK },
                        ].map(({ label, items, color }) => (
                          <div key={label} className="ge-card">
                            <div className="ge-card-title" style={{ color }}>{label}</div>
                            {items?.map((s, i) => (
                              <div key={i} className="ge-list-item"><div className="ge-dot" style={{ background: color }} />{s}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    {resumeScore?.error && (
                      <div className="ge-card" style={{ borderColor: PINK }}>
                        <div style={{ color: PINK, fontSize: 13 }}>{resumeScore.error}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── JOBS ── */}
            {tab === "jobs" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 2 }}>Matched Jobs</div>
                    <div style={{ fontSize: 13, color: "#9ca3af" }}>Personalised based on your profile</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{Object.keys(savedJobIds).length} saved</div>
                </div>
                {jobsLoading ? (
                  <div className="ge-loading"><div className="ge-spinner" /></div>
                ) : (
                  <div className="ge-jobs-list">
                    {jobs.map(job => (
                      <div key={job.id} className="ge-job-card">
                        <div className="ge-job-logo">{(job.company || "").substring(0, 2).toUpperCase()}</div>
                        <div className="ge-job-info">
                          <div className="ge-job-title">{job.title}</div>
                          <div className="ge-job-meta">{job.company} · {job.location} · {job.salary}</div>
                          {job.description && <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 4 }}>{job.description}</div>}
                          <div className="ge-job-tags">{(job.tags || []).map(t => <span key={t} className="ge-tag">{t}</span>)}</div>
                        </div>
                        <span className={cls("ge-match-badge", job.match >= 85 ? "ge-match-high" : "ge-match-mid")}>{job.match}% match</span>
                        <button className={cls("ge-save-btn", savedJobIds[job.id] && "saved")} onClick={() => toggleSaveJob(job)}>
                          {savedJobIds[job.id] ? "Saved ✓" : "Save"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SKILLS ── */}
            {tab === "skills" && (
              <div>
                {skillsLoading && <div className="ge-loading"><div className="ge-spinner" /></div>}
                {!skillsLoading && !skillsData && <div className="ge-empty"><div className="ge-empty-icon">◉</div><div>Complete your profile to see skill gap analysis</div></div>}
                {skillsData && (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Skill Gap: {skillsData.target_role}</div>
                      <div style={{ fontSize: 13, color: "#9ca3af" }}>Your current level vs what this role requires</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="ge-card">
                        <div className="ge-card-title">Skill breakdown</div>
                        {(skillsData.skills || []).map(s => (
                          <div key={s.skill} className="ge-skill-row">
                            <div className="ge-skill-top">
                              <span className="ge-skill-name">{s.skill}</span>
                              <span className="ge-skill-nums">{s.level}% / {s.required}%</span>
                            </div>
                            <div className="ge-skill-bar-bg">
                              <div className="ge-skill-bar" style={{ width: `${s.level}%`, background: s.status === "met" ? "#059669" : s.status === "close" ? "#d97706" : PINK }} />
                              <div className="ge-skill-marker" style={{ left: `${s.required}%` }} />
                            </div>
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: 14, marginTop: 16, fontSize: 11.5 }}>
                          <span style={{ color: "#059669" }}>● Met</span>
                          <span style={{ color: "#d97706" }}>● Close</span>
                          <span style={{ color: PINK }}>● Gap</span>
                          <span style={{ color: "#9ca3af" }}>| = required</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="ge-card" style={{ background: DARK }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Your overall score</div>
                          <div style={{ fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
                            {skillsData.overall_score}<span style={{ fontSize: 18, color: "#6b7280" }}>/100</span>
                          </div>
                          <div style={{ fontSize: 12.5, color: "#9ca3af", marginTop: 8, lineHeight: 1.6 }}>
                            Close your skill gaps to qualify for senior roles.
                          </div>
                          <button className="ge-btn-pink" style={{ marginTop: 14, width: "100%" }} onClick={() => setTab("roadmap")}>
                            See your roadmap →
                          </button>
                        </div>

                        <div className="ge-card" style={{ borderLeft: `3px solid ${PINK}` }}>
                          <div className="ge-card-title">Priority gaps</div>
                          {(skillsData.skills || []).filter(s => s.status === "gap").map(s => (
                            <div key={s.skill} className="ge-list-item">
                              <div className="ge-dot" style={{ background: PINK }} />
                              <div>
                                <div style={{ fontWeight: 600, color: DARK }}>{s.skill}</div>
                                <div style={{ fontSize: 12, color: "#9ca3af" }}>Need +{s.required - s.level}% · Available on HyperX</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ROADMAP ── */}
            {tab === "roadmap" && (
              <div style={{ maxWidth: 640 }}>
                {roadmapLoading && <div className="ge-loading"><div className="ge-spinner" /></div>}
                {!roadmapLoading && roadmap && (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 2 }}>{roadmap.title}</div>
                      <div style={{ fontSize: 13, color: "#9ca3af" }}>{roadmap.goal}</div>
                    </div>
                    <div>
                      {(roadmap.weeks || []).map((r, i) => (
                        <div key={r.week} className="ge-road-item">
                          <div className="ge-road-line">
                            <div className="ge-road-dot" style={{ background: r.color || PINK }} />
                            {i < (roadmap.weeks || []).length - 1 && <div className="ge-road-connector" />}
                          </div>
                          <div className="ge-road-content">
                            <div className="ge-road-week">{r.week}</div>
                            <div className="ge-road-title">{r.title}</div>
                            <div className="ge-road-desc">{r.desc}</div>
                            <span className="ge-road-tag" style={{ background: (r.color || PINK) + "18", color: r.color || PINK }}>{r.tag}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="ge-card" style={{ marginTop: 8, background: "#f9fafb" }}>
                      <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>
                        Want a more tailored roadmap? Go to <strong>AI Chat</strong> and say <em>"Build me a custom career roadmap"</em> — Gen-E will create something specific to your background.
                      </div>
                    </div>
                  </>
                )}
                {!roadmapLoading && !roadmap && (
                  <div className="ge-empty">
                    <div className="ge-empty-icon">◇</div>
                    <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 12 }}>Complete your profile to get a personalised roadmap</div>
                    <Link to="/onboarding" style={{ color: PINK, fontSize: 13, fontWeight: 600 }}>Set up your profile →</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
