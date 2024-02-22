import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.plasmo.com/*",
    "https://desk.channel.io/",
    "https://sell.smartstore.naver.com/*"
  ],
  world: "MAIN",
  run_at: "document_start"
}
