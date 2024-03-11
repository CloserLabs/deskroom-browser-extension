import { Cross1Icon } from "@radix-ui/react-icons"
import {
  Box,
  Button,
  Flex,
  IconButton,
  Separator,
  TextField
} from "@radix-ui/themes"
import type { User } from "@supabase/supabase-js"
import deskroomLogo from "data-base64:assets/logo.png"
import mixpanel from "mixpanel-browser"
import { useEffect, useState } from "react"
import browser from "webextension-polyfill"

import { useStorage } from "@plasmohq/storage/hook"

import { useTextSelection } from "~hooks/useTextSelection"
import type { OrganizationStorage } from "~options"

import CollapsibleCard from "./CollapsibleCard"
import Skeleton from "./Sketleton"

type SidebarProps = {
  isOpen: boolean
  setSidebarOpen: (isOpen: boolean) => void
  auth: User
  // orgs: OrganizationStorage | null
}

const Sidebar: React.FC<
  SidebarProps & React.HTMLAttributes<HTMLDivElement>
> = ({ isOpen, auth, setSidebarOpen }) => {
  const [message, setMessage] = useState("") // TODO: handle message from parent
  const [answers, setAnswers] = useState<string[] | null | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  // TODO: set org by select
  const [orgs, setOrgs] = useStorage<OrganizationStorage | null>("orgs")

  const { text, rects } = useTextSelection()

  useEffect(() => {
    if (text && rects.length > 0) {
      setMessage(text)
    }
  }, [rects])

  useEffect(() => {
    mixpanel.track(
      isOpen ? "Answer Panel Activated" : "Answer Panel Deactivated",
      { question: message }
    )
  }, [isOpen])

  useEffect(() => {
    if (orgs) {
      mixpanel.register({
        org: orgs.currentOrg.key
      })
    }
  }, [orgs])

  // TODO: make it work
  // useEffect(() => {
  //   handleSearch()
  // }, [isOpen])

  const handleSearch = async () => {
    if (!auth) {
      alert("로그인이 필요합니다.")
      return
    }
    setLoading(true)
    setAnswers(undefined) // reset
    mixpanel.track("Answer Search Started", { question: message })
    const res = await fetch(`https://api.closer.so/v1/retrieve/`, {
      body: JSON.stringify({
        organization_name: orgs?.currentOrg.key,
        question: message
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    })
      .then((res) => {
        setLoading(false)
        return res.json()
      })
      .catch((err) => {
        alert("응답 생성에 실패했습니다. Error: " + err)
        setLoading(false)
        setAnswers(null)
      })
    setAnswers(res?.["retrieved_messages"] ?? null)
    mixpanel.track("Answer Search Ended", { question: message })
  }

  return (
    <>
      {message && isOpen && (
        <Flex
          id="sidebar"
          direction={`column`}
          className="fixed w-[320px] bg-white h-screen transition-all right-0 content-between border-1 border container shadow-md">
          <Flex className="sidebar-title-area flex items-center p-2">
            <img src={deskroomLogo} alt="deskroom logo" className="w-[66px]" />
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
                      )
                    }).catch((err) => {
                      console.error(err) // NOTE: QUOTA_BYTES_PER_ITEM Error
                    })
                  }}
                  className="mx-2 w-fit rounded-md border border-1 text-[8px] border-gray-900 px-[2px] py-[0.5px] h-[16px]">
                  {orgs?.availableOrgs.map((org, orgIndex) => (
                    <option value={org.name_kor} key={orgIndex}>
                      {org.name_kor}
                    </option>
                  ))}
                </select>
              </Flex>
            )}
            <IconButton
              onClick={() => {
                setSidebarOpen(false)
              }}
              className="hover:bg-gray-200 rounded-sm transition-all ease-in-out duration-100 ml-auto">
              <Cross1Icon width={`14`} height={`15`} />
            </IconButton>
          </Flex>
          <Separator size={`4`} style={{ backgroundColor: "#eee" }} />
          {!auth && (
            <div className="sidebar-redirect-to-options-page my-4">
              <div className="info-callout bg-blue-200 border border-blue-500 text-blue-700 px-4 py-3 rounded relative">
                <a
                  href={browser.runtime.getURL("options.html")}
                  target="_blank">
                  Login in options page to use this extension. Click here to go
                  to options page.
                </a>
              </div>
            </div>
          )}
          <div className="sidebar-content-area container px-2">
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
                  className={`w-full bg-[#407CF0] text-[11px] transition-all ease-in-out duration-100 
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
                  <Flex
                    className="ml-auto"
                    justify="center"
                    align="center"
                    gap={`2`}>
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
          </div>
          <Flex
            className="sidebar-footer-area p-2 mt-auto"
            justify={`center`}
            align={`center`}>
            {!answers ? (
              <Box>
                <img
                  src={deskroomLogo}
                  alt="deskroom logo"
                  className="w-[66px]"
                />
              </Box>
            ) : (
              <Box
                className="text-[10px] text-[#7A7A7A] cursor-pointer"
                onClick={() => {
                  console.log("새 답변")
                }}>
                적절한 답변을 찾지 못하셨다면 <u>여기</u>를 눌러 새 답변을
                작성해주세요.
              </Box>
            )}
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default Sidebar
