import { useState, useRef, useCallback } from 'react'

interface UploadPageProps {
    onBack: () => void;
    onProcess: (data: {
        fileName: string;
        imageUrl?: string;
        figmaUrl: string;
        gitRepoUrl: string;
        category: string;
    }) => void
}

export default function UploadPage({ onBack, onProcess }: UploadPageProps) {
    const [activeTab, setActiveTab] = useState<'interface' | 'code'>('interface')
    const [category, setCategory] = useState('universal')
    const [figmaUrl, setFigmaUrl] = useState('https://www.figma.com/design/...')
    const [gitRepoUrl, setGitRepoUrl] = useState('https://github.com/...')
    const [file, setFile] = useState<{ name: string; size: string; progress: number; imageUrl?: string } | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f) {
            const imageUrl = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
            simulateUpload(f.name, `${(f.size / 1024 / 1024).toFixed(1)}MB`, imageUrl)
        }
    }, [])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) {
            const imageUrl = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
            simulateUpload(f.name, `${(f.size / 1024 / 1024).toFixed(1)}MB`, imageUrl)
        }
    }, [])

    const simulateUpload = (name: string, size: string, imageUrl?: string) => {
        setFile({ name, size, progress: 0, imageUrl })
        let progress = 0
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5
            if (progress >= 100) {
                progress = 100
                clearInterval(interval)
            }
            setFile(prev => prev ? { ...prev, progress } : null)
        }, 300)
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={onBack}
                    className="back-button-circle"
                    title="Back to Home"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h1 className="page-heading" style={{ margin: 0 }}>Upload Your Interface Design</h1>
            </div>


            {activeTab === 'interface' ? (
                <>
                    {/* Drag & Drop Zone */}
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
                        <p className="upload-zone__formats">fig, zip, pdf, png, jpeg</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".fig,.zip,.pdf,.png,.jpeg,.jpg"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* OR Divider */}
                    <div style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)', position: 'relative' }}>
                        <hr className="divider" style={{ margin: 0 }} />
                        <span style={{ background: 'var(--bg-primary)', padding: '0 1rem', position: 'relative', top: '-0.7rem' }}>OR</span>
                    </div>

                    {/* URL Input */}
                    <div>
                        <label style={{ fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: 'var(--space-2)', display: 'block' }}>Import from Figma URL</label>
                        <div className="url-input-group">
                            <input
                                className="url-input"
                                value={figmaUrl}
                                onChange={(e) => setFigmaUrl(e.target.value)}
                                placeholder="Paste Figma design URL..."
                            />
                            <button
                                className="btn btn-primary"
                                onClick={() => simulateUpload('Design from URL', '15MB')}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* Code Upload Tab */
                <div style={{
                    background: '#1e1e1e',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    height: 350,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    <div className="upload-zone__icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                        </svg>
                    </div>
                    <div style={{ width: '100%', maxWidth: '500px' }}>
                        <label style={{ color: '#ccc', fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: 'var(--space-2)', display: 'block' }}>Import from Git Repository</label>
                        <div className="url-input-group">
                            <input
                                className="url-input"
                                style={{ background: '#2d2d2d', borderColor: '#444' }}
                                value={gitRepoUrl}
                                onChange={(e) => setGitRepoUrl(e.target.value)}
                                placeholder="Paste repository URL (GitHub/GitLab)..."
                            />
                            <button
                                className="btn"
                                style={{ background: 'var(--green-primary)', color: 'white' }}
                                onClick={() => simulateUpload('Code from Repository', '2MB')}
                            >
                                Import
                            </button>
                        </div>
                    </div>
                    <p style={{ color: '#666', fontSize: '12px' }}>Analyzing the codebase for UI patterns and rule compliance.</p>
                </div>
            )}

            {/* File Progress & Preview */}
            {(file || (figmaUrl && figmaUrl !== 'https://www.figma.com/design/...')) && (
                <div className="preview-container mt-8">
                    <h3 className="section-label mb-4">Design Preview</h3>

                    {file && (
                        <div className="file-progress mb-6">
                            <div className="file-progress__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect width="24" height="24" rx="4" fill="#7C4DFF" fillOpacity="0.1" />
                                    <path d="M7 7h10v10H7z" fill="#7C4DFF" fillOpacity="0.3" />
                                </svg>
                            </div>
                            <div className="file-progress__info">
                                <div className="file-progress__name">{file.name}</div>
                                <div className="file-progress__meta">{file.size} • {file.progress < 100 ? 'Processing...' : 'Ready for Audit'}</div>
                                <div className="file-progress__bar">
                                    <div className="file-progress__bar-fill" style={{ width: `${file.progress}%` }} />
                                </div>
                            </div>
                            <div className="file-progress__percent">{Math.round(file.progress)}%</div>
                        </div>
                    )}

                    <div className="design-preview-card">
                        {file?.imageUrl && file.progress >= 100 ? (
                            <img src={file.imageUrl} alt="Preview" className="design-preview-img" />
                        ) : figmaUrl && figmaUrl !== 'https://www.figma.com/design/...' ? (
                            <div className="figma-preview-placeholder">
                                <div className="figma-icon-wrapper">
                                    <svg width="40" height="40" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 28.5C19 25.9837 20.0009 23.5706 21.7825 21.7891C23.564 20.0076 25.9771 19.0067 28.4933 19.0067C31.0096 19.0067 33.4227 20.0076 35.2042 21.7891C36.9857 23.5706 37.9867 25.9837 37.9867 28.5L37.9867 38H28.4933C25.9771 38 23.564 36.9991 21.7825 35.2175C20.0009 33.436 19 31.0229 19 28.5Z" fill="#1ABCFE" />
                                        <path d="M0 47.5C0 44.9837 1.00089 42.5706 2.78249 40.7891C4.56408 39.0076 6.9771 38.0067 9.49333 38.0067H19V47.5C19 50.0163 17.9991 52.4294 16.2175 54.2109C14.436 55.9924 12.0229 56.9933 9.49333 56.9933C6.9771 56.9933 4.56408 55.9924 2.78249 54.2109C1.00089 52.4294 0 50.0163 0 47.5Z" fill="#0ACF83" />
                                        <path d="M0 28.5C0 25.9837 1.00089 23.5706 2.78249 21.7891C4.56408 20.0076 6.9771 19.0067 9.49333 19.0067H19V38H9.49333C6.9771 38 4.56408 36.9991 2.78249 35.2175C1.00089 33.436 0 31.0229 0 28.5Z" fill="#A259FF" />
                                        <path d="M0 9.5C0 6.9837 1.00089 4.5706 2.78249 2.78909C4.56408 1.00759 6.9771 0.00665283 9.49333 0.00665283H19V19H9.49333C6.9771 19 4.56408 17.9991 2.78249 16.2175C1.00089 14.436 0 12.0229 0 9.5Z" fill="#F24E1E" />
                                        <path d="M19 0.00665283H28.4933C31.0096 0.00665283 33.4227 1.00759 35.2042 2.78909C36.9857 4.5706 37.9867 6.9837 37.9867 9.5C37.9867 12.0163 36.9857 14.4294 35.2042 16.2109C33.4227 17.9924 31.0096 18.9933 28.4933 18.9933H19V0.00665283Z" fill="#FF7262" />
                                    </svg>
                                </div>
                                <div className="figma-preview-text">
                                    <h4>Figma Design Detected</h4>
                                    <p>{figmaUrl}</p>
                                </div>
                                <div className="figma-status-badge">Link Verified</div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Process Button */}
            <div className="footer-actions mt-12">
                <button
                    className="btn btn-primary btn-primary-lg shadow-glow"
                    onClick={() => onProcess({
                        fileName: file?.name || 'Figma Design',
                        imageUrl: file?.imageUrl,
                        figmaUrl,
                        gitRepoUrl,
                        category
                    })}
                    disabled={!((file && file.progress >= 100) || (figmaUrl && figmaUrl.includes('figma.com')))}
                    style={{
                        opacity: (file && file.progress >= 100) || (figmaUrl && figmaUrl.includes('figma.com')) ? 1 : 0.5,
                        cursor: (file && file.progress >= 100) || (figmaUrl && figmaUrl.includes('figma.com')) ? 'pointer' : 'not-allowed'
                    }}
                >
                    Process Interfaces
                </button>
            </div>
        </div>
    )
}
