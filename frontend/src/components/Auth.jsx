import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, User, Sparkles } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !fullName)) {
      setMessage('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Handle Login
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Login failed.');
        }

        // Store JWT token and user details in localStorage
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        
        onAuthSuccess(data.access_token, data.user);
      } else {
        // Handle Register
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: fullName }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Registration failed.');
        }

        // Auto log in after registration
        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error('Registered, but automatic login failed.');

        localStorage.setItem('auth_token', loginData.access_token);
        localStorage.setItem('user_info', JSON.stringify(loginData.user));
        
        onAuthSuccess(loginData.access_token, loginData.user);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05020c] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background glowing spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative z-10 border border-purple-500/10">
        
        {/* Title branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-3">
            <GraduationCap className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
            AetherRoutine
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">Adaptive AI study routine portal</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-darkbg-sidebar border border-darkbg-border rounded-xl p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setMessage(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${
              isLogin ? 'bg-purple-600 text-slate-100 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setMessage(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${
              !isLogin ? 'bg-purple-600 text-slate-100 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms block */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Alex Mercer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-purple-500 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="demo@student.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-purple-500 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-darkbg-sidebar border border-darkbg-border text-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-purple-500 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg border text-xs text-center font-medium ${
              message.includes('success') ? 'bg-emerald-950/30 border-emerald-800/30 text-emerald-300' : 'bg-rose-950/30 border-rose-800/30 text-rose-300'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-slate-100 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Processing...' : isLogin ? 'Sign In to Portal' : 'Register Account'}
          </button>
        </form>

        {/* Mock Credentials Help note */}
        {isLogin && (
          <div className="mt-6 border-t border-darkbg-border pt-4 text-center">
            <span className="text-[10px] text-slate-500 font-medium">
              Demo Credentials: <span className="text-slate-400">demo@student.com</span> / <span className="text-slate-400">password123</span>
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
