"use client";

import { LoginForm } from "@/components/login-form"
import Navbar from "@/components/navbar";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <Navbar />
        <div className="container mx-auto px-8 py-20">
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="w-full max-w-sm">
                    <LoginForm />
                </div>
            </div>
        </div>
    </div>
  )
}
