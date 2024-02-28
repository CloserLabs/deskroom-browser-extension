import {
  Cross2Icon,
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
import { useEffect, useState } from "react"
import browser from "webextension-polyfill"

import { useStorage } from "@plasmohq/storage/hook"

import { supabase } from "~core/supabase"
import { useTextSelection } from "~hooks/useTextSelection"

import CollapsibleText from "./CollapsibleText"

type SidebarProps = {
  isOpen: boolean
  auth: User
}

const Sidebar: React.FC<
  SidebarProps & React.HTMLAttributes<HTMLDivElement>
> = ({ isOpen, auth }) => {
  const [message, setMessage] = useState("")
  const [organizationName, setOrganizationName] = useState<string>("glucofit")
  const [answers, setAnswers] = useState<string[] | null>([])
  const [myAnswer, setMyAnswer] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const { text, rects } = useTextSelection()

  useEffect(() => {
    if (text && rects.length > 0) {
      setMessage(text)
    }
  }, [rects])

  // useEffect(() => {
  //   handleSearch()
  // }, [isOpen])

  const handleSearch = async () => {
    if (!auth) {
      alert("로그인이 필요합니다.")
      return
    }
    setLoading(true)
    setAnswers(null) // reset
    const res = await fetch(`https://api.closer.so/v1/retrieve/`, {
      body: JSON.stringify({
        organization_name: organizationName,
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
        console.error(err)
      })
    setAnswers(res?.["retrieved_messages"] ?? null)
  }

  return (
    <>
      {message && isOpen && (
        <div
          id="sidebar"
          className="fixed w-2/6 bg-white px-4 h-screen transition-all right-0 flex flex-col content-between py-8 border-1 border container">
          <Box mb={`2`}>
            <IconButton
              onClick={() => setMessage(null)}
              className="hover:bg-gray-200 rounded-sm transition-all ease-in-out duration-75">
              <DoubleArrowRightIcon width={`20`} height={`20`} />
            </IconButton>
          </Box>
          <div className="sidebar-title-area flex items-center">
            <div className="sidebar-title text-3xl font-bold">Deskroom</div>
            <div className="sidebar-user-info-status ml-auto animate-pulse">
              <div
                className={`w-3 h-3 rounded-full ${auth ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
          </div>
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
              <Flex>
                <TextField.Root size={`3`} style={{ flex: 1 }}>
                  <TextField.Input
                    className="w-full border border-gray-300 rounded-lg p-2 mb-4 flex-1 bg-gray-100"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </TextField.Root>
                <IconButton
                  onClick={handleSearch}
                  ml={`auto`}
                  className="hover:bg-gray-200 transtion-all duration-75 rounded p-2">
                  <MagnifyingGlassIcon width="18" height="18" />
                </IconButton>
              </Flex>
            </Flex>
            <Separator />
            <div className="sidebar-answer-view">
              <div className="sidebar-answer-title">
                <div className="text-sm font-bold">추천 답변</div>
              </div>
              <Flex className="py-4" direction={`column`} gap={`2`}>
                {loading ? (
                  <div className="animate-pulse w-full h-36 bg-gray-200 rounded-md"></div>
                ) : null}
                {!!answers ? (
                  answers.map((answer, answerIndex) => (
                    <Card
                      className="w-full p-4 rounded-lg bg-gray-100 hover:bg-gray-300 transition-all ease-in-out duration-75 cursor-pointer"
                      onClick={() => {
                        window.navigator.clipboard.writeText(answer)
                        alert("복사되었습니다.")
                      }}
                      key={answerIndex}>
                      <Blockquote className="text-sm text-gray-500">
                        {answer}
                      </Blockquote>
                    </Card>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">답변이 없습니다.</div>
                )}
              </Flex>
            </div>
            <div className="sidebar-my-answer">
              <div className="sidebar-my-answer-label text-sm font-bold">
                내 답변
              </div>
              <div className="my-answer-input flex">
                <TextField.Root size={`3`} style={{ flex: 1 }}>
                  <TextField.Input
                    className="w-full border border-gray-300 rounded-lg p-2 mb-4 bg-gray-200"
                    value={myAnswer}
                    onChange={(e) => setMyAnswer(e.target.value)}
                  />
                </TextField.Root>
                <IconButton className="bg-blue-500 px-4 rounded-lg w-32 h-8 mx-2">
                  <PaperPlaneIcon width="18" height="18" />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
