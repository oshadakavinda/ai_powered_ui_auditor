import { useState } from 'react'
import UploadPage from './pages/UploadPage'
import VioletRulesPage from './pages/VioletRulesPage'
import ElementInteraction from './pages/ElementInteraction'
import CombinedAnalysis from './pages/CombinedAnalysis'
import UserTesting from './pages/UserTesting'

// Navigation steps for the full flow
type AppStep =
    | 'upload'
    | 'processing'
    | 'violet-rules'
    | 'violet-accuracy'
    | 'notice-modal'
    | 'element-loading'
    | 'element-interaction'
    | 'element-score'
    | 'combined-selection'
    | 'combined-loading'
    | 'combined-highlighted'
    | 'combined-preview'
    | 'permissions'
    | 'recording'
    | 'user-analysis'
    | 'user-results'

export default function App() {
    const [step, setStep] = useState<AppStep>('upload')
    const [uploadedFile, setUploadedFile] = useState<string | null>(null)

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
                    {/* Component 1: Upload */}
                    {step === 'upload' && (
                        <UploadPage
                            onProcess={(fileName) => {
                                setUploadedFile(fileName)
                                setStep('processing')
                                setTimeout(() => setStep('violet-rules'), 2500)
                            }}
                        />
                    )}

                    {/* Component 1: Processing */}
                    {step === 'processing' && (
                        <div className="spinner-container">
                            <div className="spinner" />
                            <div className="spinner-text">UI is Processing</div>
                        </div>
                    )}

                    {/* Component 1: Violet Rules */}
                    {(step === 'violet-rules' || step === 'violet-accuracy') && (
                        <VioletRulesPage
                            step={step}
                            fileName={uploadedFile}
                            onDone={() => setStep('violet-accuracy')}
                            onNext={() => setStep('notice-modal')}
                        />
                    )}

                    {/* Component 2: Notice Modal + Element Interaction */}
                    {(step === 'notice-modal' || step === 'element-loading' ||
                        step === 'element-interaction' || step === 'element-score') && (
                            <ElementInteraction
                                step={step}
                                onImportNew={() => setStep('upload')}
                                onElementInteraction={() => {
                                    setStep('element-loading')
                                    setTimeout(() => setStep('element-interaction'), 2500)
                                }}
                                onGetScore={() => setStep('element-score')}
                                onNext={() => setStep('combined-selection')}
                            />
                        )}

                    {/* Component 3: Combined Analysis */}
                    {(step === 'combined-selection' || step === 'combined-loading' ||
                        step === 'combined-highlighted' || step === 'combined-preview') && (
                            <CombinedAnalysis
                                step={step}
                                onStartAnalysis={() => {
                                    setStep('combined-loading')
                                    setTimeout(() => setStep('combined-highlighted'), 2500)
                                }}
                                onGenerateClean={() => setStep('combined-preview')}
                                onNext={() => setStep('permissions')}
                            />
                        )}

                    {/* Component 4: User Testing */}
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
