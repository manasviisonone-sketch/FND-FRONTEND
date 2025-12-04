import React, { useState } from 'react';
import { 
  analyzeNews, 
  checkNewsFromUrl, 
  NewsAnalysisResult, 
  NewsAnalysisRequest,
  validateNewsContent,
  formatConfidence,
  getConfidenceLevel
} from '../utils/api';

interface NewsAnalyzerProps {
  onAnalysisComplete?: (result: NewsAnalysisResult) => void;
}

const NewsAnalyzer: React.FC<NewsAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [formData, setFormData] = useState<NewsAnalysisRequest>({
    title: '',
    content: '',
    source: '',
    url: ''
  });
  const [analysisMode, setAnalysisMode] = useState<'text' | 'url'>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NewsAnalysisResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      setIsLoading(true);

      if (analysisMode === 'text') {
        // Validate form data
        const validationError = validateNewsContent(formData.title, formData.content);
        if (validationError) {
          setError(validationError);
          return;
        }

        const result = await analyzeNews(formData);
        setResult(result);
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
      } else {
        // URL mode
        const url = formData.url?.trim() || '';
        if (!url) {
          setError('URL is required');
          return;
        }

        // Basic URL validation
        try {
          new URL(url);
        } catch {
          setError('Please enter a valid URL');
          return;
        }

        const result = await checkNewsFromUrl(url);
        setResult(result);
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      title: '',
      content: '',
      source: '',
      url: ''
    });
    setResult(null);
    setError(null);
  };

  const renderResult = () => {
    if (!result) return null;

    const confidenceLevel = getConfidenceLevel(result.confidence);
    const confidenceText = formatConfidence(result.confidence);

    return (
      <div className="results-section fade-in">
        <div className="result-card">
          <div className="result-header">
            <h3 className="result-title">Analysis Result</h3>
            <span className={`confidence-badge confidence-${confidenceLevel}`}>
              {confidenceText} Confidence
            </span>
          </div>
          
          <div className={`prediction-result prediction-${result.prediction.toLowerCase()}`}>
            <strong>Prediction: {result.prediction}</strong>
          </div>

          <div className="result-details">
            <div className="probability-section">
              <h4>Probability Breakdown:</h4>
              <div className="probability-bars">
                <div className="probability-item">
                  <span>Real: {formatConfidence(result.probability.real)}</span>
                  <div className="probability-bar">
                    <div 
                      className="probability-fill real" 
                      style={{ width: `${result.probability.real * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="probability-item">
                  <span>Fake: {formatConfidence(result.probability.fake)}</span>
                  <div className="probability-bar">
                    <div 
                      className="probability-fill fake" 
                      style={{ width: `${result.probability.fake * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {result.analysis && (
              <div className="analysis-details">
                <h4>Detailed Analysis:</h4>
                <div className="analysis-grid">
                  <div className="analysis-item">
                    <strong>Sentiment:</strong> {result.analysis.sentiment}
                  </div>
                  <div className="analysis-item">
                    <strong>Word Count:</strong> {result.analysis.word_count}
                  </div>
                  <div className="analysis-item">
                    <strong>Readability Score:</strong> {result.analysis.readability_score?.toFixed(2)}
                  </div>
                  {result.analysis.keywords && result.analysis.keywords.length > 0 && (
                    <div className="analysis-item keywords">
                      <strong>Key Terms:</strong>
                      <div className="keyword-tags">
                        {result.analysis.keywords.slice(0, 10).map((keyword, index) => (
                          <span key={index} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="timestamp">
              <small>Analyzed on: {new Date(result.timestamp).toLocaleString()}</small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="news-analyzer">
      <div className="input-section">
        <div className="mode-selector">
          <button 
            type="button"
            className={`mode-btn ${analysisMode === 'text' ? 'active' : ''}`}
            onClick={() => setAnalysisMode('text')}
          >
            📝 Analyze Text
          </button>
          <button 
            type="button"
            className={`mode-btn ${analysisMode === 'url' ? 'active' : ''}`}
            onClick={() => setAnalysisMode('url')}
          >
            🔗 Analyze URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          {analysisMode === 'text' ? (
            <>
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  News Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter the news article title..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  News Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="form-input form-textarea"
                  placeholder="Paste the full news article content here..."
                  required
                />
                <small className="char-count">
                  {formData.content.length} / 10,000 characters
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="source" className="form-label">
                  Source (Optional)
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., CNN, BBC, Reuters..."
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label htmlFor="url" className="form-label">
                News Article URL *
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://example.com/news-article"
                required
              />
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isLoading}
            >
              {isLoading && <span className="loading-spinner"></span>}
              {isLoading ? 'Analyzing...' : '🔍 Analyze News'}
            </button>
            
            <button 
              type="button" 
              className="clear-btn" 
              onClick={handleClear}
              disabled={isLoading}
            >
              🗑️ Clear
            </button>
          </div>
        </form>
      </div>

      {renderResult()}
    </div>
  );
};

export default NewsAnalyzer;
