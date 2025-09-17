"use client";

import Link from 'next/link';
import Navbar from "@/components/navbar";
import RouteGuard from "@/components/RouteGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LearnMore() {
    return (
        <RouteGuard>
            <Navbar />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                <div className="container mx-auto px-8 py-20">
                    
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Learn More
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Everything you need to know about our multiplayer tic-tac-toe platform
                        </p>
                    </div>

                    {/* Game Rules */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Game Rules</h2>
                        <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 p-8 max-w-4xl mx-auto">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Objective</h3>
                                        <p className="text-gray-300">Be the first player to get three of your marks (X or O) in a row horizontally, vertically, or diagonally.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Gameplay</h3>
                                        <p className="text-gray-300">Players take turns placing their marks on the 3x3 grid. Each player can only place one mark per turn.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="bg-pink-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Winning</h3>
                                        <p className="text-gray-300">The game ends when a player achieves three in a row, or when all nine squares are filled (resulting in a draw).</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Game Modes */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Game Modes</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 p-6">
                                <h3 className="text-xl font-bold mb-4 text-center">Online</h3>
                                <p className="text-gray-300 text-center mb-4">Jump into a game instantly with random opponents from around the world.</p>
                                <ul className="text-gray-300 space-y-2">
                                    <li>• Skill based matchmaking</li>
                                    <li>• Rank system</li>
                                    <li>• Leaderboards</li>
                                </ul>
                            </Card>
                            
                            <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 p-6">
                                <h3 className="text-xl font-bold mb-4 text-center">Offline</h3>
                                <p className="text-gray-300 text-center mb-4">Play offline with friends, take turns playing.</p>
                                <ul className="text-gray-300 space-y-2">
                                    <li>• No internet connection required</li>
                                    <li>• Practice your skills</li>
                                    <li>• No waiting time</li>
                                </ul>
                            </Card>
                        </div>
                    </div>

                    {/* Themes */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Arena Themes</h2>
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <Card className="Imperial p-6 text-center">
                                <h3 className="text-xl font-bold mb-3 text-white">Imperial</h3>
                                <p className="text-white opacity-90">Classic royal blue</p>
                            </Card>
                            
                            <Card className="Chomie p-6 text-center">
                                <h3 className="text-xl font-bold mb-3 text-white">Chomie</h3>
                                <p className="text-white opacity-90">Vibrant orange and purple with energetic vibes</p>
                            </Card>
                            
                            <Card className="Retro p-6 text-center">
                                <h3 className="text-xl font-bold mb-3 text-white">Retro</h3>
                                <p className="text-white opacity-90">Warm brown and orange with nostalgic feel</p>
                            </Card>
                        </div>
                    </div>

                    

                    {/* Call to Action */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
                        <p className="text-lg text-gray-300 mb-8">Start your tic-tac-toe journey today</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/select-mode">
                                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
                                    Start Playing
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300">
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
