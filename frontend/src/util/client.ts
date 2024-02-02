import { REST_URL } from "./constants";
import { Role } from "./types/user";

async function getUserById(token: string, target_id: number) {
    const req = await fetch(`${REST_URL}/api/users/${target_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    return await req.json()
}

async function updateOtherUser(token: string, target_id: number, changes: any) {
    const req = await fetch(`${REST_URL}/api/users/${target_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
        , body: JSON.stringify(changes)
    })
    return await req.json()
}

async function getUsers(token: string) {
    const req = await fetch(`${REST_URL}/api/users/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    return await req.json()
}

async function getUsersWithRole(token: string, role: Role) {
    const req = await fetch(`${REST_URL}/api/users/roles/${role}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    return await req.json()
}

export { getUserById, getUsers, getUsersWithRole, updateOtherUser };
