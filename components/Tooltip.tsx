import { ButtonIcon, RocketIcon } from "@radix-ui/react-icons"
import { IconButton } from "@radix-ui/themes"
import React, { useEffect, useState } from "react"

import { useTextSelection } from "~hooks/useTextSelection"

type TooltipProps = {
  clickHandler: () => void
} & React.HTMLAttributes<HTMLDivElement>

const Tooltip: React.FC<TooltipProps> = ({ clickHandler }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  const { text, rects } = useTextSelection()

  useEffect(() => {
    if (text && rects.length > 0) {
      const firstRect = rects[0]
      const lastRect = rects[rects.length - 1]

      const top = firstRect.top
      const left = firstRect.left

      const tooltipTop = top + window.scrollY - 50
      const tooltipLeft = left + window.scrollX - 50

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft })
    } else {
      setTooltipPosition({ top: 0, left: 0 })
    }
  }, [text, rects])

  return (
    <div
      className="tooltip fixed bg-violet-500 rounded-full p-2 shadow-lg transition-all hover:shadow-amber-100 ease-linear duration-100 hover:border hover:border-zinc-300"
      hidden={tooltipPosition.top === 0 && tooltipPosition.left === 0}
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left
      }}>
      <IconButton onClick={clickHandler}>
        <RocketIcon width={`30`} height={`30`} />
      </IconButton>
    </div>
  )
}

export default Tooltip
