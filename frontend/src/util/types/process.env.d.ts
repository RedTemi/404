declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_REST_URL?: string;
            NEXT_PUBLIC_WS_URL?: string;
        }
    }
}

export { };
