import React, { useEffect, useState } from "react"

import { useTextSelection } from "~hooks/useTextSelection"

const FloatingButton: React.FC<
  {
    tailDirection: "left" | "right"
  } & React.HTMLAttributes<HTMLButtonElement>
> = ({ tailDirection, ...props }) => {
  return (
    <button
      className="floating-button"
      style={{
        bottom: "20px",
        right: "20px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
      {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        {tailDirection === "left" ? (
          <>
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="16" y1="12" x2="12" y2="16" />
          </>
        ) : (
          <>
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="12" x2="12" y2="16" />
          </>
        )}
      </svg>
    </button>
  )
}
type TooltipProps = {
  clickHandler: () => void
} & React.HTMLAttributes<HTMLDivElement>

const Tooltip: React.FC<TooltipProps> = ({ clickHandler }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [floatingButtonDirection, setFloatingButtonDirection] = useState<
    "left" | "right"
  >("right")

  const { text, rects } = useTextSelection()

  useEffect(() => {
    if (text && rects.length > 0) {
      const firstRect = rects[0]
      const lastRect = rects[rects.length - 1]

      const top = firstRect.top
      const left = firstRect.left

      const right = lastRect.right
      const bottom = lastRect.bottom

      const tooltipTop = top + window.scrollY - 50
      const tooltipLeft = left + window.scrollX - 50

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft })

      if (right > window.innerWidth / 2) {
        setFloatingButtonDirection("left")
      } else {
        setFloatingButtonDirection("right")
      }
    } else {
      setTooltipPosition({ top: 0, left: 0 })
    }
  }, [text, rects])

  return (
    <div
      className="tooltip fixed"
      hidden={tooltipPosition.top === 0 && tooltipPosition.left === 0}
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left
      }}>
      <FloatingButton
        tailDirection={floatingButtonDirection}
        onClick={clickHandler}
      />
    </div>
  )
}

export default Tooltip
