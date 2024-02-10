"use client";

import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import { AccountViewerTable } from "./components/AccountTable";
import { isUserAdmin } from "../../../util/roadblocks";
import { useAuthStore } from "../../../stores/auth";
import RaffleL from "./components/Raffle";
import Settings from "./components/Settings";
import { REST_URL } from "@/util/constants";

function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state._authToken);
  if (!user || !isUserAdmin(user)) {
    redirect("/");
  }
  function activeRaffle(): boolean {
    //TODO: check if there is an active raffle
    fetch(`${REST_URL}/api/raffle/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        return data.name == '' ? false : true;
      });
    return true;
  }

  return (
    <Tabs isLazy isFitted>
      <TabList>
        <Tab>Info</Tab>
        <Tab>User Manager</Tab>
        <Tab isDisabled>Stats</Tab>
        <Tab>Settings</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          {activeRaffle() ? (
            <RaffleL></RaffleL>
          ) : (
            <p>There is no active raffle</p>
          )}
        </TabPanel>
        <TabPanel>
          <AccountViewerTable />
        </TabPanel>
        <TabPanel>
          <p>three!</p>
        </TabPanel>
        <TabPanel>Settings</TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default AdminPage;
