import Image from "next/image";


export const ChatMessage = ({ message, image }: ChatMessageDetails) => {
    return (
        <div className="flex justify-end border-t-[1px] border-cyan-200 py-2">
            <p className="self-center mr-2">{message}</p>
            <Image
                className="rounded-full"
                src={image ?? "/images/Picsart_22-12-20_09-46-11-410.png"}
                width={50}
                height={0}
                alt="A placeholder"
            />
        </div>
    );
}

export type ChatMessageDetails =
    {
        message: string,
        image: string,
    }
