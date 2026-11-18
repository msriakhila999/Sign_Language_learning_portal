import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FeatureProvider } from './context/FeatureContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FeatureSettingsModal from './components/common/FeatureSettingsModal';
import SignBotAssistant from './components/ai/SignBotAssistant';
import ErrorBoundary from './components/common/ErrorBoundary';

import Home from './pages/Home';
import Learn from './pages/Learn';
import SignDetails from './pages/SignDetails';
import Translate from './pages/Translate';
import Practice from './pages/Practice';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import SignRush from './pages/SignRush';
import FeatureSettings from './pages/FeatureSettings';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <FeatureProvider>
                <Router>
                    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
                        <Navbar />
                        <main className="flex-1">
                            <ErrorBoundary>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/learn" element={<Learn />} />
                                    <Route path="/sign/:id" element={<SignDetails />} />
                                    <Route path="/translate" element={<Translate />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/settings" element={<FeatureSettings />} />

                                    {/* Optional Gamification Feature Route */}
                                    <Route path="/rush" element={<SignRush />} />
                                    <Route path="/challenge" element={<SignRush />} />

                                    {/* Logged-in / Protected Routes */}
                                    <Route path="/practice" element={<Practice />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/history" element={<History />} />
                                    <Route path="/profile" element={<Profile />} />

                                    {/* Fallback Catch-all */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </ErrorBoundary>
                        </main>
                        
                        {/* Optional Features Components */}
                        <SignBotAssistant />
                        <FeatureSettingsModal />

                        <Footer />
                    </div>
                </Router>
            </FeatureProvider>
        </AuthProvider>
    );
}
