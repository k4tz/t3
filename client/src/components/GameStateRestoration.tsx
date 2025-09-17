"use client";

import useGameStateRestoration from '@/hooks/useGameStateRestoration';

export default function GameStateRestoration() {
    useGameStateRestoration();
    return null; // This component doesn't render anything
}
