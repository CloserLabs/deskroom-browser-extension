import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*"]
}

document.addEventListener("mouseup", function(event) {
    const selectedText = window.getSelection().toString().trim();
    const selectionRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    if (selectedText !== "") {
      console.log({selectedText});
      var button = document.createElement("button");
      button.innerHTML = "Show Info";
      button.id = "closer-ext-btn"
      button.style.position = "absolute";
      button.style.top = (selectionRect.bottom + window.pageYOffset) + "px";
      button.style.left = (selectionRect.left + window.pageXOffset) + "px";
      button.onclick = function() {
          chrome.runtime.sendMessage({ action: "showInfo", text: selectedText });
      };
      document.body.appendChild(button);
    }
    else {
    const existingCloserButton = document.querySelector('closer-ext-btn')
    existingCloserButton.parentNode.removeChild(existingCloserButton)
  }
});

document.addEventListener('mousedown', function(event) {
    let selection = window.getSelection().toString().trim();
    if (selection === '') {
      const existingCloserButton = document.querySelector('closer-ext-btn')
      existingCloserButton.parentNode.removeChild(existingCloserButton)
    }
});
