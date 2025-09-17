"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import useAuthStore from "@/store/useAuthStore";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    const { logout, isAuthenticated, user } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Logo - Linked to Home */}
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <img 
                            src="/logo.svg" 
                            alt="TheT3 Logo" 
                            width={40} 
                            height={40}
                            className="rounded-lg"
                        />
                        <span className="text-xl font-bold text-white block">
                            TheT3
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="sm:flex hidden items-center space-x-8">
                        <Link 
                            href="/" 
                            className="text-white hover:text-blue-400 transition-colors font-medium"
                        >
                            Home
                        </Link>
                        <Link 
                            href="/learn-more" 
                            className="text-white hover:text-blue-400 transition-colors font-medium"
                        >
                            Learn More
                        </Link>
                        <Link href="/select-mode">
                            <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300"
                            >
                                Play Now
                            </Button>
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="sm:flex hidden items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    onMouseEnter={() => setIsUserMenuOpen(true)}
                                    className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                                >
                                    <Image 
                                        src="/avatar_m1.svg" 
                                        alt="User Avatar" 
                                        width={32} 
                                        height={32}
                                        className="rounded-full"
                                    />
                                    <span className="hidden sm:block font-medium">
                                        {user?.username ?? 'Guest'}
                                    </span>
                                    <svg 
                                        className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div 
                                        className="absolute top-10 right-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg overflow-hidden z-50"
                                        onMouseEnter={() => setIsUserMenuOpen(true)}
                                        onMouseLeave={() => setIsUserMenuOpen(false)}
                                    >
                                        <div className="py-1">
                                            {/* <div className="px-4 py-2 text-sm text-white border-b border-white/10">
                                                {user?.username ?? 'Guest'}
                                            </div> */}
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-3">
                                <Link href="/login">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-white hover:text-blue-400 hover:bg-white/10 transition-colors"
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button 
                                        size="sm" 
                                        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="sm:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="relative w-8 h-8 flex flex-col justify-center items-center group"
                            aria-label="Toggle mobile menu"
                        >
                            {/* Animated Hamburger Lines */}
                            <span 
                                className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                                }`}
                            />
                            <span 
                                className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out mt-1 ${
                                    isMobileMenuOpen ? 'opacity-0' : ''
                                }`}
                            />
                            <span 
                                className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out mt-1 ${
                                    isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Enhanced Full Screen Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 animate-in fade-in duration-300">
                        {/* Backdrop with blur effect */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        
                        {/* Menu Panel */}
                        <div className="relative h-full bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300">
                            <div className="flex flex-col h-full">
                                {/* Header with logo and close button */}
                                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                                    <div className="flex items-center space-x-3">
                                        <img 
                                            src="/logo.svg" 
                                            alt="TheT3 Logo" 
                                            width={32} 
                                            height={32}
                                            className="rounded-lg"
                                        />
                                        <span className="text-lg font-bold text-white">Menu</span>
                                    </div>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Navigation Links */}
                                <div className="flex-1 flex flex-col justify-center px-6 space-y-6">
                                    <Link 
                                        href="/" 
                                        className="group flex items-center space-x-4 text-white hover:text-blue-400 transition-all duration-300 py-4 px-4 rounded-xl hover:bg-white/5 animate-in slide-in-from-left delay-100"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:scale-150 transition-transform"></div>
                                        <span className="text-xl font-medium">Home</span>
                                    </Link>
                                    <Link 
                                        href="/learn-more" 
                                        className="group flex items-center space-x-4 text-white hover:text-blue-400 transition-all duration-300 py-4 px-4 rounded-xl hover:bg-white/5 animate-in slide-in-from-left delay-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></div>
                                        <span className="text-xl font-medium">Learn More</span>
                                    </Link>
                                    <div className="pt-4 animate-in slide-in-from-left delay-300">
                                        <Link 
                                            href="/select-mode"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block"
                                        >
                                            <Button 
                                                size="lg" 
                                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                <span className="flex items-center justify-center space-x-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                                    </svg>
                                                    <span>Play Now</span>
                                                </span>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {/* User Section at Bottom */}
                                {isAuthenticated && (
                                    <div className="border-t border-white/10 p-6 bg-gradient-to-r from-white/5 to-transparent">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <Image 
                                                        src="/avatar_m1.svg" 
                                                        alt="User Avatar" 
                                                        width={48} 
                                                        height={48}
                                                        className="rounded-full border-2 border-white/20"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-lg">
                                                        {user?.username ?? 'Guest'}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">Online Player</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <Link 
                                                href="/profile" 
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex-1"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Profile
                                                </Button>
                                            </Link>
                                            <Button
                                                onClick={() => {
                                                    logout();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Login/Signup at Bottom for non-authenticated users */}
                                {!isAuthenticated && (
                                    <div className="border-t border-white/10 p-6 bg-gradient-to-r from-white/5 to-transparent">
                                        <div className="space-y-4">
                                            <p className="text-gray-400 text-sm text-center mb-4">Join the game!</p>
                                            <div className="flex flex-col space-y-3">
                                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <Button 
                                                        variant="outline" 
                                                        size="lg" 
                                                        className="w-full border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 py-3 rounded-xl"
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                        </svg>
                                                        Login
                                                    </Button>
                                                </Link>
                                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <Button 
                                                        size="lg" 
                                                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                        </svg>
                                                        Sign Up
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}