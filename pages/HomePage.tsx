import React, { useState, useEffect, useCallback } from 'react';
import { 
  Moon, Sun, ChevronRight, CheckCircle, 
  Layout, Shield, Zap, Users, Globe, 
  Smartphone, ArrowRight, Star,
  GraduationCap, ShieldCheck, Quote,
  Map, Utensils, BedDouble, Facebook, Twitter, Instagram, Linkedin, Send,
  ArrowLeft, PlusIcon
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

import { Badge, FeatureCard, StatCard, DotPattern, cn } from './ui.tsx';

// --- Animated Testimonials Component ---
const AnimatedTestimonials = ({ testimonials, autoplay = false, className }: { testimonials: any[], autoplay?: boolean, className?: string }) => {
  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div className={cn("max-w-sm md:max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-20", className)}>
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 999
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    className="h-full w-full rounded-3xl object-cover object-center shadow-2xl"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex justify-between flex-col py-4">
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-3xl font-bold text-slate-900">
              {testimonials[active].name}
            </h3>
            <p className="text-base text-slate-500">
              {testimonials[active].designation}
            </p>
            <motion.p className="text-xl mt-8 leading-relaxed text-slate-600">
              {testimonials[active].quote.split(" ").map((word: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 pt-12">
            <button
              onClick={handlePrev}
              className="h-10 w-10 rounded-full flex items-center justify-center group/button transition-colors bg-slate-100 hover:bg-slate-200"
            >
              <ArrowLeft className="h-6 w-6 group-hover/button:rotate-12 transition-transform duration-300 text-slate-800" />
            </button>
            <button
              onClick={handleNext}
              className="h-10 w-10 rounded-full flex items-center justify-center group/button transition-colors bg-slate-100 hover:bg-slate-200"
            >
              <ArrowRight className="h-6 w-6 group-hover/button:-rotate-12 transition-transform duration-300 text-slate-800" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- New Structured CTA Component ---
const CallToAction = () => {
  const borderColor = 'border-slate-200';
  const iconColor = 'text-slate-400';
  const dashColor = 'border-slate-200';
  
  return (
    <div className={`relative mx-auto flex w-full max-w-4xl flex-col justify-between gap-y-8 border-y ${borderColor} px-6 py-16 bg-[radial-gradient(35%_80%_at_25%_0%,rgba(59,130,246,0.08),transparent)]`}>
      
      {/* Corner Icons */}
      <PlusIcon className={`absolute top-[-12.5px] left-[-11.5px] z-10 size-6 ${iconColor}`} strokeWidth={1} />
      <PlusIcon className={`absolute top-[-12.5px] right-[-11.5px] z-10 size-6 ${iconColor}`} strokeWidth={1} />
      <PlusIcon className={`absolute bottom-[-12.5px] left-[-11.5px] z-10 size-6 ${iconColor}`} strokeWidth={1} />
      <PlusIcon className={`absolute right-[-11.5px] bottom-[-12.5px] z-10 size-6 ${iconColor}`} strokeWidth={1} />
      
      {/* Side Borders */}
      <div className={`-inset-y-6 pointer-events-none absolute left-0 w-px border-l ${borderColor}`} />
      <div className={`-inset-y-6 pointer-events-none absolute right-0 w-px border-r ${borderColor}`} />
      
      {/* Center Dashed Line */}
      <div className={`-z-10 absolute top-0 left-1/2 h-full border-l border-dashed ${dashColor}`} />
      
      {/* Content */}
      <div className="space-y-3 relative z-10">
        <h2 className="text-center font-extrabold text-3xl md:text-5xl text-slate-900">
          Starting your internship soon?
        </h2>
        <p className="text-center text-lg md:text-xl max-w-2xl mx-auto text-slate-600">
          Secure your room and facilities before you even arrive on campus. Join thousands of interns experiencing hassle-free stays.
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 mt-4">
        <button className="px-6 py-3 rounded-lg font-semibold border transition-colors border-slate-300 text-slate-700 hover:bg-slate-50">
          Contact Support
        </button>
        <button className="px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5 bg-blue-600 text-white hover:bg-blue-700">
          Register for Stay <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
};

export const HomePage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  // --- Data ---
  const testimonials = [
    {
      quote: "Finding a room near the lab was stressful until I used UniStay. I booked a guest room and got my mess card in minutes.",
      name: "Sarah Jenkins",
      designation: "Research Intern at IIT",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
    },
    {
      quote: "The campus map feature is a lifesaver. I could find my department, the library, and the hostel easily on my first day.",
      name: "Rahul Verma",
      designation: "Summer Intern",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop",
    },
    {
      quote: "We felt safe sending our daughter for her internship knowing the university verified her stay and access beforehand.",
      name: "Emily & Mark",
      designation: "Parents",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop",
    },
    {
      quote: "Seeing my students thrive in such a well-managed ecosystem gives me great confidence in the future of this institution.",
      name: "Prof. David Chen",
      designation: "Faculty Advisor",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop",
    },
    {
      quote: "UniStay has completely transformed our administrative workflow. The warden dashboard alone saves us 20 hours a week.",
      name: "Dr. Rajesh Kumar",
      designation: "Chief Warden",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen font-sans antialiased transition-colors duration-300 bg-white text-slate-900 overflow-x-hidden selection:bg-blue-200 selection:text-blue-900 pt-20">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 overflow-hidden">
        
        <DotPattern />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Hero Content Split */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-20">
             
             {/* Left: Hero Image (Prominent) */}
             <div className="flex-1 w-full relative group">
                <div className="absolute top-10 right-10 w-64 h-64 rounded-full blur-[80px] opacity-60 bg-blue-200"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full blur-[80px] opacity-60 bg-purple-200"></div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-700 hover:scale-[1.02]">
                  <img 
                    src="/images/homepage_hero.png" 
                    alt="Students collaborating on campus" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 p-4 rounded-xl shadow-lg animate-bounce-slow hidden md:flex items-center gap-4 bg-white border border-slate-100">
                   <div className="bg-green-100 p-2 rounded-full text-green-600">
                     <ShieldCheck size={24} />
                   </div>
                   <div>
                     <p className="text-xs font-bold uppercase text-slate-500">Verified Stay</p>
                     <p className="font-bold text-slate-900">Intern Approved</p>
                   </div>
                </div>
             </div>

             {/* Right: Inspirational Text & CTA */}
             <div className="flex-1 text-left">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-px w-8 bg-blue-500"></div>
                   <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
                     Your Internship Companion
                   </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight text-slate-900">
                  Trust the platform that simplifies your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">internship stay.</span>
                </h1>
                <p className="text-lg md:text-xl mb-10 leading-relaxed text-slate-600">
                  Secure on-campus rooms, access dining mess facilities, and navigate the university map—all designed specifically for visiting interns.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button className="px-8 py-4 rounded-full font-bold shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                    Book Accommodation <ArrowRight size={18} />
                  </button>
                  <button className="px-8 py-4 rounded-full font-bold border transition-all hover:-translate-y-1 border-slate-200 text-slate-600 hover:bg-slate-50">
                    View Campus Map
                  </button>
                </div>
             </div>
          </div>

          {/* New Animated Testimonials */}
          <div className="relative z-10 pt-10">
            <div className="text-center opacity-80 mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Trusted Voices</h2>
            </div>
            <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
          </div>

        </div>
      </section>

      {/* --- Stats Bar --- */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
             <StatCard value="200+" label="Hostel Rooms" />
             <StatCard value="1.5k" label="Interns Housed" />
             <StatCard value="100%" label="Verified Stays" />
             <StatCard value="24/7" label="Support" />
           </div>
        </div>
      </section>

      {/* --- Platform Overview --- */}
      <section className="py-20 px-4 bg-white">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1">
                  <Badge>All-in-One Access</Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">
                     Everything an intern needs to settle in.
                  </h2>
                  <p className="text-lg mb-8 leading-relaxed text-slate-600">
                     Don't waste time figuring out logistics. UniStay connects you directly to university facilities so you can focus on your research and work.
                  </p>
                  <ul className="space-y-4 mb-8">
                     {[
                       'Book Guest Rooms & Hostels instantly', 
                       'Get your Digital Mess Card for meals', 
                       'Navigate campus with Interactive Maps'
                     ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                           <CheckCircle size={20} className="text-blue-500" />
                           <span className="text-slate-700">{item}</span>
                        </li>
                     ))}
                  </ul>
                  <a href="#platform" className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700">
                     Explore Facilities <ChevronRight size={16} />
                  </a>
               </div>
               <div className="flex-1">
                  <div className="relative rounded-xl border-4 overflow-hidden shadow-2xl border-slate-100 bg-white">
                     <img 
                       src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                       alt="Dashboard Preview" 
                       className="w-full h-auto"
                     />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- Features Grid --- */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Seamless Campus Living.
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
              We handle the logistics of your stay so you can handle your internship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BedDouble}
              title="Intern Accommodation"
              desc="Browse available guest house rooms or short-term hostel stays specifically reserved for visiting interns."
            />
            <FeatureCard 
              icon={Utensils}
              title="Mess Access Card"
              desc="Skip the paperwork. Generate a digital QR-code mess card instantly to access breakfast, lunch, and dinner."
            />
            <FeatureCard 
              icon={Map}
              title="Campus Navigation"
              desc="Never get lost. Our detailed interactive map shows you exactly where your lab, hostel, and mess hall are."
            />
             <FeatureCard 
              icon={Shield}
              title="Verified Security"
              desc="Your booking grants you authorized entry at the main gate. Show your digital pass for hassle-free access."
            />
             <FeatureCard 
              icon={Globe}
              title="Wi-Fi Provisioning"
              desc="Get your temporary campus Wi-Fi credentials automatically as soon as your room booking is confirmed."
            />
             <FeatureCard 
              icon={Smartphone}
              title="Mobile Managed"
              desc="Extend your stay, top-up your mess card balance, or report a room issue directly from your phone."
            />
          </div>
        </div>
      </section>

      {/* --- Call To Action Section (New Design) --- */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
           <CallToAction />
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="pt-16 pb-8 border-t bg-white border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Col 1: Stay Connected */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-2xl font-bold mb-4 text-slate-900">
                Stay<br/>Connected
              </h3>
              <p className="text-sm mb-6 text-slate-600">
                Join our newsletter for the latest updates and exclusive offers.
              </p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full py-3 px-4 pr-12 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-slate-50 border-slate-200 text-slate-900"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700">
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-slate-900">Quick Links</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                {['Home', 'About Us', 'Services', 'Products', 'Contact'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-blue-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Col 3: Contact Us */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-slate-900">Contact Us</h4>
              <ul className="space-y-3 text-sm text-slate-600">
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

    </div>
  );
}