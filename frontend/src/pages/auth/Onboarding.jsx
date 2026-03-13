import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PINK = "#e8185d";
const DARK = "#0a0a0a";
const B = "#f0f0f0";

const STAGES = [
  { value: "student", label: "Student", desc: "Currently studying" },
  { value: "fresher", label: "Fresher", desc: "Recently graduated" },
  { value: "professional", label: "Professional", desc: "Currently working" },
  { value: "switcher", label: "Career Changer", desc: "Switching fields" },
  { value: "gap", label: "Returning", desc: "After a career gap" },
];

const FIELDS = [
  "Technology / Engineering", "Design / Creative", "Product Management",
  "Marketing / Growth", "Finance / Consulting", "Data / Analytics",
  "Sales / Business Dev", "HR / People Ops", "Healthcare", "Education", "Other",
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    career_stage: "", field_of_interest: "", current_role: "",
    target_role: "", years_experience: 0, skills: [], skill_input: "",
    location: "", career_goals: "",
  });
  const [loading, setLoading] = useState(false);
  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function addSkill() {
    const s = form.skill_input.trim();
    if (s && !form.skills.includes(s)) {
      setField("skills", [...form.skills, s]);
    }
    setField("skill_input", "");
  }

  function removeSkill(s) { setField("skills", form.skills.filter(x => x !== s)); }

  async function finish() {
    setLoading(true);
    try {
      await completeOnboarding({
        career_stage: form.career_stage,
        field_of_interest: form.field_of_interest,
        current_role: form.current_role,
        target_role: form.target_role,
        years_experience: form.years_experience,
        skills: form.skills,
        location: form.location,
        career_goals: form.career_goals,
      });
      navigate("/gene/app");
    } catch (err) {
      console.error(err);
      navigate("/gene/app"); // still proceed even if API fails
    }
    setLoading(false);
  }

  const totalSteps = 4;
  const pct = Math.round((step / totalSteps) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .ob-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fafafa; padding: 24px; }
        .ob-box { width: 100%; max-width: 520px; background: #fff; border: 1px solid ${B}; border-radius: 16px; padding: 36px; }
        .ob-header { margin-bottom: 28px; }
        .ob-step-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .ob-progress { flex: 1; height: 4px; background: ${B}; border-radius: 2px; overflow: hidden; }
        .ob-progress-fill { height: 4px; background: ${PINK}; border-radius: 2px; transition: width 0.3s ease; }
        .ob-step-text { font-size: 12px; color: #9ca3af; font-weight: 500; white-space: nowrap; }
        .ob-title { font-size: 20px; font-weight: 800; color: ${DARK}; letter-spacing: -0.03em; margin-bottom: 4px; }
        .ob-sub { font-size: 13px; color: #9ca3af; }

        .ob-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
        .ob-card { padding: 14px; border: 1px solid ${B}; border-radius: 10px; cursor: pointer; transition: all 0.15s; text-align: left; background: #fff; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }
        .ob-card:hover { border-color: #9ca3af; }
        .ob-card.selected { border-color: ${PINK}; background: #fff1f4; }
        .ob-card-label { font-size: 13px; font-weight: 600; color: ${DARK}; }
        .ob-card-desc { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }

        .ob-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 24px; }
        .ob-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }

        .ob-field { margin-bottom: 16px; }
        .ob-label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
        .ob-input { width: 100%; padding: 10px 14px; border: 1px solid ${B}; border-radius: 8px; font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif; color: ${DARK}; outline: none; transition: border-color 0.15s; }
        .ob-input:focus { border-color: #9ca3af; }
        .ob-textarea { width: 100%; padding: 10px 14px; border: 1px solid ${B}; border-radius: 8px; font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif; color: ${DARK}; outline: none; transition: border-color 0.15s; resize: none; height: 80px; }
        .ob-textarea:focus { border-color: #9ca3af; }
        
        .ob-skill-input-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .ob-skill-input { flex: 1; padding: 9px 12px; border: 1px solid ${B}; border-radius: 8px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; color: ${DARK}; outline: none; }
        .ob-add-btn { padding: 9px 16px; border-radius: 8px; border: 1px solid ${DARK}; background: ${DARK}; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        .ob-skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .ob-skill-chip { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; background: #f3f4f6; font-size: 12px; color: ${DARK}; font-weight: 500; }
        .ob-skill-remove { cursor: pointer; color: #9ca3af; font-size: 14px; line-height: 1; border: none; background: none; padding: 0; }
        
        .ob-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid ${B}; }
        .ob-btn-back { padding: 10px 20px; border-radius: 8px; border: 1px solid ${B}; background: #fff; color: #374151; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        .ob-btn-next { padding: 10px 24px; border-radius: 8px; background: ${DARK}; color: #fff; font-size: 13px; font-weight: 700; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        .ob-btn-next:disabled { opacity: 0.4; cursor: not-allowed; }

        .ob-skip { font-size: 12px; color: #9ca3af; cursor: pointer; text-decoration: underline; background: none; border: none; font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="ob-page">
        <div className="ob-box">
          <div className="ob-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: PINK, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>N</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}>NuGens · Setup</span>
            </div>
            <div className="ob-step-indicator">
              <div className="ob-progress"><div className="ob-progress-fill" style={{ width: `${pct}%` }} /></div>
              <span className="ob-step-text">Step {step} of {totalSteps}</span>
            </div>
          </div>

          {/* ── STEP 1: Career Stage ── */}
          {step === 1 && (
            <>
              <div className="ob-title">Where are you right now?</div>
              <div className="ob-sub" style={{ marginBottom: 20 }}>Gen-E will tailor everything to your current situation.</div>
              <div className="ob-cards">
                {STAGES.map(s => (
                  <button key={s.value} className={`ob-card${form.career_stage === s.value ? " selected" : ""}`} onClick={() => setField("career_stage", s.value)}>
                    <div className="ob-card-label">{s.label}</div>
                    <div className="ob-card-desc">{s.desc}</div>
                  </button>
                ))}
              </div>
              <div className="ob-actions">
                <button className="ob-skip" onClick={() => navigate("/gene/app")}>Skip setup</button>
                <button className="ob-btn-next" onClick={() => setStep(2)} disabled={!form.career_stage}>Next →</button>
              </div>
            </>
          )}

          {/* ── STEP 2: Field & Role ── */}
          {step === 2 && (
            <>
              <div className="ob-title">What's your field?</div>
              <div className="ob-sub" style={{ marginBottom: 20 }}>This helps Gen-E match you to relevant roles and skills.</div>
              <div className="ob-grid3" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {FIELDS.map(f => (
                  <button key={f} className={`ob-card${form.field_of_interest === f ? " selected" : ""}`} onClick={() => setField("field_of_interest", f)}>
                    <div className="ob-card-label" style={{ fontSize: 12.5 }}>{f}</div>
                  </button>
                ))}
              </div>
              <div className="ob-grid2">
                <div className="ob-field">
                  <label className="ob-label">Current role <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                  <input className="ob-input" placeholder="e.g. Junior Designer" value={form.current_role} onChange={e => setField("current_role", e.target.value)} />
                </div>
                <div className="ob-field">
                  <label className="ob-label">Target role</label>
                  <input className="ob-input" placeholder="e.g. Product Manager" value={form.target_role} onChange={e => setField("target_role", e.target.value)} />
                </div>
              </div>
              <div className="ob-actions">
                <button className="ob-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="ob-btn-next" onClick={() => setStep(3)} disabled={!form.field_of_interest}>Next →</button>
              </div>
            </>
          )}

          {/* ── STEP 3: Skills ── */}
          {step === 3 && (
            <>
              <div className="ob-title">What are your skills?</div>
              <div className="ob-sub" style={{ marginBottom: 20 }}>Gen-E will compare these against what your target role needs.</div>

              <div className="ob-field">
                <label className="ob-label">Years of experience</label>
                <input className="ob-input" type="number" min="0" max="30" placeholder="0" value={form.years_experience} onChange={e => setField("years_experience", parseInt(e.target.value) || 0)} style={{ width: 120 }} />
              </div>

              <div className="ob-field">
                <label className="ob-label">Your skills — add one at a time</label>
                <div className="ob-skill-input-row">
                  <input
                    className="ob-skill-input" placeholder="e.g. Figma, Python, SQL..."
                    value={form.skill_input} onChange={e => setField("skill_input", e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  />
                  <button className="ob-add-btn" onClick={addSkill}>Add</button>
                </div>
                <div className="ob-skills-list">
                  {form.skills.map(s => (
                    <div key={s} className="ob-skill-chip">
                      {s}
                      <button className="ob-skill-remove" onClick={() => removeSkill(s)}>×</button>
                    </div>
                  ))}
                  {form.skills.length === 0 && <span style={{ fontSize: 12, color: "#9ca3af" }}>No skills added yet</span>}
                </div>
              </div>

              <div className="ob-actions">
                <button className="ob-btn-back" onClick={() => setStep(2)}>← Back</button>
                <button className="ob-btn-next" onClick={() => setStep(4)}>Next →</button>
              </div>
            </>
          )}

          {/* ── STEP 4: Goals ── */}
          {step === 4 && (
            <>
              <div className="ob-title">What's your goal?</div>
              <div className="ob-sub" style={{ marginBottom: 20 }}>One or two sentences is enough. Gen-E will use this to shape your roadmap.</div>

              <div className="ob-field">
                <label className="ob-label">Location preference</label>
                <input className="ob-input" placeholder="e.g. Bangalore, Remote, Mumbai" value={form.location} onChange={e => setField("location", e.target.value)} />
              </div>

              <div className="ob-field">
                <label className="ob-label">What do you want to achieve in the next 6 months?</label>
                <textarea className="ob-textarea" placeholder="e.g. Land my first product design role at a funded startup. I want to move from a junior graphic design background into UX." value={form.career_goals} onChange={e => setField("career_goals", e.target.value)} />
              </div>

              <div className="ob-actions">
                <button className="ob-btn-back" onClick={() => setStep(3)}>← Back</button>
                <button className="ob-btn-next" onClick={finish} disabled={loading}>
                  {loading ? "Setting up..." : "Launch Gen-E →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
