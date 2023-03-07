import Router from 'next/router';
import { useState } from "react";
import { SetNameInput } from "~/utils/UserTypes";
import { api } from "~/utils/api";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import Link from 'next/link';

const NewUser = ({ }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const nameMutation = api.user.setUsername.useMutation();
    const [name, setName] = useState('');
    const [isError, setIsError] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    if (nameMutation.data)
        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col h-3/4 w-2/4 bg-white bg-opacity-20 backdrop-blur-md drop-shadow-lg rounded">
                    <div className="flex flex-col items-center justify-between mt-5">
                        <h1 className="text-white font-medium">{nameMutation.data?.message}</h1>
                        {/*  eslint-disable-next-line @next/next/no-html-link-for-pages */}
                        <a href="/" className="bg-[#f0e4e483] mx-auto my-2 rounded-lg p-1 animate-pulse">
                            Home
                        </a>
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
                    <h1 className="text-white font-medium">Please set your name to continue</h1>
                    <form
                        className="flex flex-col mx-auto w-2/4 my-5 gap-[5px]"
                        onSubmit={(e) => {
                            e.preventDefault();

                            const userInputValidationResults = SetNameInput.safeParse({ name });

                            if (!userInputValidationResults.success) {
                                const formattedErrorMessages = userInputValidationResults.error.format();
                                setIsError(true);

                                if (formattedErrorMessages.name) {
                                    setErrorMessages(formattedErrorMessages.name._errors);
                                    return;
                                }

                                setErrorMessages(formattedErrorMessages._errors);
                            } else {
                                setIsError(false);
                                nameMutation.mutate(userInputValidationResults.data);
                            }
                        }}>

                        <input type="text" name="name" value={name} placeholder="Name"
                            className="pl-5 placeholder:text-black bg-gradient-to-r from-[#249b8b] to-fuchsia-50 rounded py-1"
                            onChange={(e) => setName(e.target.value)}
                        />

                        <button
                            type="submit"
                            className="bg-[#f0e4e483] mx-auto mt-2 rounded-lg p-1">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default NewUser;

NewUser.requireAuth = true

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (session?.user.name)
        return { redirect: { destination: "/" } };

    return {
        props: {

        },
    }
}