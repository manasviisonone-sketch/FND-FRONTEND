import axios from 'axios';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://fnd-backend-j6ng.onrender.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types for API responses
export interface NewsAnalysisResult {
  prediction: 'REAL' | 'FAKE';
  confidence: number;
  probability: {
    real: number;
    fake: number;
  };
  analysis: {
    sentiment: string;
    keywords: string[];
    readability_score: number;
    word_count: number;
  };
  timestamp: string;
}

export interface NewsAnalysisRequest {
  title: string;
  content: string;
  source?: string;
  url?: string;
}

// API Functions
export const analyzeNews = async (newsData: NewsAnalysisRequest): Promise<NewsAnalysisResult> => {
  try {
    // THIS IS THE FIX:
    const requestBody = {
      text: newsData.content // Create the object your backend expects
    };

    // NOW SEND THE NEW OBJECT INSTEAD:
    const response = await apiClient.post('/analyze', requestBody);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Invalid news content provided');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to analyze news. Please try again.');
    }
  }
};

export const checkNewsFromUrl = async (url: string): Promise<NewsAnalysisResult> => {
  try {
    const response = await apiClient.post('/analyze-url', { url });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Invalid URL provided');
    } else if (error.response?.status === 404) {
      throw new Error('Article not found at the provided URL');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to analyze URL. Please try again.');
    }
  }
};

export const getAnalysisHistory = async (): Promise<NewsAnalysisResult[]> => {
  try {
    const response = await apiClient.get('/history');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch analysis history.');
  }
};

// Utility function to validate news content
export const validateNewsContent = (title: string, content: string): string | null => {
  if (!title.trim()) {
    return 'Title is required';
  }
  if (title.length < 5) {
    return 'Title must be at least 5 characters long';
  }
  if (!content.trim()) {
    return 'Content is required';
  }
  if (content.length < 50) {
    return 'Content must be at least 50 characters long';
  }
  if (content.length > 10000) {
    return 'Content must be less than 10,000 characters';
  }
  return null;
};

// Utility function to format confidence score
export const formatConfidence = (confidence: number): string => {
  return `${(confidence * 100).toFixed(1)}%`;
};

// Utility function to get confidence level
export const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
};

// Health check
export type ApiHealthStatus = 'online' | 'offline';

export const getApiHealth = async (): Promise<ApiHealthStatus> => {
  try {
    const response = await apiClient.get('/health');
    if (response.status >= 200 && response.status < 300) {
      return 'online';
    }
    return 'offline';
  } catch {
    return 'offline';
  }
};