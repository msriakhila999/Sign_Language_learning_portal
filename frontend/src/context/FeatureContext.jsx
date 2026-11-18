import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'signbridge_features';

const DEFAULT_FEATURES = {
    signBot: false,    // OFF by default
    signRush: false    // OFF by default
};

const FeatureContext = createContext(null);

export function FeatureProvider({ children }) {
    const [features, setFeaturesState] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    signBot: typeof parsed.signBot === 'boolean' ? parsed.signBot : false,
                    signRush: typeof parsed.signRush === 'boolean' ? parsed.signRush : false
                };
            }
        } catch (e) {
            console.warn('Failed to parse feature settings from storage, using defaults:', e);
        }
        return DEFAULT_FEATURES;
    });

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // Persist changes to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
        } catch (e) {
            console.warn('Failed to persist feature settings:', e);
        }
    }, [features]);

    const setFeature = (key, value) => {
        setFeaturesState((prev) => ({
            ...prev,
            [key]: Boolean(value)
        }));
    };

    const toggleFeature = (key) => {
        setFeaturesState((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const resetFeatures = () => {
        setFeaturesState(DEFAULT_FEATURES);
    };

    const openSettingsModal = () => setIsSettingsModalOpen(true);
    const closeSettingsModal = () => setIsSettingsModalOpen(false);

    return (
        <FeatureContext.Provider
            value={{
                features,
                setFeature,
                toggleFeature,
                resetFeatures,
                isSettingsModalOpen,
                setIsSettingsModalOpen,
                openSettingsModal,
                closeSettingsModal
            }}
        >
            {children}
        </FeatureContext.Provider>
    );
}

export function useFeatures() {
    const context = useContext(FeatureContext);
    if (!context) {
        throw new Error('useFeatures must be used within a FeatureProvider');
    }
    return context;
}
