import React, { useEffect, useState } from "react"

const FloatingButton = () => {
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
      }}>
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
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    </button>
  )
}

const Tooltip = () => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setTooltipPosition({ top: rect.top, left: rect.right })
      } else {
        setTooltipPosition({ top: 0, left: 0 })
      }
    }

    document.addEventListener("selectionchange", handleSelection)

    return () => {
      document.removeEventListener("selectionchange", handleSelection)
    }
  }, [])

  return (
    <div
      className="tooltip fixed"
      hidden={tooltipPosition.top === 0 && tooltipPosition.left === 0}
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left
      }}>
      <FloatingButton />
    </div>
  )
}

export default Tooltip
