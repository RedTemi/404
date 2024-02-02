"use client"

import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { redirect } from "next/navigation"
import { AccountViewerTable } from "./components/AccountTable"
import { isUserAdmin } from "../../../util/roadblocks"
import { useAuthStore } from "../../../stores/auth"

function AdminPage() {
    const user = useAuthStore((state) => state.user)

    if (!user || !isUserAdmin(user)) {
        redirect("/")
    }

    return (
        <Tabs isLazy isFitted>
            <TabList>
                <Tab>Info</Tab>
                <Tab>User Manager</Tab>
                <Tab isDisabled>Stats</Tab>
                <Tab isDisabled>Settings</Tab>
            </TabList>

            <TabPanels>
                <TabPanel>
                    <p>one!</p>
                </TabPanel>
                <TabPanel>
                    <AccountViewerTable />
                </TabPanel>
                <TabPanel>
                    <p>three!</p>
                </TabPanel>
                <TabPanel>
                    <p>four!</p>
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}

export default AdminPage
