import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useAuthStore from "@/store/useAuthStore"
import { AuthData } from "@/types/user"
import toast from "react-hot-toast"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

    const [loginFormData, setLoginFormData] = useState<Record<string, string>>({
        username: "",
        password: ""
    });

    const router = useRouter();

    const { login, isLoading, loginError, resetError } = useAuthStore();

    const handleInputsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoginFormData((prev) => {
            return {...prev, [event.target.name]: event.target.value};
        });
    }

    useEffect(() => {
        const handleLogin = async (e: Event) => {
            e.preventDefault();
            const authData: AuthData = {
                username: loginFormData.username,
                password: loginFormData.password
            }
    
            const toastId = toast.loading('Logging in...');

            try{
                await login(authData);
                toast.success('Logged in successfully');
                router.back();
            }catch(loginError: any){
                //
            }finally{
                toast.dismiss(toastId);
            }
        }

        document.querySelector('#login-form')?.addEventListener('submit', handleLogin);

        return () => {
            document.querySelector('#login-form')?.removeEventListener('submit', handleLogin);
        }
    }, [loginFormData]);

    useEffect(() => {
        if(loginError){
            toast.error(loginError);

            resetError('loginError');
        }
    }, [loginError]);

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
                Enter your Username below to login to your account
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form method="post" id="login-form">
                <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="Username">Username</Label>
                    <Input
                    id="Username"
                    type="Username"
                    name="username"
                    placeholder="eg: Kraken115"
                    required
                    onChange={handleInputsChange}
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    </div>
                    <Input id="password" name="password" type="password" onChange={handleInputsChange} required />
                </div>
                <Button type="submit" className="w-full">
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline underline-offset-4">
                    Sign up
                </Link>
                </div>
            </form>
            </CardContent>
        </Card>
        </div>
    )
}
