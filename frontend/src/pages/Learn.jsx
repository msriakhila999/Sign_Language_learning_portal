import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SignCard from '../components/cards/SignCard';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { BookOpen, Filter } from 'lucide-react';

export default function Learn() {
    const [signs, setSigns] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // null = All
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchSigns();
    }, [selectedCategory, searchQuery]);

    const fetchCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    const fetchSigns = async () => {
        try {
            setLoading(true);
            setError('');
            const params = {};
            if (selectedCategory) params.category_id = selectedCategory;
            if (searchQuery) params.search = searchQuery;

            const data = await api.getSigns(params);
            setSigns(data);
        } catch (err) {
            setError(err.message || 'Failed to load sign language catalog.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    <span>Learning Library</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Sign Language Catalog
                </h1>
                <p className="text-slate-600 text-sm max-w-2xl">
                    Browse interactive signs organized by categories. Click any sign card to inspect detailed instructions, hand placement guides, and practice modes.
                </p>
            </div>

            {/* Filter Controls Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                {/* Search Bar */}
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search sign name (e.g. Hello, Water, Letter A)..."
                />

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            selectedCategory === null
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        All Categories
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.category_id}
                            onClick={() => setSelectedCategory(cat.category_id)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                selectedCategory === cat.category_id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat.category_name} ({cat.sign_count || 0})
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Section */}
            {loading ? (
                <LoadingSpinner message="Fetching sign language items..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={fetchSigns} />
            ) : signs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800">No signs found</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                        Try clearing your search query or selecting a different category.
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                        className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {signs.map((sign) => (
                        <SignCard key={sign.sign_id} sign={sign} />
                    ))}
                </div>
            )}
        </div>
    );
}
