import Link from "next/link"

interface BackArrowProps {
    relUrl?: string;
    text?: string;
    onClick?: () => void;
    isButton?: boolean;
}

export default function BackArrow({relUrl = '/', text = 'Back', onClick, isButton = false}: BackArrowProps) {
    const content = (
        <div className="flex gap-1 items-center bg-black/20 backdrop-blur-md rounded-lg px-3 py-2 hover:bg-black/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 md:size-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span className="font-bold text-lg md:text-2xl text-white hidden sm:block">
                {text}
            </span>
        </div>
    );

    return (
        <div className="fixed cursor-pointer left-4 md:left-10 top-6 z-40">
            {isButton ? (
                <button onClick={onClick}>
                    {content}
                </button>
            ) : (
                <Link href={relUrl}>
                    {content}
                </Link>
            )}
        </div>
    );
}