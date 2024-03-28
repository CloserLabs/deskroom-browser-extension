import type { User } from "@supabase/supabase-js";
import deskroomLogo from "data-base64:assets/logo.png";
import "./style.css";
import "data-text:@radix-ui/themes/styles.css";

import { useStorage } from "@plasmohq/storage/hook";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Separator,
  TextField,
} from "@radix-ui/themes";
import { ArrowTopRightIcon, GearIcon } from "@radix-ui/react-icons";
import type { OrganizationStorage } from "~options";
import browser from "webextension-polyfill";

// TODO: find why this is not working
export const getStyle = () => {
  const style = document.createElement("style");
  return style;
};

function IndexPopup() {
  const [user, setUser] = useStorage<User>("user");
  const [orgs, setOrgs] = useStorage<OrganizationStorage | null>("orgs");

  return (
    <Flex className="w-60 h-64 px-4 py-2">
      <Flex className="container" direction="column">
        <Flex direction="row" style={{ display: "flex" }}>
          <img src={deskroomLogo} alt="deskroom logo" className="w-20 my-2" />
          <IconButton className="ml-auto hover:bg-gray-100 px-2">
            <GearIcon />
          </IconButton>
        </Flex>
        <Flex className="py-2" gap="3">
          <Box className="my-2 flex flex-col">
            <label htmlFor="org" className="text-gray-400">
              소속
            </label>
            <input
              type="text"
              id="org"
              value={orgs?.currentOrg?.key || ""}
              placeholder="소속"
              disabled
            />
          </Box>
          <Separator size="4" />
          <Box className="my-2 flex flex-col">
            <label htmlFor="account" className="text-gray-400">
              로그인 된 계정
            </label>
            <input
              type="text"
              id="account"
              value={user?.email || ""}
              placeholder="로그인 된 계정"
              disabled
            />
          </Box>
        </Flex>
        <Button
          className="w-full rounded bg-primary-900 py-2 text-white"
          onClick={() => {
            setUser(null);
            setOrgs(null);
            const optionsURL = browser.runtime.getURL("options.html");
            window.open(optionsURL, "_blank", "noopener, noreferrer");
          }}
        >
          로그아웃
        </Button>
      </Flex>
      <Separator color="gray" size="4" />
      <Box
        className="text-center py-4 flex align-center justify-center cursor-pointer"
        onClick={() => {
          chrome.tabs?.create({ active: true, url: "https://app.deskroom.so" });
        }}
      >
        Knowledge Base로 이동
        <IconButton>
          <ArrowTopRightIcon />
        </IconButton>
      </Box>
    </Flex>
  );
}

export default IndexPopup;
