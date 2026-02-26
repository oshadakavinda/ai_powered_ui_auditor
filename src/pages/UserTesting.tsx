import { useState, useEffect, useRef } from 'react'

interface UserTestingProps {
    step: string
    onStartRecording: () => void
    onStopRecording: () => void
    onExport: () => void
    onDiscard: () => void
}

const ISSUES = [
    { id: 1, severity: 'high' as const, title: 'Click Failure', desc: 'User attempted to click submit button 3 Times with out response', time: '3.2s', reaction: 'Frustration' },
    { id: 2, severity: 'medium' as const, title: 'Navigation Confusion', desc: 'User attempted to click submit button 3 Times with out response', time: '3.2s', reaction: 'Frustration' },
    { id: 3, severity: 'high' as const, title: 'Form Error', desc: 'User attempted to click submit button 3 Times with out response', time: '3.2s', reaction: 'Frustration' },
    { id: 4, severity: 'medium' as const, title: 'Navigation Confusion', desc: 'User attempted to click submit button 3 Times with out response', time: '3.2s', reaction: 'Frustration' },
    { id: 5, severity: 'medium' as const, title: 'Navigation Confusion', desc: 'User attempted to click submit button 3 Times with out response', time: '3.2s', reaction: 'Frustration' },
]

export default function UserTesting({ step, onStartRecording, onStopRecording, onExport, onDiscard }: UserTestingProps) {
    const [permissions, setPermissions] = useState({ screen: false, webcam: false, storage: false })
    const [showReadyModal, setShowReadyModal] = useState(false)
    const [showTimesUpModal, setShowTimesUpModal] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)
    const [countdown, setCountdown] = useState(5)
    const [timeRemaining, setTimeRemaining] = useState(10)
    const [isRecording, setIsRecording] = useState(false)
    const [expandedIssue, setExpandedIssue] = useState<number | null>(null)
    const timerRef = useRef<number | null>(null)

    // Countdown for "Ready to Test" modal
    useEffect(() => {
        if (showReadyModal && countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000)
            return () => clearTimeout(t)
        }
    }, [showReadyModal, countdown])

    // Recording timer
    useEffect(() => {
        if (isRecording && timeRemaining > 0) {
            timerRef.current = window.setTimeout(() => {
                setTimeRemaining(t => t - 1)
            }, 1000)
            return () => { if (timerRef.current) clearTimeout(timerRef.current) }
        }
        if (isRecording && timeRemaining === 0) {
            setIsRecording(false)
            setShowTimesUpModal(true)
        }
    }, [isRecording, timeRemaining])

    const allGranted = permissions.screen && permissions.webcam && permissions.storage

    // Permissions Screen
    if (step === 'permissions') {
        return (
            <div>
                <h1 className="page-heading">Required Permissions</h1>
                <p className="page-subheading">We need your permission to record your screen and webcam to analyze UI interactions and user behavior.</p>

                <div className="permission-card">
                    <div className="permission-card__icon">🖥️</div>
                    <div className="permission-card__info">
                        <div className="permission-card__title">Screen Recording</div>
                        <div className="permission-card__desc">Capture UI Interactions, Clicks, Scrolls and Navigations</div>
                    </div>
                    {permissions.screen ? (
                        <span style={{ fontSize: 24, color: 'var(--green-accent)' }}>☑</span>
                    ) : (
                        <button className="btn btn-green-solid" onClick={() => setPermissions(p => ({ ...p, screen: true }))}>Grant Access</button>
                    )}
                </div>

                <div className="permission-card">
                    <div className="permission-card__icon">📷</div>
                    <div className="permission-card__info">
                        <div className="permission-card__title">Webcam Access</div>
                        <div className="permission-card__desc">Analyse Facial expressions, eye Movement and Emotions</div>
                    </div>
                    {permissions.webcam ? (
                        <span style={{ fontSize: 24, color: 'var(--green-accent)' }}>☑</span>
                    ) : (
                        <button className="btn btn-green-solid" onClick={() => setPermissions(p => ({ ...p, webcam: true }))}>Grant Access</button>
                    )}
                </div>

                <div className="permission-card">
                    <div className="permission-card__icon">🎥</div>
                    <div className="permission-card__info">
                        <div className="permission-card__title">Data Storage</div>
                        <div className="permission-card__desc">Save recordings and analysis results locally</div>
                    </div>
                    {permissions.storage ? (
                        <span style={{ fontSize: 24, color: 'var(--green-accent)' }}>☑</span>
                    ) : (
                        <button className="btn btn-green-solid" onClick={() => setPermissions(p => ({ ...p, storage: true }))}>Accept</button>
                    )}
                </div>

                <div className="privacy-notice">
                    <div className="privacy-notice__title">ℹ️ Privacy Notice</div>
                    <div className="privacy-notice__text">All recordings are processed locally. Your Data is anonymized and never shared without consent</div>
                </div>

                {allGranted && (
                    <div className="text-center mt-8">
                        <button
                            className="btn btn-primary btn-primary-lg"
                            style={{ width: '100%', maxWidth: 400 }}
                            onClick={() => { setShowReadyModal(true); setCountdown(5) }}
                        >
                            Start Recording Session
                        </button>
                    </div>
                )}

                {/* Ready To Test Modal */}
                {showReadyModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2 className="modal__title">Ready To Test</h2>
                            <div className="modal__countdown">{String(countdown).padStart(2, '0')}</div>
                            <div className="modal__actions">
                                <button className="btn btn-primary btn-primary-lg" onClick={() => {
                                    setShowReadyModal(false)
                                    setIsRecording(true)
                                    setTimeRemaining(10)
                                    onStartRecording()
                                }}>Ready to Start</button>
                                <button className="btn btn-outline btn-primary-lg" onClick={() => {
                                    setShowReadyModal(false)
                                    setIsRecording(true)
                                    setTimeRemaining(10)
                                    onStartRecording()
                                }}>Skip Time</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Recording Session
    if (step === 'recording') {
        return (
            <div className="recording-container">
                {/* Timer */}
                <div className="recording-timer">
                    <div className="recording-timer__label">Time Remaining</div>
                    <div className="recording-timer__value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <span>⏱️</span>
                        <span>00:{String(timeRemaining).padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Recording Preview */}
                <div className="recording-preview">
                    {/* Recording indicator */}
                    <div className="recording-indicator" />

                    {/* Mock app window inside */}
                    <div style={{ position: 'absolute', top: 28, left: 0, right: 0, bottom: 60, background: '#fff', margin: '0 20px' }}>
                        <div style={{ background: '#2d2d2d', padding: '4px 12px', fontSize: 10, color: '#aaa', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
                            <span style={{ marginLeft: 'auto' }}>App name</span>
                        </div>
                        <div style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 8px', background: '#f5f5f5', borderRadius: 4, marginBottom: 4, fontSize: 9 }}>
                                <span style={{ color: 'var(--red-high)', fontWeight: 700, fontSize: 12 }}>)1⏺</span>
                                <span style={{ background: 'var(--green-accent)', color: 'white', padding: '2px 6px', borderRadius: 3, fontSize: 8 }}>+ Add Project</span>
                                <input style={{ flex: 1, border: '1px solid #ddd', borderRadius: 2, padding: '2px 4px', fontSize: 7 }} placeholder="Search..." />
                            </div>
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '3px 8px', fontSize: 7, borderBottom: '1px solid #eee', color: '#888' }}>
                                    <span>—</span><span>Company</span><span>—</span><span>—</span><span>—</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Webcam PiP */}
                    <div className="webcam-pip">
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' }}>
                            👤
                        </div>
                    </div>

                    {/* Stop button */}
                    <div className="recording-stop" onClick={() => {
                        setIsRecording(false)
                        onStopRecording()
                    }}>
                        <div className="recording-stop__btn" />
                        <span className="recording-stop__label">Stop Record</span>
                    </div>
                </div>

                {/* Time's Up Modal */}
                {showTimesUpModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2 className="modal__title" style={{ color: 'var(--red-high)' }}>Time is up!</h2>
                            <p className="modal__body">
                                You can choose to provide these details now to personalise your experience, or simply skip this step for now.
                            </p>
                            <div className="modal__actions">
                                <button className="btn btn-primary btn-primary-lg" onClick={() => { setShowTimesUpModal(false); onStopRecording() }}>Ready to Go</button>
                                <button className="btn btn-outline btn-primary-lg" onClick={() => { setShowTimesUpModal(false); onDiscard() }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Analyse UI Loading
    if (step === 'user-analysis') {
        return (
            <div className="spinner-container">
                <div className="spinner" />
                <div className="spinner-text">Analyse UI</div>
            </div>
        )
    }

    // Analysis Complete / Results
    return (
        <div>
            <h1 className="page-heading">Analysis Complete</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Session Duration: 00:16</p>

            {/* Stat Cards */}
            <div className="stat-cards">
                <div className="stat-card stat-card--red">
                    <div className="stat-card__label">Total Issues</div>
                    <div className="stat-card__value">3</div>
                </div>
                <div className="stat-card stat-card--blue">
                    <div className="stat-card__label">Emotional Reactions</div>
                    <div className="stat-card__value">3</div>
                </div>
                <div className="stat-card stat-card--green">
                    <div className="stat-card__label">Suggestions</div>
                    <div className="stat-card__value">12</div>
                </div>
            </div>

            {/* Issues List */}
            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Identified Issues & Replay</h2>

            {ISSUES.map((issue) => (
                <div key={issue.id}>
                    <div className="issue-card">
                        <div className="issue-card__content">
                            <div>
                                <span className={`issue-card__severity severity-${issue.severity}`}>{issue.severity}</span>
                                <span className="issue-card__title">{issue.title}</span>
                            </div>
                            <div className="issue-card__desc">{issue.desc}</div>
                            <div className="issue-card__meta">
                                <span>⏱ Occurred at {issue.time}</span>
                                <span>😟 User Reaction: {issue.reaction}</span>
                            </div>
                        </div>
                        <div className="issue-card__replay">
                            <button
                                className="btn btn-primary"
                                onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                            >
                                ▶ Replay
                            </button>
                        </div>
                    </div>

                    {/* Expanded with video & recommendations */}
                    {expandedIssue === issue.id && (
                        <div style={{ paddingLeft: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Video replay - Issue Timestamp</p>
                            <div className="video-player">
                                <button className="video-player__play" />
                            </div>

                            <div className="recommendations">
                                <div className="recommendations__title">💡 Recommendations</div>
                                <div className="recommendations__subtitle">Based on the detected issue and user behavior analysis</div>
                                <div className="recommendations__item"><span>①</span> Increase button size to minimum 44×44px for better touch targets</div>
                                <div className="recommendations__item"><span>②</span> Add visual feedback on button click to confirm user action</div>
                                <div className="recommendations__item"><span>③</span> Improve button contrast to meet WCAG AA guidelines</div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Export Modal Trigger */}
            <div className="footer-actions">
                <button className="btn btn-primary btn-primary-lg" onClick={() => setShowExportModal(true)}>Finish</button>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal__title">All Done!</h2>
                        <p className="modal__body">Export Your Final Documentation</p>
                        <div className="modal__actions">
                            <button className="btn btn-primary btn-primary-lg" onClick={() => { setShowExportModal(false); onExport() }}>Export</button>
                            <button className="btn btn-outline btn-primary-lg" onClick={() => { setShowExportModal(false); onDiscard() }}>Discard</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
