import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*", "https://desk.channel.io/"],
  world: "MAIN",
  run_at: "document_start"
}

document.addEventListener("mouseup", function (event) {
  const selectedText = window.getSelection().toString().trim()
  const selectionRect = window
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect()
  if (selectedText !== "") {
    var button = document.createElement("button")
    button.innerHTML = "Get Closer"
    button.id = "closer-ext-btn"
    button.style.position = "absolute"
    button.style.top = selectionRect.bottom + window.screenY + "px"
    button.style.left = selectionRect.left + window.screenX + "px"
    button.onclick = function () {
      document.body.classList.toggle("ext-sidebar-show", true)
      window.mainMessage = selectedText
    }
    document.body.appendChild(button)
  }
})
