import { useState } from "react";
import { UserRegistrationInput } from "~/utils/UserTypes";
import { api } from "~/utils/api";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import Image from "next/image";


const Register = ({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const registration = api.user.register.useMutation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isError, setIsError] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    if (registration.error) {
        // const registrationErrors: string[] = [];
        // const errors: { message: string }[] = JSON.parse(registration.error.message);
        // errors.map((error) => registrationErrors.push(error.message));

        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col h-3/4 w-2/4 bg-white bg-opacity-20 backdrop-blur-md drop-shadow-lg rounded p-5">
                    <div className='container bg-gradient-to-r from-cyan-100 to-purple-600 rounded-2xl mt-3 p-3'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        {/* {registrationErrors.map((message: string) => <p key={message} className='font-serif text-center'>{message}</p>)} */}
                        <p className='font-serif text-center'>{registration.error.message}</p>
                    </div>
                    <button
                        className="bg-cyan-700 mx-auto text-white rounded-md px-2 py-1 mt-3 animate-pulse"
                        onClick={() => registration.reset()}>
                        Refresh
                    </button>
                </div>
            </main>
        );
    }

    if (registration.data)
        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col h-3/4 w-2/4 bg-white bg-opacity-20 backdrop-blur-md drop-shadow-lg rounded p-5">
                    <div className='container bg-gradient-to-r from-cyan-100 to-purple-600 rounded-2xl mt-3 p-3'>
                        <p className='font-serif text-center'>{registration.data.message}</p>
                    </div>
                </div>
            </main>
        );

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
                <div className="flex flex-col items-center justify-between mt-5">

                    <form
                        className="flex flex-col mx-auto w-2/4 mt-5 gap-[5px]"
                        onSubmit={(e) => {
                            e.preventDefault();

                            const userInputValidationResults = UserRegistrationInput.safeParse({ username, password, confirmPassword });
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

                                if (formattedErrorMessages.confirmPassword) {
                                    setErrorMessages(formattedErrorMessages.confirmPassword._errors);
                                    return;
                                }

                                setErrorMessages(formattedErrorMessages._errors);
                            } else {
                                setIsError(false);
                                registration.mutate(userInputValidationResults.data);
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
                        <input type="password" name="confirmpassword" value={confirmPassword} placeholder="Confirm password"
                            className="pl-5 placeholder:text-black bg-gradient-to-r from-[#249b8b] to-fuchsia-50 rounded py-1"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <button type="submit"
                            className="bg-[#f0e4e483] mx-auto mt-2 rounded-lg p-1"
                        >Register</button>
                        <div className="flex justify-between my-2 px-5 text-white items-center">
                            <hr className="w-full mr-3"></hr>
                            OR
                            <hr className="w-full ml-3"></hr>
                        </div>
                    </form>


                    {Object.values(providers).map((provider) => {
                        if (provider.name == "Credentials") return;
                        if (provider.name === "Discord") {
                            return (
                                // TO-DO -> Errors must be handled, like &error=OAuthSignin (parsing url params).
                                <button key={provider.name} onClick={() => { signIn(provider.id).then(ok => ok).catch((error: string) => console.log(error)) }}
                                    type="submit"
                                    className="flex h-[62px] bg-[#7289d9] items-center rounded-lg px-5 text-white font-medium mb-3" >
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


export default Register;

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