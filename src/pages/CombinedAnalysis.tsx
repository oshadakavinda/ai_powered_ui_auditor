import { useState } from 'react'

interface CombinedAnalysisProps {
    step: string
    onStartAnalysis: () => void
    onGenerateClean: () => void
    onNext: () => void
}

const ANALYSIS_OPTIONS = [
    { id: 'rules', title: 'UI & Violation Rules set', desc: 'Capture UI Interactions, Clicks, Scrolls and Navigations' },
    { id: 'elements', title: 'UI & Element Score', desc: 'Capture UI Interactions, Clicks, Scrolls and Navigations' },
    { id: 'all', title: 'UI | Violation Rules set |Element Score', desc: 'Analyse Facial expressions, eye Movement and Emotions' },
]

const SUGGESTIONS = [
    'Increase button size to minimum 44×44px for better touch targets',
    'Use consistent border-radius across all interactive elements',
    'Improve color contrast on secondary text elements',
    'Add hover states to all clickable elements for better affordance',
]

export default function CombinedAnalysis({ step, onStartAnalysis, onGenerateClean, onNext }: CombinedAnalysisProps) {

    const [selected, setSelected] = useState('all')

    // Selection screen
    if (step === 'combined-selection') {
        return (
            <div>
                <h1 className="page-heading">Upload Your Interface Design</h1>
                <p className="page-subheading">Choose you want</p>

                {ANALYSIS_OPTIONS.map((opt) => (
                    <div
                        key={opt.id}
                        className={`radio-option ${selected === opt.id ? 'selected' : ''}`}
                        onClick={() => setSelected(opt.id)}
                    >
                        <div className="radio-option__dot" />
                        <div className="radio-option__info">
                            <div className="radio-option__title">{opt.title}</div>
                            <div className="radio-option__desc">{opt.desc}</div>
                        </div>
                    </div>
                ))}

                <div className="text-center mt-6">
                    <button className="btn btn-primary btn-primary-lg" style={{ width: '100%', maxWidth: 400 }} onClick={onStartAnalysis}>
                        Start Analysis
                    </button>
                </div>

                {/* Preview thumbnail */}
                <div style={{ marginTop: '2rem', border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Preview</h3>
                    <div style={{ background: '#f5f5f5', borderRadius: 8, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                            <div>Uploaded UI Preview</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Loading
    if (step === 'combined-loading') {
        return (
            <div className="spinner-container">
                <div className="spinner" />
                <div className="spinner-text">
                    Loading<br />Element Interaction
                </div>
            </div>
        )
    }

    // Preview Interfaces (Before/After)
    if (step === 'combined-preview') {
        return (
            <div>
                <h1 className="page-heading">Preview Interfaces</h1>

                <div className="comparison-view">
                    {/* Input Interface */}
                    <div>
                        <div className="comparison-view__title">Input Interface</div>
                        <div className="comparison-view__frame comparison-view__frame--input" style={{ minHeight: 300, background: '#fafafa', padding: '0.5rem' }}>
                            {/* Mini UI mockup with red annotations */}
                            <div style={{ padding: 8 }}>
                                <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 8px', background: '#fff', borderRadius: 4, marginBottom: 2, fontSize: 10, border: '1px solid var(--red-high)' }}>
                                    <span style={{ background: '#1565C0', color: 'white', padding: '2px 6px', borderRadius: 3, fontSize: 9 }}>+ Add Project</span>
                                    <span style={{ flex: 1, border: '1px solid #ddd', borderRadius: 2, padding: '2px 4px', fontSize: 8 }}>Search...</span>
                                    <span style={{ fontSize: 8 }}>List ▾ 👤 📊</span>
                                </div>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '3px 8px', fontSize: 8, borderBottom: '1px solid #eee', color: '#666' }}>
                                        <span>—</span><span>Company {i}</span><span>—</span><span>—</span><span>—</span>
                                    </div>
                                ))}
                                <div style={{ position: 'absolute', top: '40%', right: '15%', background: 'white', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 8, width: 100, padding: 4 }}>
                                    <div style={{ background: '#1565C0', color: 'white', padding: '3px 6px', borderRadius: '3px 3px 0 0', fontWeight: 600 }}>Manage</div>
                                    {['Edit', 'Copy', 'Template', 'Archive'].map(a => <div key={a} style={{ padding: '2px 6px', borderTop: '1px solid #eee' }}>{a}</div>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Generated Interface */}
                    <div>
                        <div className="comparison-view__title">Generated Interface</div>
                        <div className="comparison-view__frame comparison-view__frame--output" style={{ minHeight: 300, background: '#fafafa', padding: '0.5rem' }}>
                            {/* Mini UI mockup with green fixes */}
                            <div style={{ padding: 8 }}>
                                <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 8px', background: '#fff', borderRadius: 4, marginBottom: 2, fontSize: 10, border: '1px solid var(--green-accent)' }}>
                                    <span style={{ background: 'var(--green-accent)', color: 'white', padding: '2px 6px', borderRadius: 3, fontSize: 9 }}>+ Add Project</span>
                                    <span style={{ flex: 1, border: '1px solid #ddd', borderRadius: 2, padding: '2px 4px', fontSize: 8 }}>Search...</span>
                                    <span style={{ fontSize: 8 }}>List ▾ 👤 📊</span>
                                </div>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '3px 8px', fontSize: 8, borderBottom: '1px solid #eee', color: '#666' }}>
                                        <span>—</span><span>Company {i}</span><span>—</span><span>—</span><span>—</span>
                                    </div>
                                ))}
                                <div style={{ position: 'absolute', top: '40%', right: '15%', background: 'white', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 8, width: 100, padding: 4 }}>
                                    <div style={{ background: 'var(--green-accent)', color: 'white', padding: '3px 6px', borderRadius: '3px 3px 0 0', fontWeight: 600 }}>Manage</div>
                                    {['Edit', 'Copy', 'Template', 'Archive'].map(a => <div key={a} style={{ padding: '2px 6px', borderTop: '1px solid #eee' }}>{a}</div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="card-green" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
                    {SUGGESTIONS.map((s, i) => (
                        <div key={i} className="suggestion-item">
                            <div className="suggestion-item__check">✓</div>
                            <span>{s}</span>
                        </div>
                    ))}
                </div>

                <div className="footer-actions">
                    <button className="btn btn-primary btn-primary-lg" onClick={onNext}>Next</button>
                </div>
            </div>
        )
    }

    // Highlighted UI with Violations
    return (
        <div>
            <h1 className="page-heading">Highlighted User Interface</h1>

            <div className="annotated-image" style={{ position: 'relative', background: '#f5f5f5', minHeight: 400, borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: '0.5rem' }}>
                {/* Mock UI with red + green annotations */}
                <div style={{ padding: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: '#fff', borderRadius: 6, marginBottom: 4 }}>
                        <div style={{ background: 'var(--green-accent)', color: 'white', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>+ Add Project</div>
                        <input style={{ flex: 1, border: '1px solid #ddd', borderRadius: 4, padding: '4px 8px', fontSize: 12 }} placeholder="Project or company" />
                        <span style={{ fontSize: 12 }}>≡ List ▾ 👤 👥 📊 ◇ Active ▾ ≡ ⋮</span>
                    </div>

                    <div style={{ background: '#fff', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '8px 12px', borderBottom: '2px solid var(--red-high)', fontSize: 12, fontWeight: 600, color: '#666' }}>
                            <span>Ow...</span><span>Company</span><span>End Date</span><span>Start Date</span><span>Tags ⓘ</span>
                        </div>
                        {['ABC Ltd', 'Teamwork', 'Aimbu', 'Teamwork', 'Client 2', 'Design Par...', 'Teamwork', 'Design Par...'].map((c, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '6px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 12, alignItems: 'center' }}>
                                <span>—</span><span>{c}</span><span>—</span><span>—</span><span>—</span>
                            </div>
                        ))}
                    </div>

                    {/* Green tooltip annotation */}
                    <div style={{ position: 'absolute', top: '28%', right: '30%' }}>
                        <div className="annotation-tooltip" style={{ background: 'var(--green-primary)' }}>Use a neutral light Gary</div>
                    </div>

                    {/* Context menu with red borders */}
                    <div style={{ position: 'absolute', top: '30%', right: '5%', background: 'white', borderRadius: 8, boxShadow: 'var(--shadow-lg)', width: 200, border: '2px solid var(--red-high)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex' }}>
                            <div style={{ flex: 1, padding: '8px 16px', background: '#1565C0', color: 'white', fontSize: 12, fontWeight: 600 }}>Manage Project</div>
                            <div style={{ flex: 1, padding: '8px 16px', fontSize: 12, color: '#666' }}>Quick Add</div>
                        </div>
                        {['✏️ Edit project details', '📋 Copy', '💾 Save as Template', '📁 Archive', '+ More Options ›', '✕ Delete'].map((item, i) => (
                            <div key={i} style={{ padding: '6px 16px', fontSize: 12, color: '#333' }}>{item}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Violation panel */}
            <div className="violation-panel">
                <h2 className="violation-panel__title">Violation</h2>
                <p className="violation-panel__text">
                    The "Manage Project" menu header uses a heavy, solid blue background that creates too much visual weight. This draws the eye away from the primary data and makes the small popup feel "clunky."
                </p>
            </div>

            <div className="footer-actions">
                <button className="btn btn-primary btn-primary-lg" onClick={onGenerateClean}>Generate Clean UI</button>
            </div>
        </div>
    )
}
