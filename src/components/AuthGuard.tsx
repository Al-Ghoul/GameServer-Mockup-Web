import { useSession } from "next-auth/react";
import { useRouter } from "next/router"
import { useEffect } from "react"

export function AuthGuard({ children }: { children: JSX.Element }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const initializing = status === "loading";

    useEffect(() => {
        if (!initializing) {
            if (!session)
                router.push("/auth/login").then(res => console.log(res)).catch(err => console.log("[REDIRECT ERROR]", err));
        }
    }, [initializing, router, session])

    if (initializing) {
        return <h1>Page Loading</h1>
    }

    if (!initializing && session) {
        return <>{children}</>
    }

    return null
}