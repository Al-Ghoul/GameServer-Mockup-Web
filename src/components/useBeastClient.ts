import { useSession } from "next-auth/react";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { type ChatMessageDetails } from "~/components/ChatMessage";
import { type ChatParticipantDetails } from "~/components/ChatParticipant";

export const useBeastClient = (initialMessages: ChatMessageDetails[], initialCharPaticipants: ChatParticipantDetails[], jwtToken: string
): {
    messages: ChatMessageDetails[],
    sendMessage: (message: string) => void,
    chatParticipants: ChatParticipantDetails[];
} => {
    const { data: session, status } = useSession();
    const socket = useRef<WebSocket | null>(null);

    const IsSocketReady = () => (socket.current?.readyState === socket.current?.OPEN
        && socket.current?.readyState !== socket.current?.CONNECTING)

    useEffect(() => {
        const isBrowser = typeof window !== "undefined";
        if (isBrowser && status === "authenticated" && !!!socket.current) {
            socket.current = new WebSocket("ws://localhost:1973");

            socket.current.onopen = () => {
                socket.current?.send(jwtToken);
                // socket.current?.send(JSON.stringify({ action: "JOIN", name: session.user.name }));
                if (session.user.name)
                    addParticipant(session.user.name);
            }

            // socket.current.onerror = (event) => {
            //     alert("Unexpected WebSocket Error, please refresh the page to reconnect")

            // }

            // socket.current.onclose = (event) => {
            //     alert("Unexpected WebSocket closure, please refresh the page to reconnect")
            // }

            socket.current.onmessage = (event: { data: string }) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const SERVER_MESSAGE: ServerMessageActionType = JSON.parse(event.data);
                switch (SERVER_MESSAGE.type) {
                    case "USER_JOIN":
                        addParticipant(SERVER_MESSAGE.userData.name);
                        break;
                    case "USER_MESSAGE":
                        addMessage(SERVER_MESSAGE.body.message);
                        break;
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, session]);

    const [chatParticipants, dispatchParticipants] = useReducer((state: ChatParticipantDetails[], action: ServerMessageActionType) => {
        switch (action.type) {
            case "USER_JOIN":
                if (state.findIndex(user => user.name === action.userData.name) !== -1) {
                    return state;
                }
                else {
                    return [
                        ...state,
                        {
                            name: action.userData.name,
                            image: "/images/Picsart_22-12-20_09-46-11-410.png",
                            online: true
                        },
                    ];
                }
            default:
                throw new Error();
        }
    }, initialCharPaticipants);

    const [messages, dispatch] = useReducer((state: ChatMessageDetails[], action: ChatMessageActionType) => {
        switch (action.type) {
            case "ADD_MESSAGE":
                return [
                    ...state,
                    {
                        message: action.message,
                        image: "/images/Picsart_22-12-20_09-46-11-410.png",
                    },
                ];

            case "SEND_MESSAGE":
                socket.current?.send(JSON.stringify({ action: action.type, message: action.message }));
                return [
                    ...state,
                    {
                        message: action.message,
                        image: "/images/Picsart_22-12-20_09-46-11-410.png",
                    },
                ];
            default:
                throw new Error();
        }
    }, initialMessages);

    const addMessage = useCallback((message: string) => {
        if (!IsSocketReady())
            return;
        dispatch({
            type: "ADD_MESSAGE",
            message,
        });
    }, []);

    const sendMessage = useCallback((message: string) => {
        if (!IsSocketReady())
            return;
        dispatch({
            type: "SEND_MESSAGE",
            message,
        });
    }, []);

    const addParticipant = useCallback((name: string) => {
        if (!IsSocketReady())
            return;
        dispatchParticipants({
            type: "USER_JOIN",
            userData: {
                name
            },
        });
    }, []);

    return { messages, sendMessage, chatParticipants };
}

type ChatMessageActionType =
    | { type: "ADD_MESSAGE"; message: string }
    | { type: "SEND_MESSAGE"; message: string }

type ServerMessageActionType =
    | { type: "USER_JOIN"; userData: { name: string } }
    | { type: "USER_MESSAGE"; body: { message: string } }
