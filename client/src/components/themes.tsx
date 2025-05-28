"use client";

import {useState, useEffect, useRef} from 'react';
import themes from "@/config/themes.json";

export default function Themes() {

    const [availableThemes, setAvailableThemes] = useState<string[]>(themes);
    const [selectedTheme, setSelectedTheme] = useState<string>(availableThemes[0]);
    const prevTheme = useRef<string>(selectedTheme);
    
    useEffect(() => {
        document.getElementById("game_screen")?.classList.toggle(prevTheme.current);
        document.getElementById("game_screen")?.classList.add(selectedTheme);
        prevTheme.current = selectedTheme;
    }, [selectedTheme]);

    return (
        <div className={"md:absolute top-10 right-10 lg:w-[400px] " + `theme-banner-${selectedTheme}`}>
            <h3 className="text-xl font-bold mx-5 pt-3 text-white">Board Themes</h3>
            <div className={"flex gap-10 p-5"}>
            {
                availableThemes.map((theme, index) => {
                    return <div key={index} className={"cursor-pointer text-white" + (selectedTheme === theme ? " underline" : "")} onClick={() => setSelectedTheme(theme)}>{theme}</div>
                })
            }
            </div>
        </div>
    );
}