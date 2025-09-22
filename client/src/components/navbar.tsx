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
                    <div className="md:flex hidden items-center space-x-8">
                        <Link href="/select-mode">
                            <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300"
                            >
                                Play Now
                            </Button>
                        </Link>
                        <Link 
                            href="/leaderboard" 
                            className="text-white hover:text-blue-400 transition-colors font-medium"
                        >
                            Leaderboard
                        </Link>
                        <Link 
                            href="/learn-more" 
                            className="text-white hover:text-blue-400 transition-colors font-medium"
                        >
                            Learn More
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
                    <div className="md:hidden">
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

                {/* Simple Mobile Menu */}
                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                    className="absolute inset-0 bg-black bg-opacity-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="relative h-full bg-gradient-to-b from-blue-900 to-purple-900 border-l border-gray-700">
                    <div className="flex flex-col h-full z-50">
                        
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                            <img
                            src="/logo.svg"
                            alt="TheT3 Logo"
                            width={24}
                            height={24}
                            className="rounded"
                            />
                            <span className="text-white font-semibold">Menu</span>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-white"
                            aria-label="Close menu"
                        >
                            <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                            </svg>
                        </button>
                        </div>

                        {/* Menu Items (Nav + Auth in one flow) */}
                        <div className="flex-1 min-h-[100vh] bg-gradient-to-b from-purple-900 to-blue-900">
                        <div className="space-y-2">
                            {/* Main nav */}
                            <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block w-full text-white py-3 px-4 border border-gray-600 rounded text-center"
                            >
                            Home
                            </Link>
                            <Link
                            href="/select-mode"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded"
                            >
                            Play Now
                            </Link>
                            <Link
                            href="/leaderboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block w-full text-white py-3 px-4 border border-gray-600 rounded text-center"
                            >
                            Leaderboard
                            </Link>
                            <Link
                            href="/learn-more"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block w-full text-white py-3 px-4 border border-gray-600 rounded text-center"
                            >
                            Learn More
                            </Link>

                            {/* User section */}
                            {isAuthenticated ? (
                            <>
                                <div className="flex items-center space-x-3 py-4 px-2 border-t border-gray-700">
                                <Image
                                    src="/avatar_m1.svg"
                                    alt="User Avatar"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                                <div>
                                    <p className="text-white font-medium">
                                    {user?.username ?? "Guest"}
                                    </p>
                                    <p className="text-gray-400 text-sm">Online</p>
                                </div>
                                </div>
                                <Link
                                href="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-white py-2 px-4 border border-gray-600 rounded text-center"
                                >
                                Profile
                                </Link>
                                <button
                                onClick={() => {
                                    logout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="block w-full text-red-400 py-2 px-4 border border-red-600 rounded text-center"
                                >
                                Logout
                                </button>
                            </>
                            ) : (
                            <>
                                <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-white py-2 px-4 border border-gray-600 rounded text-center"
                                >
                                Login
                                </Link>
                                <Link
                                href="/register"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full bg-green-600 text-white py-2 px-4 rounded text-center"
                                >
                                Sign Up
                                </Link>
                            </>
                            )}
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                )}
            </div>
        </nav>
    );
}