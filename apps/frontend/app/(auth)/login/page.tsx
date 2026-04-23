"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { Button, Input, Card, DotPattern } from '@/components/pages/ui';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useToast } from '@/components/ToastProvider';
import { Role } from '@/types';

interface University {
  _id: string;
  name: string;
  domain: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContactBanner, setShowContactBanner] = useState(false);

  const DUMMY_UNIVERSITIES = [
    { _id: 'dummy1', name: 'Rishihood University', domain: 'rishihood.edu.in' },
    { _id: 'dummy2', name: 'IIT Delhi', domain: 'iitd.ac.in' },
    { _id: 'dummy3', name: 'Stanford University', domain: 'stanford.edu' },
  ];

  useEffect(() => {
    api.getUniversities()
      .then(data => {
        if (data && data.length > 0) setUniversities(data);
        else setUniversities(DUMMY_UNIVERSITIES);
      })
      .catch(err => {
        console.error('Failed to fetch universities, using fallback:', err);
        setUniversities(DUMMY_UNIVERSITIES);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setShowContactBanner(false);
    setLoading(true);
    try {
      const response = await api.login(email, password);
      localStorage.setItem('token', response.token);

      // Store university info
      if (response.user.university) {
        localStorage.setItem('university', JSON.stringify(response.user.university));
      }

      success(`Welcome back, ${response.user.name}!`);

      // Route based on role
      if (response.user.role === Role.ADMIN) router.push('/admin');
      else if (response.user.role === Role.WARDEN) router.push('/warden');
      else router.push('/guest');

      setTimeout(() => window.location.reload(), 100);
    } catch (err: any) {
      if (err.message?.includes('UNIVERSITY_NOT_REGISTERED')) {
        setShowContactBanner(true);
      }
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
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Login to manage your stay.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
          {/* University Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">University</label>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Select your university</option>
              {universities.map(uni => (
                <option key={uni._id} value={uni.domain}>{uni.name}</option>
              ))}
            </select>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
              <span className="font-semibold">Demo:</span> admin@campus.edu / admin123
            </p>
          </div>

          {/* Contact Banner for unregistered university */}
          {showContactBanner && (
            <div className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-800 font-medium">University not registered</p>
                <p className="text-amber-700 mt-1">
                  To register your university, please contact us at{' '}
                  <a href="mailto:krishna.2024@nst.rishihood.edu.in" className="font-semibold underline">
                    krishna.2024@nst.rishihood.edu.in
                  </a>
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full !py-3 text-base shadow-lg hover:shadow-xl">
            {loading ? 'Please wait...' : 'Sign In'}
          </Button>

          <div className="flex items-center justify-between pt-2">
            <a
              href="/forgot-password"
              className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              Forgot password?
            </a>
            <a
              href="/signup"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Create an account
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}