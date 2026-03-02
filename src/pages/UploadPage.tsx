import { useState, useRef, useCallback } from 'react'

interface UploadPageProps {
    onProcess: (data: { 
        fileName: string; 
        imageUrl?: string; 
        figmaUrl: string; 
        gitRepoUrl: string; 
        category: string;
    }) => void
}

export default function UploadPage({ onProcess }: UploadPageProps) {
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
            simulateUpload(f.name, `${(f.size / 1024 / 1024).toFixed(0)}MB`, imageUrl)
        }
    }, [])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) {
            const imageUrl = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
            simulateUpload(f.name, `${(f.size / 1024 / 1024).toFixed(0)}MB`, imageUrl)
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
            <h1 className="page-heading">Upload Your Interface Design</h1>

            {/* Toggle Tabs */}
            <div className="toggle-tabs">
                <button
                    className={`toggle-tab ${activeTab === 'interface' ? 'active' : ''}`}
                    onClick={() => setActiveTab('interface')}
                >
                    upload Interface
                </button>
                <button
                    className={`toggle-tab ${activeTab === 'code' ? '' : 'active'}`}
                    onClick={() => setActiveTab('code')}
                    style={activeTab === 'code' ? { background: 'var(--green-primary)', color: 'white' } : undefined}
                >
                    upload Code
                </button>
                <select
                    className="dropdown"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select Category ▾</option>
                    <option value="web">Web Application</option>
                    <option value="mobile">Mobile App</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="ecommerce">E-commerce</option>
                </select>
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

            {/* File Progress */}
            {file && (
                <div className="file-progress mt-6">
                    <div className="file-progress__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="4" fill="#7C4DFF" fillOpacity="0.1" />
                            <path d="M7 7h10v10H7z" fill="#7C4DFF" fillOpacity="0.3" />
                        </svg>
                    </div>
                    <div className="file-progress__info">
                        <div className="file-progress__name">{file.name}</div>
                        <div className="file-progress__meta">{file.size} • {file.progress < 100 ? '1 minute left' : 'Complete'}</div>
                        <div className="file-progress__bar">
                            <div className="file-progress__bar-fill" style={{ width: `${file.progress}%` }} />
                        </div>
                    </div>
                    <div className="file-progress__percent">{Math.round(file.progress)}%</div>
                </div>
            )}

            {/* Process Button */}
            <div className="footer-actions">
                <button
                    className="btn btn-primary btn-primary-lg"
                    onClick={() => onProcess({
                        fileName: file?.name || 'Design File',
                        imageUrl: file?.imageUrl,
                        figmaUrl,
                        gitRepoUrl,
                        category
                    })}
                    style={{ opacity: (file && file.progress >= 100) || figmaUrl.includes('figma.com') ? 1 : 0.5 }}
                >
                    Process Interfaces
                </button>
            </div>
        </div>
    )
}
