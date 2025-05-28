"use client";

import { useState, useEffect } from 'react';
import api from "@/lib/axios";
import RouteGuard from "@/components/RouteGuard";
import Link from 'next/link';
import { socket } from "@/lib/socket";
import Navbar from "@/components/navbar"
import Image from 'next/image';

export default function Home() {

    return (
        <RouteGuard>
            <Navbar />
            <div className="flex min-h-svh w-full justify-center p-6 md:p-10">
                <div className="grow shrink">
                    <Image src="/logo2.png" alt="tac2oe-logo" width={600} height={480}></Image>
                </div>
                <div className="flex grow shrink">

                </div>
            </div>
        </RouteGuard>
    );
}