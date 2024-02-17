import tailwindcssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*"],
  world: "MAIN"
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent += tailwindcssText
  return style
}

export default function Sidebar() {
  const [message, setMessage] = useState("")
  useEffect(() => {
    setInterval(() => {
      setMessage(window.mainMessage)
    }, 1000)
  }, [])
  return (
    <>
      {message && (
        <div
          id="sidebar"
          className="fixed w-36 bg-white px-4 h-screen transition-all right-0">
          <div className="sidebar-title text-3xl font-bold">Closer</div>
          <h1>{`Message: ${message}`}</h1>
        </div>
      )}
    </>
  )
}
