"use client";

import Link from "next/link";
import { useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import Image from "next/image";

export default function Navbar() {

    const { logout, isAuthenticated, user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="top-0 left-0 right-0 px-8 md:px-32 py-5 text-2xl font-bold bg-zinc-600 bg-opacity-30 text-white flex justify-around items-center gap-5 select-none">
            <div className="">
                <Image src="/logo1.png" alt="logo" width={150} height={50} priority={true}></Image>
            </div>
            <div className="flex flex-grow justify-evenly gap-5">
                <Link href="/" className="hover:underline transition-all">Home</Link>
                <Link href="/game">Game</Link>
            </div>
            <div className="flex-grow flex justify-end">
                { isAuthenticated ? 
                    <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        <div className="flex gap-2">
                            <Image src="/avatar_m1.svg" alt="up-down" width={50} height={50}></Image>
                        </div>
                        {
                            isOpen ? 
                                <div className="bg-amber-700 fixed w-[150px] top-28">
                                    <ul className="list-none text-center text-base">
                                        <li className="p-2 hover:bg-amber-500">{user?.username ?? 'Guest'}</li>
                                        <li className="p-2 hover:bg-amber-500" onClick={logout}>Logout</li>
                                    </ul>
                                </div> :
                                null
                        }
                    </div> : 
                    <div className="flex gap-3">
                        <Link href="/login">Login</Link> | 
                        <Link href="/register">Signup</Link>
                    </div>
                }
            </div>
        </div>
    );
}