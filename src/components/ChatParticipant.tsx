import Image from "next/image";

export const ChatParticipant = ({ name, image, online }: ChatParticipantDetails) => {
    return (
        <div className="flex py-3 justify-around border-b-[1px]  border-cyan-200">
            <Image
                className="rounded-full"
                src={image}
                width={50}
                height={0}
                alt="A placeholder"
            />
            <div className="flex flex-col justify-center">
                <p className="self-center font-medium">{name}</p>
                <div><p className="inline font-serif">Status: </p>
                    {
                        online ?
                            <p className="inline font-light text-green-500">Online</p>
                            :
                            <p className="inline font-light text-red-500">Offline</p>
                    }
                </div>
            </div>
        </div>)
        ;
}

export type ChatParticipantDetails =
    {
        name: string,
        image: string,
        online: boolean,
    }
