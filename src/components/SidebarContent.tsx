import { Box, Button, Flex, Separator, TextField } from "@radix-ui/themes"
import mixpanel from "mixpanel-browser"
import browser from "webextension-polyfill"

import CollapsibleCard from "./CollapsibleCard"
import Skeleton from "./Sketleton"

type SidebarContentProps = {
  hasLoggedIn: boolean
  message: string
  setMessage: (message: string) => void
  loading: boolean
  handleSearch: () => void
  answers: string[]
}
const SidebarContent: React.FC<SidebarContentProps> = ({
  hasLoggedIn,
  message,
  setMessage,
  loading,
  handleSearch,
  answers
}) => {
  if (!hasLoggedIn) {
    return (
      <Flex
        className="sidebar-loading-area w-full h-full p-2"
        direction={`column`}
        justify={`center`}>
        <Flex direction={`column`} align={`center`}>
          <Flex
            className="text-[10px] text-[#7A7A7A] mt-2"
            direction={`column`}
            justify={`center`}
            align={`center`}>
            <Box>앗, 지금은 로그인이 되어있지 않아요.</Box>
            <Box>아래 버튼을 눌러 로그인을 완료해주세요.</Box>
          </Flex>
          <Button
            className="w-full bg-[#9355F6] rounded-md text-[11px] text-white max-w-xs my-2"
            onClick={() => {
              const optionsURL = browser.runtime.getURL("options.html")
              window.open(optionsURL, "_blank", "noopener, noreferrer")
            }}>
            로그인 페이지로 이동
          </Button>
        </Flex>
      </Flex>
    )
  }

  return (
    <Box className="sidebar-content-area container px-2 py-4">
      <Flex width={`100%`} direction={`column`}>
        <Flex
          className="bg-[#2C2C2C] w-full rounded px-2 py-4 text-white"
          direction="column">
          <TextField.Root>
            <TextField.Input
              className="w-full bg-[#2C2C2C] text-[10.5px]"
              size={`3`}
              style={{ padding: "unset" }}
              value={message}
              variant="soft"
              onChange={(e) => setMessage(e.target.value)}
            />
          </TextField.Root>
          <Button
            variant="classic"
            className={`w-full bg-[#9355F6] text-[11px] transition-all ease-in-out duration-100 
                    ${loading ? "cursor-not-allowed bg-[#4A4A4A] text-[#7A7A7A]" : "cursor-pointer"}
                  `}
            disabled={loading}
            onClick={handleSearch}>
            답변 찾기
          </Button>
        </Flex>
      </Flex>
      <Separator />
      {loading ? (
        <Flex
          className="sidebar-loading-area w-full h-full p-2"
          direction={`column`}
          justify={`center`}>
          <Box className="text-[10px] text-[#7A7A7A] mt-2">
            가장 적절한 답변을 찾고 있어요.
          </Box>
          <Flex direction={`column`} className="w-full" gap={`2`}>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </Flex>
        </Flex>
      ) : (
        <Flex
          className="sidebar-answer-view my-2 bg-[#F5F6F7] p-2 rounded-md"
          direction="column">
          <Flex className="text-[9px] text-[#7A7A7A]">
            <Box className="font-bold">⚡ 추천 답변 ⚡</Box>
            <Flex className="ml-auto" justify="center" align="center" gap={`2`}>
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
            </Flex>
          </Flex>
          {answers && (
            <Flex
              direction={`column`}
              gap={`2`}
              align={`center`}
              justify={`center`}
              className="sidebar-answers w-full py-2">
              {answers.map((answer, answerIdx) => (
                <CollapsibleCard
                  title="환불"
                  key={answerIdx}
                  content={answer}
                />
              ))}
            </Flex>
          )}
        </Flex>
      )}
    </Box>
  )
}

export default SidebarContent
