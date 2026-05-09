import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCareerStore } from '../context/careerStore';

/**
 * Login Page
 * Authentication for students and admins
 */
export default function Login() {
    const navigate = useNavigate();
    const { login, register, loading, error } = useCareerStore();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        let result;
        if (isRegister) {
            result = await register(formData.email, formData.password, formData.name);
        } else {
            result = await login(formData.email, formData.password);
        }

        if (result.success) {
            navigate('/explore');
        }
    };

    const fillDemo = (type) => {
        if (type === 'admin') {
            setFormData({ email: 'admin@careercompass.com', password: 'admin123', name: '' });
        } else {
            setFormData({ email: 'student@demo.com', password: 'student123', name: '' });
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <a href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
                        <span className="text-3xl">🧭</span>
                        <span>Career Compass</span>
                    </a>
                </div>

                {/* Form Card */}
                <div className="glass rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-400 text-center mb-6">
                        {isRegister
                            ? 'Start your career exploration journey'
                            : 'Sign in to continue exploring'
                        }
                    </p>

                    {/* Demo credentials buttons */}
                    <div className="flex gap-2 mb-6">
                        <button
                            type="button"
                            onClick={() => fillDemo('student')}
                            className="flex-1 py-2 px-3 rounded-lg bg-indigo-900/30 text-indigo-400 text-sm hover:bg-indigo-900/50 transition-colors"
                        >
                            🎓 Demo Student
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo('admin')}
                            className="flex-1 py-2 px-3 rounded-lg bg-violet-900/30 text-violet-400 text-sm hover:bg-violet-900/50 transition-colors"
                        >
                            👑 Demo Admin
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required={isRegister}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 
                                        rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 
                                    rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 
                                    rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Please wait...</span>
                                </>
                            ) : (
                                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isRegister
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Create one"
                            }
                        </button>
                    </div>
                </div>

                {/* Skip login option */}
                <div className="text-center mt-6">
                    <a
                        href="/explore"
                        className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
                    >
                        Skip login and explore as guest →
                    </a>
                </div>
            </div>
        </div>
    );
}
