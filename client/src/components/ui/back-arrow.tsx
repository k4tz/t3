import Link from "next/link"

export default function BackArrow({relUrl = '/', text = 'Back'}) {
    return (
        <div className={"fixed cursor-pointer left-10 top-6"}>
            <Link href={relUrl}>
                <div className="flex gap-1 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span className="font-bold text-2xl">
                        {text}
                    </span>
                </div>
            </Link>     
        </div>
    );
}