import React, { useState, FormEvent } from 'react';
import { Building2 } from 'lucide-react';
import { Button, Input, Card, DotPattern } from './ui.tsx';

export type LoginPageProps = { 
    onLogin: (email: string, password: string) => Promise<void>; 
    onSignup: (name: string, email: string, password: string) => Promise<void>; 
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignup) {
                await onSignup(name, email, password);
            } else {
                await onLogin(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
            <DotPattern />
            
            <Card className="p-8 md:p-10 w-full max-w-md relative z-10 shadow-2xl border-slate-200">
                <div className="text-center mb-8">
                    <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                        <Building2 size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
                    <p className="text-slate-500 mt-2">{isSignup ? 'Sign up to get started' : 'Login to manage your stay.'}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
                    {isSignup && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                            <Input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="John Doe" 
                                autoComplete="name"
                                required 
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                        <Input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="you@example.com" 
                            autoComplete="email"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <Input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••" 
                            autoComplete={isSignup ? "new-password" : "current-password"}
                            required 
                        />
                        {!isSignup && (
                            <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                                <span className="font-semibold">Demo:</span> admin@campus.edu / admin123
                            </p>
                        )}
                    </div>
                    
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}
                    
                    <Button type="submit" disabled={loading} className="w-full !py-3 text-base shadow-lg hover:shadow-xl">
                        {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
                    </Button>
                    
                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => { setIsSignup(!isSignup); setError(''); }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};