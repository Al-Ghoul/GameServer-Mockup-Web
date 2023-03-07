import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const Header = () => {
    const { data: sessionData } = useSession();

    return (
        <nav className="flex items-center justify-around py-3 sticky top-0 backdrop-blur-md backdrop-brightness-150">
            <Link href="/">
                <div className="group">
                    <Image
                        className="rounded-full mr-4 animate-pulse hover:animate-none"
                        src="/images/Picsart_22-12-20_09-46-11-410.png"
                        width={70}
                        height={0}
                        alt="A placeholder"
                    />
                    <p className="hidden group-hover:inline font-semibold text-white relative right-[4px]">By AlGhoul</p>
                </div>
            </Link>
            <div className="flex flex-col gap-2">
                <h1 className="text-white">A mock-up that connects to a native c++ websocket server.</h1>
                {sessionData?.user.name && <h1 className="text-white self-center font-bold">Welcome {sessionData?.user.name}</h1>}
            </div>

            <ul>
                <li><Link href="/" className="text-white hover:underline hover:animate-pulse">Home</Link></li>
                <li><Link href="/auth/register" className="text-white hover:underline hover:animate-pulse">Register</Link></li>
                <li><button className="text-white hover:underline hover:animate-pulse" onClick={sessionData ? () => void signOut() : () => void signIn()}>{sessionData ? "Log out" : "Log in"}</button></li>
            </ul>

        </nav>
    );
}