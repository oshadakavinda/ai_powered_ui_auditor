import { useState, useRef, useCallback } from 'react'

interface UploadPageProps {
    onProcess: (fileName: string, imageUrl?: string) => void
}

export default function UploadPage({ onProcess }: UploadPageProps) {
    const [activeTab, setActiveTab] = useState<'interface' | 'code'>('interface')
    const [category, setCategory] = useState('')
    const [url, setUrl] = useState('https://www.figma.com/design/...')
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
                        <label style={{ fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: 'var(--space-2)', display: 'block' }}>Import from URL</label>
                        <div className="url-input-group">
                            <input
                                className="url-input"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste Figma or design URL..."
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
                    overflow: 'hidden',
                    height: 350,
                    display: 'flex',
                }}>
                    {/* File Explorer */}
                    <div style={{ width: 240, borderRight: '1px solid #333', padding: '12px', overflowY: 'auto' }}>
                        <div style={{ color: '#ccc', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Explorer</div>
                        <div style={{ color: '#e0e0e0', fontSize: '13px' }}>
                            <div style={{ padding: '3px 0' }}>▾ <strong>MY-PROJECT</strong></div>
                            {['src/', 'components/', 'pages/', 'styles/', 'utils/', 'App.tsx', 'index.tsx', 'package.json'].map(f => (
                                <div key={f} style={{ padding: '2px 0 2px 16px', color: '#aaa', cursor: 'pointer' }}>{f}</div>
                            ))}
                        </div>
                    </div>
                    {/* Code View */}
                    <div style={{ flex: 1, padding: '16px', color: '#d4d4d4', fontSize: '13px', fontFamily: 'monospace', lineHeight: 1.6, overflowY: 'auto' }}>
                        <div><span style={{ color: '#608b4e' }}>{'// Main application component'}</span></div>
                        <div><span style={{ color: '#569cd6' }}>import</span> React <span style={{ color: '#569cd6' }}>from</span> <span style={{ color: '#ce9178' }}>'react'</span>;</div>
                        <div><span style={{ color: '#569cd6' }}>import</span> {'{ useState }'} <span style={{ color: '#569cd6' }}>from</span> <span style={{ color: '#ce9178' }}>'react'</span>;</div>
                        <div />
                        <div><span style={{ color: '#569cd6' }}>export default function</span> <span style={{ color: '#dcdcaa' }}>App</span>() {'{'}</div>
                        <div>  <span style={{ color: '#569cd6' }}>const</span> [state, setState] = <span style={{ color: '#dcdcaa' }}>useState</span>({'{}'});</div>
                        <div />
                        <div>  <span style={{ color: '#569cd6' }}>return</span> (</div>
                        <div>    {'<'}<span style={{ color: '#4ec9b0' }}>div</span> className=<span style={{ color: '#ce9178' }}>"app"</span>{'>'}</div>
                        <div>      {'<'}<span style={{ color: '#4ec9b0' }}>Header</span> /{'>'}</div>
                        <div>      {'<'}<span style={{ color: '#4ec9b0' }}>MainContent</span> /{'>'}</div>
                        <div>    {'</'}<span style={{ color: '#4ec9b0' }}>div</span>{'>'}</div>
                        <div>  );</div>
                        <div>{'}'}</div>
                    </div>
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
                    onClick={() => onProcess(file?.name || 'Design File', file?.imageUrl)}
                    style={{ opacity: file && file.progress >= 100 ? 1 : 0.5 }}
                    disabled={!file || file.progress < 100}
                >
                    Process Interfaces
                </button>
            </div>
        </div>
    )
}
