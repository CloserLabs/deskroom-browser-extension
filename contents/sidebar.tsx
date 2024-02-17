import iconBase64 from "data-base64:~assets/icon.png"
import cssText from "data-text:~/contents/sidebar.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

// Inject to the webpage itself
import "./sidebar-base.css"
import tailwindcssText from "data-text:~style.css"

export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  style.textContent += tailwindcssText
  return style
}

export const getShadowHostId = () => "ext-sidebar"

// TODO: rename
const GoogleSidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selection, setSetlection] = useState("")

  useEffect(() => {
    const handleBodyClassChange = () => {
      const bodyClassList = document.body.classList;
      if (bodyClassList.contains('ext-sidebar-show')) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Initial check
    handleBodyClassChange();

    // Listen for changes to body classList
    document.body.addEventListener('transitionend', handleBodyClassChange);

    const selectedText = window.getSelection().toString().trim();
    console.log({window})
    console.log({selectedText});
    
    setSetlection(selection)


    // Cleanup
    return () => {
      document.body.removeEventListener('transitionend', handleBodyClassChange);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("ext-sidebar-show", isOpen)
  }, [isOpen])


  return (
    <div id="sidebar" className={isOpen ? "open" : "closed"}>
      <div className="sidebar-title font-bold text-3xl">
        Closer
      </div>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "🟡 Close" : "🟣 Open"}
      </button>
      <img src={iconBase64} alt="Extension Icon" width={128} height={128} />
      <div className="">
        <span>Selected Text: </span>
        <div>{selection}</div>
      </div>
    </div>
  )
}

export default GoogleSidebar
