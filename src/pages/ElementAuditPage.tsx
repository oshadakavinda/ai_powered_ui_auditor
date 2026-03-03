import { useState, useRef, useCallback } from 'react'

interface AuditComponent {
    class: string
    confidence: number
    bbox: number[]
    similarity_score: number
    matched_expert: string
}

interface AuditResult {
    report_id: string
    overall_score: number
    grade: string
    total_components: number
    components: AuditComponent[]
    report_image_url: string
    error?: string
}

type AuditStep = 'upload' | 'processing' | 'results'

interface ElementAuditPageProps {
    onBack: () => void
}

export default function ElementAuditPage({ onBack }: ElementAuditPageProps) {
    const [auditStep, setAuditStep] = useState<AuditStep>('upload')
    const [result, setResult] = useState<AuditResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleAudit = useCallback(async (file: File) => {
        setPreviewUrl(URL.createObjectURL(file))
        setAuditStep('processing')
        setError(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('http://localhost:8000/audit', {
                method: 'POST',
                body: formData,
            })
            const data: AuditResult = await response.json()

            if (data.error) {
                setError(data.error)
                setAuditStep('upload')
                return
            }

            setResult(data)
            setAuditStep('results')
        } catch (err) {
            console.error('Element audit failed:', err)
            setError('Audit failed. Please ensure the server is running on port 8000.')
            setAuditStep('upload')
        }
    }, [])

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f && f.type.startsWith('image/')) handleAudit(f)
    }, [handleAudit])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) handleAudit(f)
    }, [handleAudit])

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'green'
        if (score >= 50) return 'amber'
        return 'red'
    }

    const getGradeClass = (grade: string) => {
        switch (grade) {
            case 'EXCELLENT': return 'grade--excellent'
            case 'GOOD': return 'grade--good'
            default: return 'grade--needs-work'
        }
    }

    // Upload view
    if (auditStep === 'upload') {
        return (
            <div className="element-audit">
                <h1 className="page-heading">UI Element Auditor</h1>
                <p className="page-subheading">
                    Upload a UI screenshot to detect and score individual elements against expert design patterns.
                </p>

                {error && (
                    <div className="audit-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <div
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="upload-zone__icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <p className="upload-zone__text">
                        Drag & Drop or <span>Choose file</span> to upload
                    </p>
                    <p className="upload-zone__formats">png, jpg, jpeg</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpeg,.jpg"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                </div>

                <div className="footer-actions" style={{ marginTop: '2rem' }}>
                    <button className="btn btn-outline" onClick={onBack}>
                        ← Back to Home
                    </button>
                </div>
            </div>
        )
    }

    // Processing view
    if (auditStep === 'processing') {
        return (
            <div className="spinner-container">
                <div className="spinner" />
                <div className="spinner-text">Analyzing UI Elements</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                    Detecting components and scoring against expert patterns…
                </p>
            </div>
        )
    }

    // Results view
    if (!result) return null

    return (
        <div className="element-audit">
            <h1 className="page-heading">Audit Results</h1>

            {/* Overall Score Section */}
            <div className="audit-overview">
                <div className={`grade-badge ${getGradeClass(result.grade)}`}>
                    <span className="grade-badge__score">{result.overall_score}%</span>
                    <span className="grade-badge__label">{result.grade}</span>
                </div>
                <div className="audit-overview__stats">
                    <div className="stat-cards">
                        <div className="stat-card stat-card--blue">
                            <div className="stat-card__label">Components Found</div>
                            <div className="stat-card__value">{result.total_components}</div>
                        </div>
                        <div className={`stat-card ${result.overall_score >= 70 ? 'stat-card--green' : result.overall_score >= 50 ? 'stat-card--blue' : 'stat-card--red'}`}>
                            <div className="stat-card__label">Overall Score</div>
                            <div className="stat-card__value">{result.overall_score}%</div>
                        </div>
                        <div className="stat-card stat-card--green">
                            <div className="stat-card__label">Grade</div>
                            <div className="stat-card__value">{result.grade}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Annotated Report Image */}
            <div className="audit-report-image">
                <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700 }}>Annotated Report</h3>
                <div className="audit-report-image__container">
                    <img
                        src={`http://localhost:8000${result.report_image_url}`}
                        alt="Annotated UI audit report"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                        }}
                    />
                </div>
            </div>

            {/* Per-Component Results */}
            <h3 style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)', fontWeight: 700 }}>
                Detected Components ({result.components.length})
            </h3>
            <div className="audit-components">
                {result.components.map((comp, i) => (
                    <div key={i} className="audit-component-card">
                        <div className="audit-component-card__header">
                            <span className="audit-component-card__class">{comp.class}</span>
                            <span className={`audit-component-card__conf`}>
                                Conf: {(comp.confidence * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="score-item" style={{ marginBottom: 0 }}>
                            <div className="score-item__header">
                                <span className="score-item__label" style={{ fontSize: 'var(--font-sm)' }}>
                                    Similarity Score
                                </span>
                                <span className={`score-item__value ${comp.similarity_score >= 70 ? 'good' : comp.similarity_score >= 50 ? 'medium' : 'bad'}`}>
                                    {comp.similarity_score}%
                                </span>
                            </div>
                            <div className="score-bar">
                                <div
                                    className={`score-bar__fill ${getScoreColor(comp.similarity_score)}`}
                                    style={{ width: `${comp.similarity_score}%` }}
                                />
                            </div>
                        </div>
                        <div className="audit-component-card__meta">
                            Matched: {comp.matched_expert}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="footer-actions" style={{ marginTop: 'var(--space-8)' }}>
                <button className="btn btn-outline" onClick={onBack}>
                    ← Back to Home
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setResult(null)
                        setAuditStep('upload')
                        setPreviewUrl(null)
                    }}
                >
                    Audit Another Screenshot
                </button>
            </div>
        </div>
    )
}
