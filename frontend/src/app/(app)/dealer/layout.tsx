import { TitleBar } from "../../../components/TitleBar"

function DealerLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <TitleBar />
            {children}
        </>
    )
}

export default DealerLayout
