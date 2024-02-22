import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import browser from "webextension-polyfill"

import { useStorage } from "@plasmohq/storage/hook"

import { supabase } from "~core/supabase"
import { useTextSelection } from "~hooks/useTextSelection"

import CollapsibleText from "./CollapsibleText"

type SidebarProps = {
  isOpen: boolean
}

const Sidebar: React.FC<
  SidebarProps & React.HTMLAttributes<HTMLDivElement>
> = ({ isOpen }) => {
  const [user] = useStorage<User>("user")
  const [message, setMessage] = useState("")
  const [answers, setAnswers] = useState<string[]>([])
  const [myAnswer, setMyAnswer] = useState<string>("")

  const { text, rects } = useTextSelection()

  useEffect(() => {
    if (text && rects.length > 0) {
      setMessage(text)
    }
  }, [rects])

  const handleSearch = async () => {
    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }
    const { data, error } = await supabase
      .from("questions")
      .insert([{ user_id: user.id, user_question: message }])
      .select()
    if (error) {
      console.log(error)
    }
    const requestBody = {
      question: message,
      question_id: data?.[0].id,
      org_name: "glucofit"
    }
    const res = await fetch("https://api.closer.so/v1/answers/", {
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    })
      .then((res) => res.json())
      .catch((err) => {
        alert("응답 생성에 실패했습니다. Error: " + err)
        console.error(error)
      })
    setAnswers(res)
  }

  return (
    <>
      {message && isOpen && (
        <div
          id="sidebar"
          className="fixed w-2/6 bg-white px-4 h-screen transition-all right-0 flex flex-col content-between py-8 border-1 border container">
          <div className="sidebar-title-area flex items-center">
            <div className="sidebar-title text-3xl font-bold">Closer</div>
            <div className="sidebar-user-info-status ml-auto animate-pulse">
              <div
                className={`w-3 h-3 rounded-full ${user ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
          </div>
          {!user && (
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
            <label htmlFor="" className="text-sm my-2">
              메시지
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              wrap="soft"
            />
            <div className="sidebar-search-submit-btn" onClick={handleSearch}>
              <button className="bg-blue-500 px-4 rounded-lg w-32 h-8">
                Search
              </button>
            </div>
            <div className="sidebar-answer-view">
              <div className="sidebar-answer-title">
                <div className="text-sm">추천 답변</div>
              </div>
              <div className="sidebar-answer-content">
                {answers.map((answer, answerIndex) => (
                  <div className="answer-card" key={answerIndex}>
                    <CollapsibleText
                      className="answer-card-title cursor-pointer"
                      style={{ fontSize: 12 }}
                      text={answer}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="sidebar-my-answer">
              <div className="sidebar-my-answer-label text-sm">내 답변</div>
              <div className="my-answer-input flex">
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                  value={myAnswer}
                  onChange={(e) => setMyAnswer(e.target.value)}
                  rows={4}
                  wrap="soft"
                />
                <button className="bg-blue-500 px-4 rounded-lg w-32 h-8 mx-2">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
