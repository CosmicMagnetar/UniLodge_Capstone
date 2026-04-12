import React from 'react';
import { User } from '../types.ts';
import { User as UserIcon, Bell, Moon, Sun, Shield, Mail, CreditCard } from 'lucide-react';

interface SettingsPageProps {
  user: User;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-slate-900 mb-1">
                Account <span className="text-blue-600">Settings</span>
            </h2>
            <p className="text-slate-600">Manage your profile and preferences</p>
        </div>
        
        {/* Settings Content */}
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Profile Section */}
          <div className="bg-white backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                    <p className="text-sm text-slate-500">Your personal account details</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-black font-bold text-4xl shadow-xl ring-4 ring-white">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                </div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                            {user.name}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                                user.role === 'WARDEN' ? 'bg-green-100 text-green-700' :
                                'bg-purple-100 text-purple-700'
                            }`}>
                                {user.role}
                            </span>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium flex items-center gap-2">
                            <Mail size={16} className="text-slate-400" />
                            {user.email}
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-100 rounded-xl">
                    <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500">Manage how you receive updates</p>
                </div>
            </div>
            
            <div className="space-y-3">
              {[
                  { title: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                  { title: 'Booking Updates', desc: 'Get notified about booking changes', icon: Shield },
                  { title: 'Payment Reminders', desc: 'Reminders for pending payments', icon: CreditCard }
              ].map((item, index) => (
                  <label key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100 group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                            <item.icon size={18} />
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 block">{item.title}</span>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                  </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
