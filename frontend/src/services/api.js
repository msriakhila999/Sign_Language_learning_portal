const API_BASE_URL = '/api';

function getAuthHeaders() {
    const token = localStorage.getItem('signbridge_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        const text = await response.text();

        let data = {};
        if (text && text.trim()) {
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.warn(`Non-JSON response from [${endpoint}]:`, text.slice(0, 200));
                if (!response.ok) {
                    throw new Error(`Server returned HTTP ${response.status}: ${text.slice(0, 150)}`);
                }
                throw new Error(`Invalid server response format (${parseErr.message})`);
            }
        } else if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status} with empty response.`);
        }

        if (!response.ok) {
            const errorMessage = data.message || data.error || `HTTP Error ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error(`API Request Error [${endpoint}]:`, error.message);
        throw error;
    }
}

export const api = {
    // Auth
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),

    // Categories & Signs
    getCategories: () => request('/categories'),
    getSigns: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/signs${query ? `?${query}` : ''}`);
    },
    getSignById: (id) => request(`/signs/${id}`),

    // Translations
    saveTranslation: (translationData) => request('/translations', { method: 'POST', body: JSON.stringify(translationData) }),
    getTranslationHistory: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/translations/history${query ? `?${query}` : ''}`);
    },
    clearTranslationHistory: () => request('/translations/history', { method: 'DELETE' }),

    // Practice
    recordPractice: (practiceData) => request('/practice', { method: 'POST', body: JSON.stringify(practiceData) }),
    getPracticeHistory: () => request('/practice/history'),

    // Progress & Dashboard
    getDashboardStats: () => request('/dashboard/stats'),
    getProgress: () => request('/progress'),

    // Profile
    getProfile: () => request('/profile'),
    updateProfile: (profileData) => request('/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

    // AI Assistant
    getAIStatus: () => request('/ai/status'),
    chatWithAI: (message, context = {}) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) })
};
