import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
    fonts: {
        heading: "var(--font-selected)",
        body: "var(--font-selected)",
    },
    colors: {
        gray: {
            400: "#313131",
            500: "#272727",
            600: "#222222",
            700: "#1F1F1F",
            800: "#1C1C1C"
        },
        red: {
            200: "#F44B48",
            300: "#FF0000"
        }
    },
    config: {
        initialColorMode: "dark", // no light theme support sorry
    }
})