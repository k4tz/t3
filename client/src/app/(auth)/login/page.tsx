"use client";

import { LoginForm } from "@/components/login-form"
import  BackArrow  from "@/components/ui/back-arrow";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
            <BackArrow />
            <LoginForm />
        </div>
    </div>
  )
}
