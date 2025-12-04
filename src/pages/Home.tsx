import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import NewsAnalyzer from '../components/NewsAnalyzer';
import { NewsAnalysisResult, getApiHealth, ApiHealthStatus } from '../utils/api';

const Home: React.FC = () => {
    const [currentSection, setCurrentSection] = useState('home');
    const [analysisHistory, setAnalysisHistory] = useState<NewsAnalysisResult[]>([]);
    const [apiStatus, setApiStatus] = useState<ApiHealthStatus>('offline');

    const handleNavigate = (section: string) => {
        setCurrentSection(section);
    };

    const handleAnalysisComplete = (result: NewsAnalysisResult) => {
        setAnalysisHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    };

    // Poll backend health
    useEffect(() => {
        let mounted = true;
        const check = async () => {
            const status = await getApiHealth();
            if (mounted) setApiStatus(status);
        };
        check();
        const id = setInterval(check, 30000); // every 30s
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, []);

    const renderContent = () => {
        switch (currentSection) {
            case 'analyze':
                return (
                    <div className="container">
                        <NewsAnalyzer onAnalysisComplete={handleAnalysisComplete} />
                    </div>
                );
            
            case 'history':
                return (
                    <div className="container">
                        <div className="history-section">
                            <h2>Analysis History</h2>
                            {analysisHistory.length === 0 ? (
                                <div className="empty-state">
                                    <p>No analysis history yet. Start by analyzing some news articles!</p>
                                </div>
                            ) : (
                                <div className="history-list">
                                    {analysisHistory.map((result, index) => (
                                        <div key={index} className="history-item">
                                            <div className="history-header">
                                                <span className={`prediction-badge prediction-${result.prediction.toLowerCase()}`}>
                                                    {result.prediction}
                                                </span>
                                                <span className="history-date">
                                                    {new Date(result.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="history-confidence">
                                                Confidence: {(result.confidence * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            
            case 'about':
                return (
                    <div className="container">
                        <div className="about-section">
                            <div className="hero-section">
                                <h2>About Fake News Detection</h2>
                                <p>
                                    Our advanced AI-powered system helps you identify potentially fake or misleading news articles 
                                    using state-of-the-art machine learning algorithms and natural language processing techniques.
                                </p>
                            </div>
                            
                            <div className="features-grid">
                                <div className="feature-card">
                                    <h3>🤖 AI-Powered Analysis</h3>
                                    <p>Advanced machine learning models trained on thousands of verified news articles.</p>
                                </div>
                                <div className="feature-card">
                                    <h3>⚡ Real-time Detection</h3>
                                    <p>Get instant results with confidence scores and detailed analysis.</p>
                                </div>
                                <div className="feature-card">
                                    <h3>📊 Detailed Insights</h3>
                                    <p>Comprehensive analysis including sentiment, readability, and key terms.</p>
                                </div>
                                <div className="feature-card">
                                    <h3>🔗 URL Analysis</h3>
                                    <p>Analyze articles directly from URLs without copy-pasting content.</p>
                                </div>
                            </div>
                            
                            <div className="how-it-works">
                                <h3>How It Works</h3>
                                <ol>
                                    <li>Enter a news article title and content, or provide a URL</li>
                                    <li>Our AI analyzes the text for patterns associated with fake news</li>
                                    <li>Get a prediction with confidence score and detailed analysis</li>
                                    <li>Review the results and make informed decisions</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                );
            
            default:
                return (
                    <div className="container">
                        <div className="home">
                            <div className="hero-section">
                                <h1 className="hero-title">Fake News Detection</h1>
                                <p className="hero-subtitle">
                                    Combat misinformation with AI-powered news verification. 
                                    Analyze news articles instantly and get detailed insights about their authenticity.
                                </p>
                                <button 
                                    className="submit-btn"
                                    onClick={() => handleNavigate('analyze')}
                                >
                                    🚀 Start Analyzing
                                </button>
                            </div>
                            
                            <div className="features-preview">
                                <div className="feature-preview">
                                    <h3>🎯 Accurate Detection</h3>
                                    <p>Advanced AI algorithms provide reliable fake news detection with confidence scores.</p>
                                </div>
                                <div className="feature-preview">
                                    <h3>🔍 Deep Analysis</h3>
                                    <p>Get detailed insights including sentiment analysis, readability scores, and key terms.</p>
                                </div>
                                <div className="feature-preview">
                                    <h3>⚡ Instant Results</h3>
                                    <p>Real-time analysis with immediate feedback and comprehensive reporting.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="App">
            <Header onNavigate={handleNavigate} currentSection={currentSection} apiStatus={apiStatus} />
            {renderContent()}
        </div>
    );
};

export default Home;