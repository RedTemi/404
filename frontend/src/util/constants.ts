const REST_URL = process.env.NEXT_PUBLIC_REST_URL ?? "https://api.404.game"
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "wss://ws.404.game:8443/ws"

const USERNAME_REGEX = "[A-z0-9_.-]" // guuuu :3

export { REST_URL, USERNAME_REGEX, WS_URL }
