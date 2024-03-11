import { Theme } from "@radix-ui/themes"
import type { User } from "@supabase/supabase-js"
import radixUIText from "data-text:@radix-ui/themes/styles.css"
import tailwindcssText from "data-text:~style.css"
import mixpanel from "mixpanel-browser"
import type { PlasmoCSConfig } from "plasmo"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Sidebar from "~components/Sidebar"
import Tooltip from "~components/Tooltip"
import { useTextSelection } from "~hooks/useTextSelection"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.plasmo.com/*",
    "https://desk.channel.io/*",
    "https://sell.smartstore.naver.com/*",
    "https://sell.smartstore.naver.com/#/home/about",
    "https://sell.smartstore.naver.com/#/talktalk/chat",
    "https://talk.sell.smartstore.naver.com/*"
  ],
  run_at: "document_start",
  all_frames: true
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent += radixUIText
  style.textContent += tailwindcssText
  return style
}

export default function Content() {
  const [isOpen, setIsOpen] = useState(false)
  const [user] = useStorage<User>("user")
  const [question, setQuestion] = useState("")
  const { text, rects } = useTextSelection()

  mixpanel.init(process.env.PLASMO_PUBLIC_MIXPANEL_TOKEN, {
    debug: process.env.PLASMO_TAG !== "prod",
    track_pageview: true,
    persistence: "localStorage"
  })

  const handleTooltipClick = () => {
    setIsOpen(true)
    if (text && rects.length > 0) {
      setQuestion(text)
    }
    mixpanel.track("Answer Panel Triggered") // TODO: add question in select
  }
  return (
    <Theme>
      <Sidebar
        isOpen={isOpen}
        auth={user}
        setSidebarOpen={setIsOpen}
        question={question}
        setMessage={setQuestion}
      />
      <Tooltip clickHandler={handleTooltipClick} />
    </Theme>
  )
}
