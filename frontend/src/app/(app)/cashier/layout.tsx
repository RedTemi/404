"use client"
import { TitleBar } from "../../../components/TitleBar"

function CashierLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <TitleBar />
            {children}
        </>
    )
}

export default CashierLayout
