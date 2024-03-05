import {
  DoubleArrowRightIcon,
  MagnifyingGlassIcon,
  PaperPlaneIcon
} from "@radix-ui/react-icons"
import {
  Blockquote,
  Box,
  Card,
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

type SidebarProps = {
  isOpen: boolean
  auth: User
  // orgs: OrganizationStorage | null
}

const Sidebar: React.FC<
  SidebarProps & React.HTMLAttributes<HTMLDivElement>
> = ({ isOpen, auth }) => {
  const [message, setMessage] = useState("")
  const [answers, setAnswers] = useState<string[] | null | undefined>(undefined)
  const [myAnswer, setMyAnswer] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  // TODO: set org by select
  const [orgs, setOrgs] = useStorage<OrganizationStorage | null>("orgs")

  const { text, rects } = useTextSelection()

  useEffect(() => {
    if (text && rects.length > 0) {
      setMessage(text)
    }
  }, [rects])

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
    mixpanel.track("Searched", {
      platform: "chrome-extension",
      question: message,
      answers: res?.["retrieved_messages"]
    })
  }

  return (
    <>
      {message && isOpen && (
        <div
          id="sidebar"
          className="fixed w-2/6 bg-white px-4 h-screen transition-all right-0 flex flex-col content-between py-4 border-1 border container shadow-md">
          <Flex className="sidebar-title-area flex items-center py-4">
            <img src={deskroomLogo} alt="deskroom logo" className="w-[120px]" />
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
                  className="rounded-lg p-2 bg-gray-100 text-sm mx-2">
                  {orgs?.availableOrgs.map((org, orgIndex) => (
                    <option value={org.name_kor} key={orgIndex}>
                      {org.name_kor}
                    </option>
                  ))}
                </select>
              </Flex>
            )}
            <IconButton
              onClick={() => setMessage(null)}
              className="hover:bg-gray-200 rounded-sm transition-all ease-in-out duration-75 ml-auto">
              <DoubleArrowRightIcon width={`20`} height={`20`} />
            </IconButton>
            <Separator
              size={`4`}
              orientation={`vertical`}
              style={{ backgroundColor: "#eee" }}
              className="mx-4"
            />
            <div className="sidebar-user-info-status animate-pulse">
              <div
                className={`w-3 h-3 rounded-full ${auth ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
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
          <div className="sidebar-content-area py-4">
            <Flex width={`100%`} direction={`column`}>
              <Box>
                <label htmlFor="" className="text-sm my-2 font-bold">
                  메시지
                </label>
              </Box>
              <Flex align={`center`} justify={`center`} className="my-2">
                <TextField.Root size={`3`} style={{ flex: 1 }}>
                  <TextField.Input
                    className="w-full rounded-lg flex-1 bg-gray-100 text-sm p-2"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </TextField.Root>
                <IconButton
                  onClick={handleSearch}
                  ml={`auto`}
                  className="hover:bg-gray-200 transtion-all duration-75 rounded mx-2">
                  <MagnifyingGlassIcon width="18" height="18" />
                </IconButton>
              </Flex>
            </Flex>
            <Separator />
            <div className="sidebar-answer-view my-2">
              <div className="sidebar-answer-title">
                <div className="text-sm font-bold">추천 답변</div>
              </div>
              <Flex direction={`column`} gap={`2`} className="my-2">
                {loading && answers === undefined ? (
                  <div className="animate-pulse w-full h-36 bg-gray-100 rounded-md"></div>
                ) : (
                  <div className="w-full h-36 bg-gray-100 rounded-md">
                    <div className="text-sm text-gray-500 p-4">
                      🔍 버튼을 눌러 답변을 찾아보세요.
                    </div>
                  </div>
                )}
                {answers ? (
                  answers.map((answer, answerIndex) => (
                    <Card
                      className="w-full p-4 rounded-lg bg-gray-100 hover:bg-gray-300 transition-all ease-in-out duration-75 cursor-pointer"
                      onClick={() => {
                        window.navigator.clipboard.writeText(answer) // TODO: make it work
                        alert("복사되었습니다.")
                      }}
                      key={answerIndex}>
                      <Blockquote className="text-sm text-gray-500">
                        {answer}
                      </Blockquote>
                    </Card>
                  ))
                ) : (
                  <div
                    className="text-sm text-gray-500"
                    hidden={answers == null}>
                    답변이 없습니다.
                  </div>
                )}
              </Flex>
            </div>
            <div className="sidebar-my-answer my-2">
              <div className="sidebar-my-answer-label text-sm font-bold">
                내 답변
              </div>
              <Flex className="my-answer-input my-2" align={`center`}>
                <TextField.Root size={`3`} style={{ flex: 1 }}>
                  <TextField.Input
                    className="w-full rounded-lg p-2 bg-gray-100"
                    value={myAnswer}
                    onChange={(e) => setMyAnswer(e.target.value)}
                  />
                </TextField.Root>
                <IconButton className="bg-blue-400 hover:bg-blue-500 rounded-lg mx-2">
                  <PaperPlaneIcon width="18" height="18" />
                </IconButton>
              </Flex>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
