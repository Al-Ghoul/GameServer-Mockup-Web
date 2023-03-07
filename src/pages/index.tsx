import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "~/components/ChatMessage";
import { ChatParticipant } from "~/components/ChatParticipant";
import { useSession } from "next-auth/react";
import { useBeastClient } from "~/components/useBeastClient";
import { getToken } from "next-auth/jwt";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";


const Home = ({ jwtToken }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { messages, sendMessage, chatParticipants } = useBeastClient([], [], jwtToken);
  const [message, setMessage] = useState('');
  const messageListInputRef = useRef<HTMLDivElement>(null);
  const { status } = useSession();

  let chatGridStyles = "grid grid-cols-[minmax(auto,300px)_minmax(auto,300px)_minmax(auto,300px)] gap-1 container h-[720px] justify-center ";

  if (status === "unauthenticated") chatGridStyles += "blur animate-bounce";

  useEffect(() => {
    messageListInputRef.current?.scrollTo({
      top: messageListInputRef.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <>
      <main className="flex min-h-screen items-center justify-center">
        {status === "unauthenticated" && <p className="absolute text-white font-bold">Please login to access our services</p>}

        <div className={chatGridStyles}>
          <div
            ref={messageListInputRef}
            className="flex flex-col col-span-2 rounded border-2 border-gray-400 text-white overflow-auto scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-purple-100 scrollbar-thumb-rounded-lg">
            <div className="flex flex-auto flex-col justify-end">
              <ul className="my-2 mx-2">
                {messages.map((message) =>
                  <li key={message.message}>
                    <ChatMessage message={message.message} image={message.image} />
                  </li>
                )}
              </ul>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (message === "") return;
                sendMessage(message);
                setMessage('');
              }}
                className="sticky bottom-0"
              >
                <input
                  onChange={(event) => setMessage(event.target.value)}
                  value={message}
                  className="justify-self-end w-full h-10 p-5 focus:outline-none focus:ring focus:ring-teal-700-300 rounded-t bg-gradient-to-tr from-[#672468] to-[#35cccc]"
                  type="text" placeholder="Message..."
                />
              </form>
            </div>
          </div>

          <div className="rounded border-2 border-gray-400 overflow-auto scrollbar-thin scrollbar-thumb-[#8fcbe7] scrollbar-track-[#ffff] scrollbar-thumb-rounded-lg">
            <ul>
              {chatParticipants.map((participant) => {
                let id = 0;
                return (<li key={id++}>
                  <ChatParticipant name={participant.name} image={participant.image} online={participant.online} />
                </li>);
              }
              )}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const jwtToken = await getToken({ ...context, raw: true });

  const session = await getServerSession(context.req, context.res, authOptions);

  if (session && !session.user.name)
    return { redirect: { destination: "/auth/new-user" } };

  return {
    props: {
      jwtToken,
    },
  }
}