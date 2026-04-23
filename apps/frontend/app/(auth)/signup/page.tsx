"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { Building2, GraduationCap, User, Mail, AlertCircle } from 'lucide-react';
import { Button, Input, Card, DotPattern } from '@/components/pages/ui';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useToast } from '@/components/ToastProvider';

interface University {
  _id: string;
  name: string;
  domain: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { success } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'GUEST'>('GUEST');
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUnregisteredBanner, setShowUnregisteredBanner] = useState(false);

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

  // Check if email domain matches any registered university
  useEffect(() => {
    if (!email.includes('@')) {
      setShowUnregisteredBanner(false);
      return;
    }
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return;
    const matched = universities.some(u => u.domain === domain);
    setShowUnregisteredBanner(!matched && domain.length > 3);
    if (matched) {
      const uni = universities.find(u => u.domain === domain);
      if (uni) setSelectedUniversity(uni.domain);
    }
  }, [email, universities]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.signup(name, email, password, selectedUniversity || undefined, role);
      localStorage.setItem('token', response.token);
      success('Account created successfully!');
      router.push('/login');
    } catch (err: any) {
      if (err.message?.includes('UNIVERSITY_NOT_REGISTERED')) {
        setShowUnregisteredBanner(true);
        setError('Your university is not registered. See the contact info below.');
      } else {
        setError(err.message || 'Registration failed');
      }
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
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-2">Join UniLodge to find your perfect stay</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
          {/* Name */}
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

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              autoComplete="email"
              required
            />
          </div>

          {/* University Dropdown */}
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

          {/* Unregistered University Banner */}
          {showUnregisteredBanner && (
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

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">I am a</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                  role === 'STUDENT'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap size={16} /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole('GUEST')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                  role === 'GUEST'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User size={16} /> Guest
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full !py-3 text-base shadow-lg hover:shadow-xl">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center pt-2">
            <a
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Already have an account? Login
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}
