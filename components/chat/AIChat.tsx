import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export const AIChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I\'m your UniLodge assistant. How can I help you find the perfect accommodation today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(inputValue),
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const getBotResponse = (input: string): string => {
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('price') || lowerInput.includes('cost')) {
            return 'Our rooms range from $500 to $1500 per month depending on the type and amenities. Would you like to see available rooms in a specific price range?';
        } else if (lowerInput.includes('available') || lowerInput.includes('vacancy')) {
            return 'We have several rooms available! You can browse them on our homepage or I can help you find one that matches your preferences. What type of room are you looking for?';
        } else if (lowerInput.includes('book') || lowerInput.includes('reserve')) {
            return 'To book a room, simply browse our available rooms, select the one you like, and click "Book Now". You\'ll need to create an account if you haven\'t already. Would you like me to guide you through the process?';
        } else if (lowerInput.includes('amenities') || lowerInput.includes('facilities')) {
            return 'Our rooms come with various amenities including Wi-Fi, study desks, wardrobes, and shared kitchen facilities. Premium rooms also include private bathrooms and air conditioning. What specific amenities are you interested in?';
        } else {
            return 'I\'m here to help! You can ask me about room availability, pricing, booking process, amenities, or any other questions about UniLodge. What would you like to know?';
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-black rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
                >
                    <MessageSquare className="w-7 h-7" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                    
                    {/* Tooltip */}
                    <div className="absolute right-full mr-3 px-4 py-2 bg-slate-900 text-black text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Chat with us!
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-8 border-transparent border-l-slate-900"></div>
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 animate-scale-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h3 className="text-black font-semibold">UniLodge Assistant</h3>
                                <p className="text-green-600 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-black/80 hover:text-black hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.sender === 'user' 
                                        ? 'bg-blue-600' 
                                        : 'bg-gradient-to-br from-purple-500 to-blue-600'
                                }`}>
                                    {message.sender === 'user' ? (
                                        <UserIcon className="w-5 h-5 text-black" />
                                    ) : (
                                        <Sparkles className="w-5 h-5 text-black" />
                                    )}
                                </div>
                                <div className={`max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`px-4 py-2.5 rounded-2xl ${
                                        message.sender === 'user'
                                            ? 'bg-blue-600 text-black rounded-tr-sm'
                                            : 'bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100'
                                    }`}>
                                        <p className="text-sm leading-relaxed">{message.text}</p>
                                    </div>
                                    <span className="text-xs text-slate-400 mt-1 px-1">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-black" />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm bg-slate-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-black rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                            Powered by UniLodge AI
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};
