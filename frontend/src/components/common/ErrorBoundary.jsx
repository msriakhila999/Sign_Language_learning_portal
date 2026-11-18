import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Unhandled React Error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[50vh] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-8 text-center space-y-5 animate-in fade-in">
                        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Something Went Wrong</h2>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                An unexpected error occurred while rendering this view. Your other portal modules and data are completely safe.
                            </p>
                            {this.state.error && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left overflow-x-auto text-[11px] text-rose-700 font-mono">
                                    {this.state.error.message || String(this.state.error)}
                                </div>
                            )}
                        </div>
                        <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Try Again</span>
                            </button>
                            <Link
                                to="/"
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                <span>Back Home</span>
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
