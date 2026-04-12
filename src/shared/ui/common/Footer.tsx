import React from 'react';
import { 
  Send, Facebook, Twitter, Instagram, Linkedin, Building2 
} from 'lucide-react';

export default function Footer() {
  const mutedText = 'text-slate-600';

  return (
    <footer className="pt-16 pb-8 border-t bg-white border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Col 1: Stay Connected */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-slate-900">
              Stay<br/>Connected
            </h3>
            <p className={`text-sm mb-6 ${mutedText}`}>
              Join our newsletter for the latest updates and exclusive offers.
            </p>
            <div className="relative flex items-center">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full py-3 px-4 pr-12 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-slate-50 border-slate-200 text-slate-900"
              />
              <button className="absolute right-2 p-2 rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700">
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-slate-900">Quick Links</h4>
            <ul className={`space-y-3 text-sm ${mutedText}`}>
              {['Home', 'About Us', 'Services', 'Products', 'Contact'].map((item) => (
                <li key={item}><a href="#" className="hover:text-blue-500 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Us */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-slate-900">Contact Us</h4>
            <ul className={`space-y-3 text-sm ${mutedText}`}>
              <li>123 Innovation Street</li>
              <li>Tech City, TC 12345</li>
              <li>Phone: (123) 456-7890</li>
              <li>Email: hello@unistay.com</li>
            </ul>
          </div>

          {/* Col 4: Follow Us */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-slate-900">Follow Us</h4>
            <div className="flex gap-4 mb-8">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-3 rounded-full border transition-all hover:-translate-y-1 border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-600">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm border-slate-100 text-slate-500">
          <div>
            © 2024 UniStay Systems Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-500">Privacy Policy</a>
            <a href="#" className="hover:text-blue-500">Terms of Service</a>
            <a href="#" className="hover:text-blue-500">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
