"use client";
import React, { useState, FormEvent } from 'react';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { Button, Input, Card, DotPattern } from '@/components/pages/ui';
import { useToast } from '@/components/ToastProvider';

export default function ForgotPasswordPage() {
  const { success, error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      if (res.status === 404) {
        // Endpoint not implemented yet
        success('Feature coming soon! Password reset is not yet available.');
        setSubmitted(true);
        return;
      }

      if (!res.ok) throw new Error('Request failed');
      success('Password reset email sent! Check your inbox.');
      setSubmitted(true);
    } catch {
      showError('Unable to send reset email. Please try again later.');
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
            <KeyRound size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-slate-500 mt-2">
            {submitted
              ? 'Check your email for reset instructions.'
              : 'Enter your email and we\'ll send you a reset link.'}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <Button type="submit" disabled={loading} className="w-full !py-3 text-base shadow-lg">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-600">
              If an account with that email exists, you will receive a password reset link shortly.
            </p>
          </div>
        )}

        <div className="text-center pt-4">
          <a
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to Login
          </a>
        </div>
      </Card>
    </div>
  );
}
