"use client"
import { Alert, AlertTitle } from "@/components/ui/alert"
import {useRouter} from "next/navigation"
export default function AlertComponent(){
    const route = useRouter()
    return (
        <Alert className="bg-blue-800 cursor-pointer " onClick={()=>{return route.push("/api/auth/reference")}}>
            <AlertTitle>To see the complete openAPI documentation click here</AlertTitle>
        </Alert>
    )
}