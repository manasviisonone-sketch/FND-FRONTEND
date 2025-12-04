import React, { useState } from 'react';

const NewsChecker: React.FC = () => {
    const [article, setArticle] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/check-news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ article }),
            });

            const data = await response.json();
            setResult(data.result);
        } catch (error) {
            setResult('Error detecting news.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Fake News Detector</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    placeholder="Enter news article here..."
                    rows={5}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Checking...' : 'Check News'}
                </button>
            </form>
            {result && <div className="result">{result}</div>}
        </div>
    );
};

export default NewsChecker;