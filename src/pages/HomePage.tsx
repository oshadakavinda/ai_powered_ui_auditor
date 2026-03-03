import React from 'react';

interface HomePageProps {
    onNavigate: (step: 'upload' | 'permissions') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    return (
        <div className="home-page">
            <h1 className="page-heading">Welcome to Smart UI Auditor</h1>
            <p className="page-subheading">Select a feature to get started with your UI analysis.</p>

            <div className="feature-grid">
                <div className="feature-card" onClick={() => onNavigate('upload')}>
                    <div className="feature-card__icon">🎨</div>
                    <h3 className="feature-card__title">AI Audit</h3>
                    <p className="feature-card__desc">
                        Upload Figma URLs and Git repositories to analyze UI consistency and violations.
                    </p>
                    <button className="btn btn-primary">Start Audit</button>
                </div>

                <div className="feature-card" onClick={() => onNavigate('permissions')}>
                    <div className="feature-card__icon">📹</div>
                    <h3 className="feature-card__title">User Testing</h3>
                    <p className="feature-card__desc">
                        Record user sessions and screen interactions to identify usability issues.
                    </p>
                    <button className="btn btn-primary">Start Testing</button>
                </div>

                <div className="feature-card disabled">
                    <div className="feature-card__icon">⚙️</div>
                    <h3 className="feature-card__title">More Options</h3>
                    <p className="feature-card__desc">
                        Additional analysis features and configurations will be available soon.
                    </p>
                    <button className="btn btn-outline" disabled>Coming Soon</button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
