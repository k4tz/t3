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

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

    const [signupData, setSignupData] = useState<Record<string, string>>({
        username: "",
        password: ""
    });

    const router = useRouter();

    const { register, isLoading, signupError, resetError } = useAuthStore();

    const handleInputsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSignupData((prev) => {
            return {...prev, [event.target.name]: event.target.value};
        });
    }

    useEffect(() => {
        const handleSignup = async (e: Event) => {
            e.preventDefault();
            const authData: AuthData = {
                username: signupData.username,
                password: signupData.password
            }
    
            const toastId = toast.loading('Logging in...');

            try{
                await register(authData);
                toast.success('Registered successfully');
                router.push('/');
            }catch(signupError: any){
                //
            }finally{
                toast.dismiss(toastId);
            }
        }

        document.querySelector('#signup-form')?.addEventListener('submit', handleSignup);

        return () => {
            document.querySelector('#signup-form')?.removeEventListener('submit', handleSignup);
        }
    }, [signupData]);

    useEffect(() => {
        if(signupError){
            toast.error(signupError);

            resetError('signupError');
        }
    }, [signupError]);

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="!bg-white !bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
            <CardHeader>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Sign Up</CardTitle>
            <CardDescription className="text-gray-300 text-center">
                Enter details to create your account
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form method="post" id="signup-form">
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="Username" className="text-white font-semibold">Username</Label>
                        <Input
                        id="Username"
                        type="Username"
                        name="username"
                        placeholder="eg: Kraken115"
                        // required
                        onChange={handleInputsChange}
                        className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder:text-gray-400 focus:border-purple-400"
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-white font-semibold">Password</Label>
                        </div>
                        <Input 
                            id="password" 
                            name="password" 
                            type="password" 
                            onChange={handleInputsChange} 
                            required 
                            className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder:text-gray-400 focus:border-purple-400"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-105">
                        {isLoading ? "Signing up..." : "Sign up"}
                    </Button>
                </div>
                <div className="mt-4 text-center text-sm text-gray-300">
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors duration-300">
                        Back to login
                    </Link>
                </div>
            </form>
            </CardContent>
        </Card>
        </div>
    )
}
