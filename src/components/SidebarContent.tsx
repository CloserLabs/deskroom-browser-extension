import * as Toast from "@radix-ui/react-toast";
import { Box, Button, Flex, Separator, TextArea } from "@radix-ui/themes";
import React from "react";
import browser from "webextension-polyfill";

import { useMixpanel } from "~contexts/MixpanelContext";

import CollapsibleCard from "./CollapsibleCard";
import type { Answer } from "./Sidebar";
import Skeleton from "./Sketleton";

type SidebarContentProps = {
  hasLoggedIn: boolean;
  message: string;
  setMessage: (message: string) => void;
  loading: boolean;
  handleSearch: () => void;
  answers: Answer[];
};
const SidebarContent: React.FC<SidebarContentProps> = ({
  hasLoggedIn,
  message,
  setMessage,
  loading,
  handleSearch,
  answers,
}) => {
  if (!hasLoggedIn) {
    return (
      <Flex
        className="sidebar-loading-area w-full h-full p-2"
        direction={`column`}
        justify={`center`}
      >
        <Flex direction={`column`} align={`center`}>
          <Flex
            className="text-[#7A7A7A] mt-2"
            direction={`column`}
            justify={`center`}
            align={`center`}
          >
            <Box>앗, 지금은 로그인이 되어있지 않아요.</Box>
            <Box>아래 버튼을 눌러 로그인을 완료해주세요.</Box>
          </Flex>
          <Button
            className="w-full bg-primary-900 rounded-md text-white max-w-xs my-2"
            onClick={() => {
              const optionsURL = browser.runtime.getURL("options.html");
              window.open(optionsURL, "_blank", "noopener, noreferrer");
            }}
          >
            로그인 페이지로 이동
          </Button>
        </Flex>
      </Flex>
    );
  }
  const [toastOpen, setToastOpen] = React.useState(false);
  const timerRef = React.useRef(0);
  const mixpanel = useMixpanel();
  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <>
      <Toast.Provider swipeDirection="up">
        <Toast.Root
          id="copy-toast"
          className="w-[320px] h-16 bg-[#9355F6] fixed top-[42px] opacity-75 z-10"
          open={toastOpen}
          onOpenChange={setToastOpen}
        >
          <Toast.Title className="flex items-center justify-center">
            🎉 복사 완료 🎉
          </Toast.Title>
        </Toast.Root>
      </Toast.Provider>
      <Box className="sidebar-content-area container px-2 py-4">
        <Flex width={`100%`} direction={`column`}>
          <Flex
            className="bg-[#2C2C2C] w-full rounded px-2 py-4 text-white"
            direction="column"
          >
            <TextArea
              className="w-full bg-[#2C2C2C] text-wrap break-all selection:bg-slate-400"
              size={`1`}
              style={{ padding: "unset" }}
              value={message}
              variant="soft"
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              variant="classic"
              className={`w-full transition-all ease-in-out duration-100 text-xs
                    ${
                      loading
                        ? "cursor-not-allowed bg-[#4A4A4A] text-[#7A7A7A]"
                        : "cursor-pointer bg-primary-900"
                    }
                  `}
              disabled={loading}
              onClick={handleSearch}
            >
              답변 찾기
            </Button>
          </Flex>
        </Flex>
        <Separator />
        {loading ? (
          <Flex
            className="sidebar-loading-area w-full h-full p-2"
            direction={`column`}
            align={`center`}
            justify={`center`}
          >
            <Box className="text text-[#7A7A7A] mt-2 text-xs">
              가장 적절한 답변을 찾고 있어요.
            </Box>
            <Flex direction={`column`} className="w-full my-2" gap={`2`}>
              <Skeleton />
              <Skeleton delay={75} />
              <Skeleton delay={100} />
            </Flex>
          </Flex>
        ) : (
          <Flex
            className="sidebar-answer-view my-2 bg-[#F5F6F7] p-2 rounded-md"
            direction="column"
          >
            <Flex
              className="text-sm text-[#7A7A7A]"
              align={`center`}
              justify={`center`}
            >
              <Box className="font-bold text-xs">⚡ 추천 답변 ⚡</Box>
              {/* TODO: 살리기 */}
              {/* <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button className="ml-auto tex기-[9px]" size={`1`}>
                    전체
                    <svg
                      width="7"
                      height="4"
                      viewBox="0 0 7 4"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 3L3.5 1L1 3"
                        stroke="#C4C4C4"
                        stroke-width="0.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="z-10" id="dropdown">
                  <DropdownMenu.Item>전체</DropdownMenu.Item>
                  <DropdownMenu.Item>환불</DropdownMenu.Item>
                  <DropdownMenu.Item>환불</DropdownMenu.Item>
                  <DropdownMenu.Item>환불</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root> */}
            </Flex>
            {answers && (
              <Flex
                direction={`column`}
                gap={`2`}
                align={`center`}
                justify={`center`}
                className="sidebar-answers w-full py-2"
              >
                {answers.map((answer, answerIdx) => (
                  <CollapsibleCard
                    title={answer?.category || "일반"}
                    key={answerIdx}
                    content={answer?.answer}
                    onCopyClicked={() => {
                      setToastOpen(false);
                      window.clearTimeout(timerRef.current);
                      timerRef.current = window.setTimeout(() => {
                        setToastOpen(true);
                      }, 100);
                      mixpanel.track("Answer Copied", {
                        question: message,
                      });
                      alert("복사되었습니다.");
                    }}
                  />
                ))}
              </Flex>
            )}
          </Flex>
        )}
      </Box>
    </>
  );
};

export default SidebarContent;
