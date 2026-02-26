import { useState } from 'react'

interface VioletRulesPageProps {
    step: 'violet-rules' | 'violet-accuracy'
    fileName: string | null
    onDone: () => void
    onNext: () => void
}

const ALL_RULES = [
    { id: 1, title: 'Visual Hierarchy', description: 'Use size, color, and weight to show importance. The most important thing should be the easiest to see.', violated: true },
    { id: 2, title: 'Contrast Ratio', description: 'Ensure enough contrast between text and background. Aim for at least 4.5:1 for normal text to maintain accessibility.', violated: true },
    { id: 3, title: 'Rule of Proximity', description: 'Place related items close together (e.g., a label next to its input field) so users perceive them as a group.', violated: false },
    { id: 4, title: 'The 60-30-10 Rule', description: 'For color, use a primary color for 60%, a secondary for 30%, and an accent color (like for buttons) for 10%.', violated: true },
    { id: 5, title: 'Visibility of System Status', description: "Always tell the user what's happening. If something is loading, show a progress bar or spinner.", violated: false },
    { id: 6, title: 'User Control & Freedom', description: 'Always give users an "emergency exit." Let them easily undo, redo, or cancel an action.', violated: true },
]

export default function VioletRulesPage({ step, fileName, onDone, onNext }: VioletRulesPageProps) {
    const [showModal, setShowModal] = useState(false)
    const [selectedRule, setSelectedRule] = useState<number | null>(null)

    const violatedRules = ALL_RULES.filter(r => r.violated)
    const accuracy = Math.round((ALL_RULES.filter(r => !r.violated).length / ALL_RULES.length) * 100)

    const displayRules = step === 'violet-accuracy' ? violatedRules : ALL_RULES

    return (
        <div>
            <h1 className="page-heading">Violet Rules</h1>

            {/* Rule Cards */}
            {displayRules.map((rule) => (
                <div
                    key={rule.id}
                    className="rule-card"
                    onClick={() => {
                        setSelectedRule(rule.id)
                        setShowModal(true)
                    }}
                >
                    <div className="rule-card__title">{rule.title}</div>
                    <div className="rule-card__description">{rule.description}</div>
                </div>
            ))}

            {/* File reference */}
            {step === 'violet-rules' && fileName && (
                <div className="rule-card" style={{ opacity: 0.7, cursor: 'default' }}>
                    <div className="rule-card__title">{fileName}</div>
                    <div className="rule-card__description">1 minute left</div>
                </div>
            )}

            {/* Accuracy Section (step 2) */}
            {step === 'violet-accuracy' && (
                <div className="accuracy-section">
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <span className="accuracy-section__label">Total accuracy</span>
                        <span className="accuracy-section__value">{accuracy}%</span>
                    </div>
                    <div className="export-row">
                        <span className="export-row__label">Export Detailed Report</span>
                        <button className="btn btn-primary">Export Report</button>
                    </div>
                </div>
            )}

            <hr className="divider" />

            {/* Footer */}
            <div className="footer-actions">
                {step === 'violet-rules' ? (
                    <button className="btn btn-dark btn-primary-lg" onClick={onDone}>Done</button>
                ) : (
                    <button className="btn btn-primary btn-primary-lg" onClick={onNext}>NEXT</button>
                )}
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal__title">Violet Rules</h2>
                        <p className="modal__body">
                            Do you agree with this finding?" Please confirm if the detected rule violation matches your experience during the session.
                        </p>
                        <div className="modal__actions">
                            <button className="btn btn-primary btn-primary-lg" onClick={() => setShowModal(false)}>Yes</button>
                            <button className="btn btn-outline btn-primary-lg" onClick={() => setShowModal(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
