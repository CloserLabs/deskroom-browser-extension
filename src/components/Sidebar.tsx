import { ArrowLeftIcon, Cross1Icon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Separator,
  TextArea,
} from "@radix-ui/themes";
import type { User } from "@supabase/supabase-js";
import deskroomLogo from "data-base64:assets/logo.png";
import { useEffect, useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import { useMixpanel } from "~contexts/MixpanelContext";
import type { OrganizationStorage } from "~options";

import NewKnowledgeBaseForm from "./NewKnowledgeBaseForm";
import SidebarContent from "./SidebarContent";

type SidebarProps = {
  isOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  auth: User;
  question: string;
  setMessage: (message: string) => void;
  // orgs: OrganizationStorage | null
};
export type Answer = {
  category: string;
  answer: string;
};

const Sidebar: React.FC<
  SidebarProps & React.HTMLAttributes<HTMLDivElement>
> = ({ isOpen, auth, setSidebarOpen, question: message, setMessage }) => {
  const [answers, setAnswers] = useState<Answer[] | null | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  // TODO: set org by select
  const [orgs, setOrgs] = useStorage<OrganizationStorage | null>("orgs");
  const [mode, setMode] = useState<"search" | "new">("search");
  const [newAnswer, setNewAnswer] = useState<string>("");
  const [newAnswerLoading, setNewAnswerLoading] = useState<boolean>(false);
  const mixpanel = useMixpanel();

  useEffect(() => {
    if (!!message) {
      mixpanel.track(
        isOpen ? "Answer Panel Activated" : "Answer Panel Deactivated",
        { question: message }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (orgs) {
      mixpanel.register({
        org: orgs.currentOrg.key,
      });
    }
  }, [orgs]);

  // TODO: make it work
  useEffect(() => {
    if (isOpen && message) {
      handleSearch();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!auth) {
      alert("로그인이 필요합니다.");
      return;
    }
    setLoading(true);
    setAnswers(undefined); // reset
    mixpanel.track("Answer Search Started", { question: message });
    const res = await fetch(`https://api.closer.so/v1/retrieve/`, {
      body: JSON.stringify({
        organization_key: orgs?.currentOrg.key,
        question: message,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then((res) => {
        setLoading(false);
        return res.json();
      })
      .catch((err) => {
        alert("응답 생성에 실패했습니다. Error: " + err);
        setLoading(false);
        setAnswers(null);
      });
    setAnswers(res?.["retrieved_messages"] ?? null);
    mixpanel.track("Answer Search Ended", { question: message });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Flex
      id="sidebar"
      direction={`column`}
      className="fixed w-2/6 bg-white h-screen transition-all right-0 content-between border-1 border container shadow-md"
    >
      <Flex className="sidebar-title-area flex items-center p-2">
        <img src={deskroomLogo} alt="deskroom logo" className="w-24" />
        {orgs?.availableOrgs.length >= 1 && (
          <Flex className="sidebar-organization-select">
            <select
              name="organization"
              id="organization"
              value={orgs?.currentOrg.name_kor}
              onChange={(e) => {
                setOrgs({
                  availableOrgs: orgs.availableOrgs,
                  currentOrg: orgs.availableOrgs.find(
                    (org) => org.name_kor === e.target.value
                  ),
                }).catch((err) => {
                  console.error(err); // NOTE: QUOTA_BYTES_PER_ITEM Error
                });
              }}
              className="mx-2 w-fit rounded-md border border-1 text-xs border-gray-900 px-[2px] py-[0.5px] h-fit"
            >
              {orgs?.availableOrgs.map((org, orgIndex) => (
                <option value={org.name_kor} key={orgIndex}>
                  {org.name_kor}
                </option>
              ))}
            </select>
          </Flex>
        )}
        <Flex className="ml-auto">
          <IconButton
            hidden={mode === "search"}
            onClick={() => {
              setMode("search");
            }}
            className="hover:bg-gray-200 rounded-sm transition-all ease-in-out duration-100"
          >
            <ArrowLeftIcon width={`14`} height={`15`} />
          </IconButton>
          <IconButton
            onClick={() => {
              setSidebarOpen(false);
            }}
            className="hover:bg-gray-200 rounded-sm transition-all ease-in-out duration-100"
          >
            <Cross1Icon width={`14`} height={`15`} />
          </IconButton>
        </Flex>
      </Flex>
      <Separator size={`4`} style={{ backgroundColor: "#eee" }} />
      {mode === "search" && (
        <SidebarContent
          hasLoggedIn={!!auth}
          message={message}
          setMessage={setMessage}
          loading={loading}
          handleSearch={handleSearch}
          answers={answers}
        />
      )}
      {mode === "new" && (
        <NewKnowledgeBaseForm
          orgs={orgs}
          message={message} // TODO: reduce props
          newAnswer={newAnswer}
          newAnswerLoading={newAnswerLoading}
          setMessage={setMessage}
          setNewAnswer={setNewAnswer}
          setNewAnswerLoading={setNewAnswerLoading}
          setMode={setMode}
        />
      )}
      <Flex
        className="sidebar-footer-area p-2 mt-auto"
        justify={`center`}
        align={`center`}
      >
        {!answers ? (
          <Box>
            <img src={deskroomLogo} alt="deskroom logo" className="w-[66px]" />
          </Box>
        ) : (
          <Box
            className="text-[#7A7A7A] cursor-pointer text-xs"
            onClick={() => {
              setMode("new");
            }}
          >
            적절한 답변을 찾지 못하셨다면 <u>여기</u>를 눌러 새 답변을
            작성해주세요.
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

export default Sidebar;
