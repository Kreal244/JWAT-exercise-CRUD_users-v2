import { ReactNode } from "react";

export default function Layout({children}:{children:ReactNode}){
    return (
        <div className=" h-screen w-screen text-black flex justify-center items-center">
            {children}
        </div>
    )
}