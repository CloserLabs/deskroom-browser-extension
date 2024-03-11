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
import SidebarContent from "./SidebarContent"
import Skeleton from "./Sketleton"

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
        <IconButton
          onClick={() => {
            setSidebarOpen(false)
          }}
          className="hover:bg-gray-200 rounded-sm transition-all ease-in-out duration-100 ml-auto">
          <Cross1Icon width={`14`} height={`15`} />
        </IconButton>
      </Flex>
      <Separator size={`4`} style={{ backgroundColor: "#eee" }} />
      <SidebarContent
        hasLoggedIn={!!auth}
        message={message}
        setMessage={setMessage}
        loading={loading}
        handleSearch={handleSearch}
        answers={answers}
      />
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
              console.log("새 답변")
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
