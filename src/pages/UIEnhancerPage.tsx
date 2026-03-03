import React, { useState } from 'react';

interface UIEnhancerPageProps {
    onBack: () => void;
}

const UIEnhancerPage: React.FC<UIEnhancerPageProps> = ({ onBack }) => {
    const [file, setFile] = useState<File | null>(null);
    const [jsonFile, setJsonFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'json') => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (type === 'image') {
                setFile(selectedFile);
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
                setJsonFile(selectedFile);
            }
        }
    };

    const handleGenerate = async () => {
        if (!file || !jsonFile) {
            setError('Please upload both an image and the corresponding audit JSON file.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResults(null);

        try {
            const formData = new FormData();
            formData.append('ui_image', file);
            formData.append('audit_json', jsonFile);

            const response = await fetch('http://localhost:8000/feedback/generate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || errData.error || 'Failed to generate improved UI.');
            }

            const data = await response.json();
            setResults(data);
        } catch (err: any) {
            console.error('Generator error:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="page-container page-enter">
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
                <h1 className="page-heading" style={{ margin: 0 }}>AI UI Enhancer</h1>
            </div>
            <p className="page-subheading">
                Upload your UI screenshot and audit JSON to get prioritized enhancements and a Midjourney/Stable Diffusion prompt.
            </p>

            <div className="card shadow-sm" style={{ padding: '2rem', marginTop: '1rem' }}>
                {!results ? (
                    <div className="upload-section">
                        {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #f87171', borderRadius: '4px' }}>{error}</div>}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload UI Screenshot (JPG/PNG)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'image')}
                                    style={{ display: 'block', width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload Audit Data (JSON)</label>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => handleFileChange(e, 'json')}
                                    style={{ display: 'block', width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                />
                            </div>
                        </div>

                        {previewUrl && (
                            <div className="preview-container" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Image Preview</p>
                                <img src={previewUrl} alt="UI Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                            onClick={handleGenerate}
                            disabled={isProcessing || !file || !jsonFile}
                        >
                            {isProcessing ? 'Analyzing and Generating...' : 'Generate Improvements'}
                        </button>
                    </div>
                ) : (
                    <div className="results-section" style={{ animation: 'fade-in 0.5s ease-out' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Enhancement Results</h2>
                            <p style={{ display: 'inline-block', background: 'var(--bg-accent)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                                Top Priority: {results.synthesis_message}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Step 1: Technical Fixes</h3>
                                <img src={`http://localhost:8000${results.images.phase1_technical}`} alt="Technical Fixes" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                            </div>

                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Step 2: Aesthetic Enhancements</h3>
                                <img src={`http://localhost:8000${results.images.phase2_aesthetic}`} alt="Aesthetic Fixes" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                            </div>

                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Step 3: Synthesis Output</h3>
                                <img src={`http://localhost:8000${results.images.phase3_synthesis}`} alt="Synthesis Fixes" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Generated Prompt</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Use this prompt in Midjourney or Stable Diffusion to generate an improved design.</p>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    readOnly
                                    value={results.generator_prompt}
                                    style={{ width: '100%', height: '150px', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', resize: 'none', lineHeight: '1.5' }}
                                />
                                <button
                                    className="btn btn-outline"
                                    style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                    onClick={() => navigator.clipboard.writeText(results.generator_prompt)}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <button
                            className="btn btn-outline"
                            style={{ marginTop: '2rem', width: '100%' }}
                            onClick={() => {
                                setResults(null);
                                setFile(null);
                                setJsonFile(null);
                                setPreviewUrl(null);
                            }}
                        >
                            Analyze Another UI
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UIEnhancerPage;
