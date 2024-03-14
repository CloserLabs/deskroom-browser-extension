import { Box, Button, Flex, TextArea } from "@radix-ui/themes"
import { useEffect } from "react"

import { useMixpanel } from "~contexts/MixpanelContext"
import type { OrganizationStorage } from "~options"

type NewKnowledgeBaseFormProps = {
  message: string
  setMessage: (message: string) => void
  newAnswer: string
  setNewAnswer: (newAnswer: string) => void
  newAnswerLoading: boolean
  setNewAnswerLoading: (newAnswerLoading: boolean) => void
  setMode: (mode: "search" | "new") => void
  orgs: OrganizationStorage | null
}

const NewKnowledgeBaseForm: React.FC<NewKnowledgeBaseFormProps> = ({
  message,
  setMessage,
  newAnswer,
  setNewAnswer,
  newAnswerLoading,
  setNewAnswerLoading,
  setMode,
  orgs
}) => {
  const mixpanel = useMixpanel()
  useEffect(() => {
    mixpanel.track("Knowledge Item Add Page Viewed", {})
  }, [])
  return (
    <Box className="container px-2 py-4">
      <Flex width={`100%`} direction={`column`}>
        <Flex
          className="bg-[#2C2C2C] w-full rounded px-2 py-4 text-white"
          direction="column">
          <TextArea
            className="w-full bg-[#2C2C2C] text-[10.5px] text-wrap break-all selection:bg-slate-400"
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
                  mixpanel.track("Knowledge Item Added", {
                    question: message,
                    answer: newAnswer
                  })
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
  )
}
export default NewKnowledgeBaseForm