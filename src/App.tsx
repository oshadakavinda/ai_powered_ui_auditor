import { useState } from 'react'
import UploadPage from './pages/UploadPage'
import AnalysisSelection from './pages/AnalysisSelection'
import VioletRulesPage from './pages/VioletRulesPage'
import ElementInteraction from './pages/ElementInteraction'
import CombinedAnalysis from './pages/CombinedAnalysis'
import UserTesting from './pages/UserTesting'
import HomePage from './pages/HomePage'
import ElementAuditPage from './pages/ElementAuditPage'
import UIEnhancerPage from './pages/UIEnhancerPage'

// Navigation steps
type AppStep =
    | 'home'
    | 'ui-enhancer'
    | 'element-audit'
    | 'upload'
    | 'analysis-selection'
    // Option 1: Violet Rules flow
    | 'processing'
    | 'violet-rules'
    | 'violet-accuracy'
    // Option 2: Element Interaction flow
    | 'element-loading'
    | 'element-interaction'
    | 'element-score'
    // Option 3: Combined Analysis flow
    | 'combined-loading'
    | 'combined-highlighted'
    | 'combined-preview'
    // After any flow → User Testing
    | 'permissions'
    | 'recording'
    | 'user-analysis'
    | 'user-results'

export default function App() {
    const [step, setStep] = useState<AppStep>('home')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<string | null>(null)
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

    // New states for AI Audit
    const [figmaUrl, setFigmaUrl] = useState<string>('')
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('')
    const [category, setCategory] = useState<string>('universal')
    const [auditResult, setAuditResult] = useState<any>(null)

    const handleProcess = async (option: 'rules' | 'elements' | 'all') => {
        switch (option) {
            case 'rules':
                setStep('processing')
                try {
                    let response;
                    const isFigmaDefault = figmaUrl === 'https://www.figma.com/design/...' || !figmaUrl;

                    if (uploadedImageUrl && (isFigmaDefault || uploadedImageUrl.startsWith('blob:'))) {
                        // 🖼️ Image Upload Flow (Actual file uploaded or placeholder used with image)
                        const blob = await fetch(uploadedImageUrl).then(r => r.blob());
                        const formData = new FormData();
                        formData.append('file', blob, uploadedFile || 'design.png');
                        formData.append('profile', category || 'universal');

                        response = await fetch('http://localhost:8000/audit/smart', {
                            method: 'POST',
                            body: formData
                        });
                    } else {
                        // 🔗 URL Audit Flow
                        response = await fetch('http://localhost:8000/audit/url', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                figma_url: figmaUrl,
                                git_repo_url: gitRepoUrl,
                                profile: category || 'universal'
                            })
                        });
                    }

                    const data = await response.json()
                    setAuditResult(data)
                    setStep('violet-rules')
                } catch (error) {
                    console.error('Audit failed:', error)
                    setStep('upload')
                    alert('Audit failed. Please ensure the server is running.')
                }
                break
            case 'elements':
                setStep('element-loading')
                setTimeout(() => setStep('element-interaction'), 2500)
                break
            case 'all':
                setStep('combined-loading')
                setTimeout(() => setStep('combined-highlighted'), 2500)
                break
        }
    }

    const goToUserTesting = () => setStep('permissions')

    return (
        <div className="app-container">
            {/* Title Bar */}
            <div className="title-bar">


                <div className="title-bar__menu-container">
                    <button
                        className="title-bar__menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className="hamburger">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>

                    {isMenuOpen && (
                        <div className="menu-dropdown">
                            <button className="menu-item" onClick={() => { setStep('home'); setIsMenuOpen(false); }}>
                                <span className="menu-item__icon">🏠</span> Home
                            </button>
                            <button className="menu-item" onClick={() => { setStep('upload'); setIsMenuOpen(false); }}>
                                <span className="menu-item__icon">🎨</span> AI Audit
                            </button>
                            <button className="menu-item" onClick={() => { setStep('element-audit'); setIsMenuOpen(false); }}>
                                <span className="menu-item__icon">🔍</span> UI Element Auditor
                            </button>
                            <button className="menu-item" onClick={() => { setStep('ui-enhancer'); setIsMenuOpen(false); }}>
                                <span className="menu-item__icon">✨</span> UI Enhancer
                            </button>
                            <button className="menu-item" onClick={() => { setStep('permissions'); setIsMenuOpen(false); }}>
                                <span className="menu-item__icon">📹</span> User Testing
                            </button>
                            <div className="menu-divider"></div>
                            <button className="menu-item disabled">
                                <span className="menu-item__icon">⚙️</span> Settings
                            </button>
                        </div>
                    )}
                </div>

                <span className="title-bar__text">Smart UI Auditor</span>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="page-enter" key={
                    ['permissions', 'recording', 'user-analysis', 'user-results'].includes(step) 
                    ? 'user-testing' 
                    : step
                }>

                    {/* Page 0: Home */}
                    {step === 'home' && (
                        <HomePage 
                            onNavigate={(target) => {
                                // Clear uploaded image when navigating from home to ensure fresh start
                                if (target === 'element-audit') {
                                    setUploadedImageUrl(null);
                                }
                                setStep(target as AppStep);
                            }} 
                        />
                    )}

                    {/* UI Element Auditor */}
                    {step === 'element-audit' && (
                        <ElementAuditPage 
                            onBack={() => setStep('home')} 
                            initialImageUrl={uploadedImageUrl}
                        />
                    )}

                    {/* UI Enhancer Page */}
                    {step === 'ui-enhancer' && (
                        <UIEnhancerPage onBack={() => setStep('home')} />
                    )}

                    {/* Page 1: Upload */}
                    {step === 'upload' && (
                        <UploadPage
                            onProcess={(data) => {
                                setUploadedFile(data.fileName)
                                setUploadedImageUrl(data.imageUrl || null)
                                setFigmaUrl(data.figmaUrl || '')
                                setGitRepoUrl(data.gitRepoUrl || '')
                                setCategory(data.category || 'universal')
                                // Directly trigger the rules processing
                                handleProcess('rules')
                            }}
                        />
                    )}

                    {/* Page 2: Analysis Selection */}
                    {step === 'analysis-selection' && (
                        <AnalysisSelection
                            uploadedFileName={uploadedFile}
                            uploadedImageUrl={uploadedImageUrl}
                            onStartAnalysis={handleProcess}
                        />
                    )}

                    {/* Option 1: Processing → Violet Rules */}
                    {step === 'processing' && (
                        <div className="spinner-container">
                            <div className="spinner" />
                            <div className="spinner-text">UI is Processing</div>
                        </div>
                    )}

                    {(step === 'violet-rules' || step === 'violet-accuracy') && (
                        <VioletRulesPage
                            step={step}
                            fileName={uploadedFile}
                            auditResult={auditResult}
                            onDone={() => setStep('violet-accuracy')}
                            onNext={() => setStep('element-audit')}
                        />
                    )}

                    {/* Option 2: Element Interaction */}
                    {step === 'element-loading' && (
                        <div className="spinner-container">
                            <div className="spinner" />
                            <div className="spinner-text">Loading<br />Element Interaction</div>
                        </div>
                    )}

                    {(step === 'element-interaction' || step === 'element-score') && (
                        <ElementInteraction
                            step={step}
                            onImportNew={() => setStep('upload')}
                            onElementInteraction={() => { }}
                            onGetScore={() => setStep('element-score')}
                            onNext={goToUserTesting}
                        />
                    )}

                    {/* Option 3: Combined Analysis */}
                    {step === 'combined-loading' && (
                        <div className="spinner-container">
                            <div className="spinner" />
                            <div className="spinner-text">Loading<br />Combined Analysis</div>
                        </div>
                    )}

                    {(step === 'combined-highlighted' || step === 'combined-preview') && (
                        <CombinedAnalysis
                            step={step}
                            onStartAnalysis={() => { }}
                            onGenerateClean={() => setStep('combined-preview')}
                            onNext={goToUserTesting}
                        />
                    )}

                    {/* User Testing (after any flow) */}
                    {(step === 'permissions' || step === 'recording' ||
                        step === 'user-analysis' || step === 'user-results') && (
                            <UserTesting
                                step={step}
                                onStartRecording={() => setStep('recording')}
                                onStopRecording={() => {
                                    setStep('user-results')
                                }}
                                onAnalyse={() => setStep('user-analysis')}
                                onBackToReview={() => setStep('recording')}
                                onExport={() => alert('Report exported!')}
                                onDiscard={() => setStep('permissions')}
                            />
                        )}
                </div>
            </div>
        </div>
    )
}
