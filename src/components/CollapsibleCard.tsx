import { CopyIcon } from "@radix-ui/react-icons"
import { Box, Flex } from "@radix-ui/themes"
import React, { useState } from "react"

type CardProps = {
  title: string
  content: string
} & React.HTMLAttributes<HTMLDivElement>
const CollapsibleCard: React.FC<CardProps> = ({ title, content, ...props }) => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const handleCopyClick = () => {
    navigator.clipboard.writeText(content)
  }
  const handleMouseEnter = () => {
    setIsCollapsed(false)
  }
  return (
    <Box
      className="card w-[266px] h-[111px] text-[10.5px] rounded-md shadow-md p-4 bg-white hover:border hover:border-1 hover:border-[#2C2C2C] transition-all ease-in-out duration-75 hover:h-fit"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        setIsCollapsed(true)
      }}>
      <Flex className="card-header">
        <Box className="category w-fit p-1 bg-[#E6D7FE] rounded-sm text-[8.5px]">
          {title}
        </Box>
        <Box
          className="copy ml-auto text-[#C4C4C4] cursor-pointer"
          onClick={handleCopyClick}>
          <CopyIcon />
        </Box>
      </Flex>
      <Flex className="card-content py-2">
        {isCollapsed ? content.slice(0, 100) + "..." : content}
      </Flex>
    </Box>
  )
}

export default CollapsibleCard
