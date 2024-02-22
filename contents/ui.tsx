import type { User } from "@supabase/supabase-js"
import tailwindcssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import browser from "webextension-polyfill"

import { useStorage } from "@plasmohq/storage/hook"

import Tooltip from "~components/Tooltip"
import { supabase } from "~core/supabase"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.plasmo.com/*",
    "https://desk.channel.io/*",
    "https://sell.smartstore.naver.com/*"
  ],
  run_at: "document_start"
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent += tailwindcssText
  return style
}

interface CollapsibleTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
}

const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  text,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  return (
    <div
      className="collapsible-text"
      {...props}
      onClick={() => setIsCollapsed(!isCollapsed)}>
      {isCollapsed ? text.slice(0, 50) + "..." : text}
    </div>
  )
}

export default function Sidebar() {
  const [user] = useStorage<User>("user")
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [answers, setAnswers] = useState<string[]>([])

  useEffect(() => {
    setInterval(() => {
      if (!message) {
        setMessage(window.getSelection().toString().trim())
      }
      const showShow = document.querySelector(".ext-sidebar-show")
      setIsOpen(!!showShow)
    }, 500)
  }, [])

  const handleSearch = async () => {
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
          className="fixed w-2/6 bg-white px-4 h-screen transition-all right-0 flex flex-col content-between py-8">
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
            <h1 className="text-sm">
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
            </h1>
            <div className="sidebar-search-submit-btn" onClick={handleSearch}>
              <button className="bg-blue-500 px-4 rounded-lg w-32 h-8">
                Search
              </button>
            </div>
            <div className="sidebar-answer-view">
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
        </div>
      )}
      <Tooltip />
    </>
  )
}
