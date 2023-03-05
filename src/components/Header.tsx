import Image from "next/image";
import { signIn } from "next-auth/react"
import Link from "next/link";

export const Header = () => {
    return (
        <nav className="flex items-center justify-around py-3 sticky top-0 backdrop-blur-md backdrop-brightness-150">
            <a href="https://www.facebook.com/abdo.alghouul/">
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
            </a>
            <h1 className="text-white">A mock-up that connects to a native c++ websocket server.</h1>

            <ul>
                <li><Link href="/" className="text-white hover:underline hover:animate-pulse">Home</Link></li>
                <li><Link href="/auth/register" className="text-white hover:underline hover:animate-pulse">Register</Link></li>
                <button className="text-white hover:underline hover:animate-pulse" onClick={() => signIn()}>Log in</button>
            </ul>

        </nav>
    );
}