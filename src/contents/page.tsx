import { Theme } from "@radix-ui/themes";
import type { User } from "@supabase/supabase-js";
import radixUIText from "data-text:@radix-ui/themes/styles.css";
import tailwindcssText from "data-text:~style.css";
import type { PlasmoCSConfig } from "plasmo";
import { useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import Sidebar from "~components/Sidebar";
import Tooltip from "~components/Tooltip";
import { MixpanelProvider, useMixpanel } from "~contexts/MixpanelContext";
import { useTextSelection } from "~hooks/useTextSelection";

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.plasmo.com/*",
    "https://desk.channel.io/*",
    "https://sell.smartstore.naver.com/*",
    "https://sell.smartstore.naver.com/#/home/about",
    "https://sell.smartstore.naver.com/#/talktalk/chat",
    "https://talk.sell.smartstore.naver.com/*",
    "https://mail.google.com/*",
    "https://www.thecloudgate.io/dashboard/*",
    "https://sbadmin01.sabangnet.co.kr/*",
    "https://artisit.idus.com/message/*",
    "https://admin.moji.cool/*",
    "https://mail.daum.net/*",
    "https://appstoreconnect.apple.com/apps/*",
    "https://play.google.com/store/apps/*",
    "https://dcamp.kr/admin/content/*",
    "https://business.kakao.com/dashboard/*",
    "https://center-pf.kakao.com/*",
    "https://workspace.gitple.io/*",
    "https://dcamp.kr/*",
    "https://play.google.com/*",
    "https://www.thecloudgate.io/*",
    "https://admin.dcamp.kr/*",
    "https://*.notion.site/*",
  ],
  run_at: "document_start",
  all_frames: true,
};

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent += radixUIText;
  style.textContent += tailwindcssText;
  return style;
};

export default function Content() {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useStorage<User>("user");
  const [question, setQuestion] = useState("");
  const { text, rects } = useTextSelection();

  const mixpanel = useMixpanel();

  const handleTooltipClick = () => {
    setIsOpen(true);
    if (text && rects.length > 0) {
      setQuestion(text);
    }
    mixpanel.track("Answer Panel Triggered"); // TODO: add question in select
  };

  return (
    <MixpanelProvider
      token={process.env.PLASMO_PUBLIC_MIXPANEL_TOKEN}
      config={{
        debug: process.env.NODE_ENV !== "production",
        track_pageview: true,
        persistence: "localStorage",
      }}
      name={`deskroom-${process.env.NODE_ENV}`}
    >
      <Theme>
        <Sidebar
          isOpen={isOpen}
          auth={user}
          setSidebarOpen={setIsOpen}
          question={question}
          setMessage={setQuestion}
        />
        <Tooltip clickHandler={handleTooltipClick} />
      </Theme>
    </MixpanelProvider>
  );
}
