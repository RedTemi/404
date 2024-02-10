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
async function banUser(token:string, target_id:number){
    const req = await fetch(`${REST_URL}/api/users/ban/${target_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    return await req.json()
}
async function unbanUser(token:string, target_id:number){
    const req = await fetch(`${REST_URL}/api/users/unban/${target_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    return await req.json()
}
async function editRole(token:string, target_id:number, roles:Role[]){
    const req = await fetch(`${REST_URL}/api/users/roles/${target_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({role})
    })
    return await req.json()
}

async function approveUser(token:string, target_id:number){
    const req = await fetch(`${REST_URL}/api/users/approve/${target_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    return await req.json()
}

async function deleteUser(token: string, target_id: number) {
    const req = await fetch(`${REST_URL}/api/users/delete/${target_id}`, {
        method: "DELETE",
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

export { getUserById, getUsers, getUsersWithRole, updateOtherUser,deleteUser, banUser,editRole,unbanUser,approveUser};
