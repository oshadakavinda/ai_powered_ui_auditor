import { useState } from 'react'

interface VioletRulesPageProps {
    step: 'violet-rules' | 'violet-accuracy'
    fileName: string | null
    auditResult?: any
    onDone: () => void
    onNext: () => void
}

const MOCK_RULES = [
    { id: 1, title: 'Visual Hierarchy', description: 'Use size, color, and weight to show importance. The most important thing should be the easiest to see.', violated: true },
    { id: 2, title: 'Contrast Ratio', description: 'Ensure enough contrast between text and background. Aim for at least 4.5:1 for normal text to maintain accessibility.', violated: true },
    { id: 3, title: 'Rule of Proximity', description: 'Place related items close together (e.g., a label next to its input field) so users perceive them as a group.', violated: false },
    { id: 4, title: 'The 60-30-10 Rule', description: 'For color, use a primary color for 60%, a secondary for 30%, and an accent color (like for buttons) for 10%.', violated: true },
    { id: 5, title: 'Visibility of System Status', description: "Always tell the user what's happening. If something is loading, show a progress bar or spinner.", violated: false },
    { id: 6, title: 'User Control & Freedom', description: 'Always give users an "emergency exit." Let them easily undo, redo, or cancel an action.', violated: true },
]

export default function VioletRulesPage({ step, fileName, auditResult, onDone, onNext }: VioletRulesPageProps) {
    const [showModal, setShowModal] = useState(false)
    const [selectedRule, setSelectedRule] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Use dynamic results if available. Only fallback to mocks if NO audit has been run.
    const hasRunAudit = !!auditResult;
    const currentRules = hasRunAudit 
        ? (auditResult.violations || []) 
        : MOCK_RULES

    const violatedRules = currentRules.filter((r: any) => r.violated)
    const accuracy = auditResult?.summary?.score ?? 
        Math.round((currentRules.filter((r: any) => !r.violated).length / currentRules.length) * 100)

    const displayRules = step === 'violet-accuracy' ? violatedRules : currentRules

    const handleFeedback = async (agreed: boolean) => {
        if (!selectedRule) return
        
        setIsSubmitting(true)
        try {
            await fetch('http://localhost:8000/audit/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: auditResult?.meta?.profile || 'universal',
                    rule_name: selectedRule.rule || selectedRule.title.toLowerCase().replace(/ /g, '_'),
                    feedback: agreed ? 1 : -1
                })
            })
            setShowModal(false)
        } catch (error) {
            console.error('Failed to submit feedback:', error)
            setShowModal(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleExport = async () => {
        try {
            const response = await fetch('http://localhost:8000/audit/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(auditResult)
            })
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `audit_report_${Date.now()}.md`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export failed:', error)
            alert('Export failed. Please ensure the server is running.')
        }
    }

    return (
        <div>
            <h1 className="page-heading">Violet Rules</h1>

            {/* Rule Cards */}
            {displayRules.length > 0 ? (
                displayRules.map((rule: any) => (
                    <div
                        key={rule.id}
                        className="rule-card"
                        onClick={() => {
                            setSelectedRule(rule)
                            setShowModal(true)
                        }}
                    >
                        <div className="rule-card__title">{rule.title || rule.rule}</div>
                        <div className="rule-card__description">{rule.description || rule.desc}</div>
                    </div>
                ))
            ) : hasRunAudit && (
                <div className="card card-green text-center" style={{ padding: 'var(--space-12)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
                    <h3 className="feature-card__title">No Violations Found</h3>
                    <p className="feature-card__desc">The AI model analyzed the interface and found no rule violations. Great job!</p>
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
                        <button className="btn btn-primary" onClick={handleExport}>Export Report</button>
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
                            Do you agree with this finding? Please confirm if the detected rule violation matches your experience.
                        </p>
                        <div className="modal__actions">
                            <button 
                                className="btn btn-primary btn-primary-lg" 
                                onClick={() => handleFeedback(true)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '...' : 'Yes'}
                            </button>
                            <button 
                                className="btn btn-outline btn-primary-lg" 
                                onClick={() => handleFeedback(false)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '...' : 'No'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
