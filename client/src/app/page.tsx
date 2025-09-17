"use client";

import { useState, useEffect } from 'react';
import api from "@/lib/axios";
import RouteGuard from "@/components/RouteGuard";
import Link from 'next/link';
import { socket } from "@/lib/socket";
import Navbar from "@/components/navbar"
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
    const [activeTheme, setActiveTheme] = useState('Imperial');

    const themes = [
        { name: 'Imperial', class: 'Imperial', description: 'Classic blue and gold theme' },
        { name: 'Chomie', class: 'Chomie', description: 'Vibrant orange and green theme' },
        { name: 'Retro', class: 'Retro', description: 'Warm brown and orange theme' }
    ];

    return (
        <RouteGuard>
            <Navbar />
            
            {/* Hero Section */}
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                <div className="container mx-auto px-8 py-20">
                    <div className="text-center mb-16">
                        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            TheT3
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
                            Experience the ultimate multiplayer tic-tac-toe battle! Challenge friends, 
                            compete with players worldwide, and fight on different themed arenas.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/select-mode">
                                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
                                    Start Playing Now
                                </Button>
                            </Link>
                            <Link href="/learn-more">
                                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Game Preview */}
                    <div className="mb-20">
                        <h2 className="text-4xl font-bold text-center mb-12">Choose Your Arena</h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {themes.map((theme) => (
                                <Card 
                                    key={theme.name}
                                    className={`${theme.class} cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                                        activeTheme === theme.name ? 'ring-4 ring-white ring-opacity-50' : ''
                                    }`}
                                    onClick={() => setActiveTheme(theme.name)}
                                >
                                    <div className="p-6 text-center">
                                        <h3 className="text-2xl font-bold mb-4 text-white">{theme.name}</h3>
                                        <p className="text-white opacity-90 mb-6">{theme.description}</p>
                                        
                                        {/* Mini Tic-Tac-Toe Board Preview */}
                                        <div className="grid grid-cols-3 gap-2 mx-auto w-32 h-32">
                                            {Array.from({ length: 9 }).map((_, index) => (
                                                <div 
                                                    key={index}
                                                    className={`square flex items-center justify-center text-2xl font-bold ${
                                                        index === 0 ? 'text-blue-500' : 
                                                        index === 4 ? 'text-red-500' : 
                                                        index === 8 ? 'text-blue-500' : 'text-gray-400'
                                                    }`}
                                                >
                                                    {index === 0 || index === 8 ? 'X' : index === 4 ? 'O' : ''}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mb-20">
                        <h2 className="text-4xl font-bold text-center mb-12">Game Features</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 p-6 text-center">
                                <div className="text-4xl mb-4">🌐</div>
                                <h3 className="text-xl font-bold mb-2">Real-time Multiplayer</h3>
                                <p className="text-gray-300">Play with friends or random opponents in real-time battles</p>
                            </Card>
                            
                            <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 p-6 text-center">
                                <div className="text-4xl mb-4">🎨</div>
                                <h3 className="text-xl font-bold mb-2">Multiple Themes</h3>
                                <p className="text-gray-300">Choose from Imperial, Chomie, and Retro themed arenas</p>
                            </Card>
                            
                            <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 p-6 text-center">
                                <div className="text-4xl mb-4">🏆</div>
                                <h3 className="text-xl font-bold mb-2">Competitive Play</h3>
                                <p className="text-gray-300">Climb the leaderboards and prove your strategic skills</p>
                            </Card>
                            
                            <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 p-6 text-center">
                                <div className="text-4xl mb-4">⚡</div>
                                <h3 className="text-xl font-bold mb-2">Fast Matches</h3>
                                <p className="text-gray-300">Quick matchmaking and lightning-fast gameplay</p>
                            </Card>
                        </div>
                    </div>

                    {/* How to Play Section */}
                    <div className="mb-20">
                        <h2 className="text-4xl font-bold text-center mb-12">How to Play</h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                                <h3 className="text-xl font-bold mb-2">Sign Up</h3>
                                <p className="text-gray-300">Create your account to start playing and track your progress</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                                <h3 className="text-xl font-bold mb-2">Choose Mode</h3>
                                <p className="text-gray-300">Select your preferred game mode and arena theme</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-pink-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                                <h3 className="text-xl font-bold mb-2">Play & Win</h3>
                                <p className="text-gray-300">Make your moves strategically and claim victory!</p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
                        <p className="text-xl text-gray-300 mb-8">Join thousands of players in the ultimate tic-tac-toe experience</p>
                        <Link href="/select-mode">
                            <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-12 py-6 text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl">
                                Play Now - It's Free!
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}