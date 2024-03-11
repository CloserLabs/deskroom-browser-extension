import { ArrowLeftIcon, Cross1Icon } from "@radix-ui/react-icons"
import {
  Box,
  Button,
  Flex,
  IconButton,
  Separator,
  TextArea,
  TextField
} from "@radix-ui/themes"
import type { User } from "@supabase/supabase-js"
import deskroomLogo from "data-base64:assets/logo.png"
import mixpanel from "mixpanel-browser"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import type { OrganizationStorage } from "~options"

import SidebarContent from "./SidebarContent"

type SidebarProps = {
  isOpen: boolean
  setSidebarOpen: (isOpen: boolean) => void
  auth: User
  question: string
  setMessage: (message: string) => void
  // orgs: OrganizationStorage | null
}

const Sidebar: React.FC<
  SidebarProps & React.HTMLAttributes<HTMLDivElement>
> = ({ isOpen, auth, setSidebarOpen, question: message, setMessage }) => {
  const [answers, setAnswers] = useState<string[] | null | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  // TODO: set org by select
  const [orgs, setOrgs] = useStorage<OrganizationStorage | null>("orgs")
  const [mode, setMode] = useState<"search" | "new">("search")
  const [newAnswer, setNewAnswer] = useState<string>("")
  const [newAnswerLoading, setNewAnswerLoading] = useState<boolean>(false)

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
  useEffect(() => {
    if (isOpen && message) {
      handleSearch()
    }
  }, [isOpen])

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

  if (!isOpen) {
    return null
  }

  return (
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
        <Flex className="ml-auto">
          <IconButton
            hidden={mode === "search"}
            onClick={() => {
              setMode("search")
            }}
            className="hover:bg-gray-200 rounded-sm transition-all ease-in-out duration-100">
            <ArrowLeftIcon width={`14`} height={`15`} />
          </IconButton>
          <IconButton
            onClick={() => {
              setSidebarOpen(false)
            }}
            className="hover:bg-gray-200 rounded-sm transition-all ease-in-out duration-100">
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
        <Box className="container px-2 py-4">
          <Flex width={`100%`} direction={`column`}>
            <Flex
              className="bg-[#2C2C2C] w-full rounded px-2 py-4 text-white"
              direction="column">
              <TextArea
                className="w-full bg-[#2C2C2C] text-[10.5px] text-wrap break-all"
                size={`1`}
                style={{ padding: "unset" }}
                value={message}
                variant="soft"
                onChange={(e) => setMessage(e.target.value)}
              />
            </Flex>
          </Flex>
          <Box className="my-4">
            <TextArea
              placeholder="위 문의에 대한 새로운 답변을 적어주세요."
              className="w-full text-[9.5px] bg-[#F8F9FA] rounded-md border border-[#ECECEC] p-2"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              size={`1`}
              rows={15}></TextArea>
          </Box>
          <Box className="text-end">
            <Button
              className={`w-[65px] h-[38px] rounded-md text-[10px] transiation-all ease-in-out duration-100
                ${newAnswer.length === 0 ? "cursor-not-allowed bg-[#ECECEC] text-[#C4C4C4]" : "cursor-pointer bg-[#2C2C2C] text-white"}
              `}
              onClick={async () => {
                setNewAnswerLoading(true)
                fetch(`https://api.deskroom.so/v1/knowledge/new`, {
                  method: "POST",
                  body: JSON.stringify({
                    org_key: orgs?.currentOrg.key,
                    question: message,
                    answer: newAnswer
                  }),
                  headers: {
                    "Content-Type": "application/json"
                  }
                })
                  .then((res) => {
                    if (res.ok) {
                      setNewAnswerLoading(false)
                      alert("답변이 성공적으로 등록되었습니다.")
                      setMode("search")
                    }
                  })
                  .catch((err) => {
                    setNewAnswerLoading(false)
                    alert("답변 등록에 실패했습니다. Error: " + err)
                  })
              }}>
              {newAnswerLoading ? (
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              ) : (
                <span>업로드</span>
              )}
            </Button>
          </Box>
        </Box>
      )}
      <Flex
        className="sidebar-footer-area p-2 mt-auto"
        justify={`center`}
        align={`center`}>
        {!answers ? (
          <Box>
            <img src={deskroomLogo} alt="deskroom logo" className="w-[66px]" />
          </Box>
        ) : (
          <Box
            className="text-[10px] text-[#7A7A7A] cursor-pointer"
            onClick={() => {
              setMode("new")
            }}>
            적절한 답변을 찾지 못하셨다면 <u>여기</u>를 눌러 새 답변을
            작성해주세요.
          </Box>
        )}
      </Flex>
    </Flex>
  )
}

export default Sidebar
