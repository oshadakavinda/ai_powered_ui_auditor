import { useState } from 'react'
import UploadPage from './pages/UploadPage'
import AnalysisSelection from './pages/AnalysisSelection'
import VioletRulesPage from './pages/VioletRulesPage'
import ElementInteraction from './pages/ElementInteraction'
import CombinedAnalysis from './pages/CombinedAnalysis'
import UserTesting from './pages/UserTesting'

// Navigation steps
type AppStep =
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
    const [step, setStep] = useState<AppStep>('upload')
    const [uploadedFile, setUploadedFile] = useState<string | null>(null)
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

    const goToUserTesting = () => setStep('permissions')

    return (
        <div className="app-container">
            {/* Title Bar */}
            <div className="title-bar">
                <div className="title-bar__controls">
                    <div className="title-bar__dot title-bar__dot--close" />
                    <div className="title-bar__dot title-bar__dot--minimize" />
                    <div className="title-bar__dot title-bar__dot--maximize" />
                </div>
                <span className="title-bar__text">Smart UI Auditor</span>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="page-enter" key={step}>

                    {/* Page 1: Upload */}
                    {step === 'upload' && (
                        <UploadPage
                            onProcess={(fileName, imageUrl) => {
                                setUploadedFile(fileName)
                                setUploadedImageUrl(imageUrl || null)
                                setStep('analysis-selection')
                            }}
                        />
                    )}

                    {/* Page 2: Analysis Selection (image 12) */}
                    {step === 'analysis-selection' && (
                        <AnalysisSelection
                            uploadedFileName={uploadedFile}
                            uploadedImageUrl={uploadedImageUrl}
                            onStartAnalysis={(option) => {
                                switch (option) {
                                    case 'rules':
                                        setStep('processing')
                                        setTimeout(() => setStep('violet-rules'), 2500)
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
                            }}
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
                            onDone={() => setStep('violet-accuracy')}
                            onNext={goToUserTesting}
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
                                    setStep('user-analysis')
                                    setTimeout(() => setStep('user-results'), 3000)
                                }}
                                onExport={() => alert('Report exported!')}
                                onDiscard={() => setStep('upload')}
                            />
                        )}
                </div>
            </div>
        </div>
    )
}
