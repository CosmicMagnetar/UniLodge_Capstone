import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
    name: string;
    role: string;
    text: string;
    image: string;
}

interface AnimatedTestimonialsProps {
    testimonials: Testimonial[];
    autoplay?: boolean;
    autoplayInterval?: number;
}

export const AnimatedTestimonials: React.FC<AnimatedTestimonialsProps> = ({ 
    testimonials, 
    autoplay = true, 
    autoplayInterval = 5000 
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!autoplay) return;

        const interval = setInterval(() => {
            handleNext();
        }, autoplayInterval);

        return () => clearInterval(interval);
    }, [currentIndex, autoplay, autoplayInterval]);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const current = testimonials[currentIndex];

    return (
        <div className="relative">
            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left: Image */}
                <div className="relative">
                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-all duration-700 ${
                                    index === currentIndex
                                        ? 'opacity-100 scale-100 rotate-0'
                                        : index === (currentIndex - 1 + testimonials.length) % testimonials.length
                                        ? 'opacity-0 scale-95 -rotate-6'
                                        : 'opacity-0 scale-95 rotate-6'
                                }`}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: index === currentIndex ? 'rotateY(0deg)' : 'rotateY(20deg)'
                                }}
                            >
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                            </div>
                        ))}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>

                {/* Right: Content */}
                <div className="space-y-6">
                    {/* Quote Icon */}
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Quote className="w-8 h-8 text-blue-600" />
                    </div>

                    {/* Testimonial Text with Word Animation */}
                    <div className="space-y-4">
                        <p className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed">
                            {current.text.split(' ').map((word, i) => (
                                <span
                                    key={i}
                                    className="inline-block animate-fade-in-word"
                                    style={{
                                        animationDelay: `${i * 0.05}s`,
                                        opacity: 0,
                                        animationFillMode: 'forwards'
                                    }}
                                >
                                    {word}{' '}
                                </span>
                            ))}
                        </p>
                    </div>

                    {/* Author Info */}
                    <div className="pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-blue-100">
                                <img
                                    src={current.image}
                                    alt={current.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{current.name}</h4>
                                <p className="text-slate-600">{current.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            onClick={handlePrev}
                            className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="flex gap-2 ml-4">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (!isAnimating) {
                                            setIsAnimating(true);
                                            setCurrentIndex(index);
                                            setTimeout(() => setIsAnimating(false), 500);
                                        }
                                    }}
                                    className={`h-2 rounded-full transition-all ${
                                        index === currentIndex
                                            ? 'w-8 bg-blue-600'
                                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                                    }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
