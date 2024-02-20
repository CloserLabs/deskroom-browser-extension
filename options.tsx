import type { User } from "@supabase/supabase-js"
import tailwindcssText from "data-text:~style.css"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { supabase } from "~core/supabase"

// TODO: find why this is not working
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent += tailwindcssText
  return style
}

const buttonStyle = {
  backgroundColor: "whitesmoke",
  border: "unset",
  padding: "8px 16px",
  margin: "8px 0"
}

function IndexOptions() {
  const [user, setUser] = useStorage<User>({
    key: "user",
    instance: new Storage({
      area: "session"
    })
  })

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    async function init() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        return
      }
      if (!!data.session) {
        setUser(data.session.user)
        sendToBackground({
          name: "init-session",
          body: {
            refresh_token: data.session.refresh_token,
            access_token: data.session.access_token
          }
        })
      }
    }

    init()
  }, [])

  const handleEmailLogin = async (
    type: "LOGIN" | "SIGNUP",
    username: string,
    password: string
  ) => {
    try {
      const {
        error,
        data: { user }
      } =
        type === "LOGIN"
          ? await supabase.auth.signInWithPassword({
              email: username,
              password
            })
          : await supabase.auth.signUp({ email: username, password })

      if (error) {
        alert("Error with auth: " + error.message)
      } else if (!user) {
        alert("Signup successful, confirmation mail should be sent soon!")
      } else {
        setUser(user)
        console.log({ user })
      }
    } catch (error) {
      console.log("error", error)
      alert(error.error_description || error)
    }
  }

  return (
    <main
      className="flex justify-center items-center w-full top-240 relative"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        top: 240,
        position: "relative",
        flexDirection: "column",
        fontSize: 16,
        fontFamily:
          "ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji"
      }}>
      <h1 className="closer-options-title">Closer</h1>
      <div
        className="bg-white p-4 rounded-lg shadow-lg flex flex-col gap-4.2 content-between w-96"
        style={{
          display: "flex",
          flexDirection: "column",
          width: 240,
          justifyContent: "space-between",
          gap: 4.2
        }}>
        {user && (
          <>
            <h3>
              {user.email} - {user.id}
            </h3>
            <button
              style={buttonStyle}
              onClick={() => {
                supabase.auth.signOut()
                setUser(null)
              }}>
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <label>Email</label>
            <input
              type="text"
              placeholder="Your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              style={buttonStyle}
              onClick={(e) => {
                handleEmailLogin("SIGNUP", username, password)
              }}>
              Sign up
            </button>
            <button
              style={buttonStyle}
              onClick={(e) => {
                handleEmailLogin("LOGIN", username, password)
              }}>
              Login
            </button>
          </>
        )}
      </div>
    </main>
  )
}

export default IndexOptions