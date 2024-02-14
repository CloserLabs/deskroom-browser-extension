export {}

// Listen for messages from content scripts or other parts of your extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // Check the condition to open the sidebar
  if (message.openSidebar) {
    // Open the sidebar
    chrome.sidebarAction.open();
  }
});


console.log("Hello from background script!")
