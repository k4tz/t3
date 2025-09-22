"use client";

import { useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import RouteGuard from "@/components/RouteGuard";
import Navbar from "@/components/navbar";
import RankDisplay from "@/components/RankDisplay";

export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Password change form submitted with data:", passwordData);
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);
        try {
            console.log("Making API call to change password...");
            const response = await api.post('/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            console.log("Password change API response:", response.data);

            toast.success("Password changed successfully");

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setIsChangingPassword(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || error.message
                : "Failed to change password";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        // RouteGuard will handle the redirect automatically
    };

    return (
        <RouteGuard accessLevel="auth">
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
                        <p className="text-gray-400">Manage your account settings</p>
                    </div>

                    {/* User Details Card */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 mb-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-white">{user?.username || 'Unknown User'}</h2>
                                <p className="text-gray-400">Player ID: {user?.id || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-white font-medium">Username</span>
                                <span className="text-gray-300">{user?.username || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-white font-medium">Rank</span>
                                <RankDisplay wins={user?.wins || 0} size="sm" />
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-white font-medium">Wins</span>
                                <span className="text-gray-300">{user?.wins || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-white font-medium">Losses</span>
                                <span className="text-gray-300">{user?.losses || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-white font-medium">Draws</span>
                                <span className="text-gray-300">{user?.draws || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-white font-medium">Total Matches</span>
                                <span className="text-gray-300">{user?.totalMatches || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-white font-medium">Account Status</span>
                                <span className="text-green-400 font-medium">Active</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-white font-medium">Member Since</span>
                                <span className="text-gray-300">Recently</span>
                            </div>
                        </div>
                    </Card>

                    {/* Change Password Card */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-white">Security</h3>
                            {!isChangingPassword && (
                                <Button
                                    onClick={() => setIsChangingPassword(true)}
                                    variant="outline"
                                    className="border-white/30 text-white hover:bg-white/10"
                                >
                                    Change Password
                                </Button>
                            )}
                        </div>

                        {isChangingPassword ? (
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <Label htmlFor="currentPassword" className="text-white">
                                        Current Password
                                    </Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(prev => ({
                                            ...prev,
                                            currentPassword: e.target.value
                                        }))}
                                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="newPassword" className="text-white">
                                        New Password
                                    </Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({
                                            ...prev,
                                            newPassword: e.target.value
                                        }))}
                                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword" className="text-white">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({
                                            ...prev,
                                            confirmPassword: e.target.value
                                        }))}
                                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                    >
                                        {isLoading ? "Changing..." : "Change Password"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordData({
                                                currentPassword: "",
                                                newPassword: "",
                                                confirmPassword: ""
                                            });
                                        }}
                                        className="border-white/30 text-white hover:bg-white/10"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">Keep your account secure</p>
                                <p className="text-sm text-gray-500">
                                    Click "Change Password" to update your password
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Logout Button */}
                    <div className="text-center mt-8">
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
            </div>
        </RouteGuard>
    );
}
