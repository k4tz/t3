"use client";

import Image from "next/image";

export default function Loader() {
    return (
        <div className="w-full h-full flex justify-center items-center z-50">
            <Image src="Spinner.svg" alt="spinner" width={100} height={100} priority={true}></Image>
        </div>
    );
}

export const InlineLoader = ({loadingText}: {loadingText?: string}) => {
    return (
        <>
            <Image src="Spinner.svg" alt="spinner" width={20} height={20}></Image>
            {loadingText}
        </>
    );
}