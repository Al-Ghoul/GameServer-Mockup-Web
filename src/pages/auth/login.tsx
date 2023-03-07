import { useState } from "react";
import { UserLoginInput } from "~/utils/UserTypes";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { authOptions } from "~/server/auth";
import { getServerSession } from "next-auth";
import { getProviders, signIn } from "next-auth/react";
import router from "next/router";
import Image from "next/image";


const Login = ({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [isError, setIsError] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);


    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col h-3/4 w-2/4 bg-white bg-opacity-20 backdrop-blur-md drop-shadow-lg rounded">
                {isError === true &&
                    <div className='container bg-gradient-to-r from-cyan-100 to-purple-600 rounded-2xl mt-3 p-3'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        {errorMessages?.map(message => <p key={message} className='font-serif text-center'>{message}</p>)}
                    </div>
                }

                <div className="flex flex-col w-2/4 mx-auto mt-5 ">
                    {Object.values(providers).map((provider) => {
                        if (provider.name === "Discord") {
                            return (
                                // TO-DO -> Errors must be handled, like &error=OAuthSignin (parsing url params).
                                <button key={provider.name} onClick={() => { signIn(provider.id).then(ok => ok).catch((error: string) => console.log(error)) }}
                                    type="submit"
                                    className="flex h-[62px] bg-[#7289d9] items-center rounded-lg px-5 text-white font-medium mb-3 self-center" >
                                    <Image
                                        className="mr-2"
                                        width={24}
                                        height={24}
                                        src="https://authjs.dev/img/providers/discord-dark.svg"
                                        loading="lazy"
                                        alt="Discord's LOGO"
                                    />
                                    <span>Sign in with {provider.name}</span>
                                </button>
                            );
                        }

                        if (provider.name === "Credentials") {
                            return (
                                <div key={provider.name}>
                                    <form
                                        className="flex flex-col mx-auto container my-5 gap-[10px]"
                                        onSubmit={(e) => {
                                            e.preventDefault();

                                            const userInputValidationResults = UserLoginInput.safeParse({ username, password });
                                            if (!userInputValidationResults.success) {
                                                const formattedErrorMessages = userInputValidationResults.error.format();
                                                setIsError(true);

                                                if (formattedErrorMessages.username) {
                                                    setErrorMessages(formattedErrorMessages.username._errors);
                                                    return;
                                                }

                                                if (formattedErrorMessages.password) {
                                                    setErrorMessages(formattedErrorMessages.password._errors);
                                                    return;
                                                }

                                                setErrorMessages(formattedErrorMessages._errors);
                                            } else {
                                                setIsError(false);

                                                signIn(provider.id, { ...userInputValidationResults.data, redirect: false })
                                                    .then(async (res) => {
                                                        if (res?.ok === true) {
                                                            await router.push("/");
                                                        } else {
                                                            setIsError(true);
                                                            setErrorMessages([res?.error ?? "An unhandled error occurred during login"]);
                                                        }
                                                    })
                                                    .catch((error: string) => {
                                                        setIsError(true);
                                                        setErrorMessages([error]);
                                                    });
                                            }
                                        }}>

                                        <input type="text" name="username" value={username} placeholder="Username"
                                            className="pl-5 placeholder:text-black bg-gradient-to-r from-[#249b8b] to-fuchsia-50 rounded py-1"
                                            onChange={(e) => setUsername(e.target.value)}
                                        />

                                        <input type="password" name="password" value={password} placeholder="Password"
                                            className="pl-5 placeholder:text-black bg-gradient-to-r from-[#249b8b] to-fuchsia-50 rounded py-1"
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button type="submit"
                                            className="bg-[#f0e4e483] mx-auto mt-2 rounded-lg p-1"
                                        >
                                            Login
                                        </button>
                                    </form>

                                    <div className="flex justify-between my-2 px-5 text-white items-center">
                                        <hr className="w-full mr-3"></hr>
                                        OR
                                        <hr className="w-full ml-3"></hr>
                                    </div>

                                </div>
                            );
                        }

                        return (
                            <div key={provider.name}>
                                <button
                                    onClick={() => { signIn(provider.id).then(ok => ok).catch((error: string) => console.log(error)) }}
                                    className="flex h-[62px] bg-yellow-500 items-center rounded-lg px-5 font-medium">
                                    Sign in with {provider.name}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}


export default Login;


export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (session) return { redirect: { destination: "/" } };

    const providers = await getProviders();

    return {
        props: {
            providers: providers ?? [],
        },
    }
}