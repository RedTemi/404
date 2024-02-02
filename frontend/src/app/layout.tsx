import { Montserrat } from "next/font/google"
import { Providers } from "../components/provider/theme"
import { WebSocketProvider } from "../components/provider/websocket"
import { TurnstileAlert } from "@/components/Turnstile"

const font = Montserrat({
    subsets: ["latin"],
    variable: "--font-selected",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${font.className}`}>
            <body>
                <Providers>
                    <WebSocketProvider>
                        {children}

                        <TurnstileAlert />
                    </WebSocketProvider>
                </Providers>
            </body>
        </html>
    )
}
