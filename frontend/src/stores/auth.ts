import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { REST_URL } from "../util/constants";
import { RegisteringUser, User } from "../util/types/user";

type AuthStore = {
    _authToken?: string;
    setAuthToken: (token: string) => void;
    user?: User;
    register: (newUser: RegisteringUser) => Promise<void>;
    logout: () => void;
    error?: string;
};

const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            _authToken: undefined,
            setAuthToken: async (token) => {
                const user = await getUserFromToken(token);
                set({ user, _authToken: token });
            },
            user: undefined,
            register: async (newuser) => {
                const formdata = new FormData();
                formdata.append("memberid", newuser.memberID.toString());
                formdata.append("username", newuser.username);
                formdata.append("first_name", newuser.firstName);
                formdata.append("last_name", newuser.lastName);

                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    body: formdata,
                });

                if (!res.ok) {
                    const body = await res.text();
                    if (body.includes("duplicate key value violates unique constraint")) {
                        set({ error: "Account already exists" });
                    }
                }

                const { token } = await res.json();
                set({ _authToken: token });
            },
            logout: () =>
                set({
                    user: undefined,
                    _authToken: undefined,
                }),
            exists: "",
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);

async function getUserFromToken(token: string) {
    const res = await fetch(`${REST_URL}/api/users/@me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }); //
    const user = await res.json();
    return user;
}

export { useAuthStore };
