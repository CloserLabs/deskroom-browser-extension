import type { User } from "@supabase/supabase-js"
import radixUIText from "data-text:@radix-ui/themes/styles.css"
import tailwindcssText from "data-text:~style.css"

import { useStorage } from "@plasmohq/storage/hook"

// TODO: find why this is not working
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent += radixUIText
  style.textContent += tailwindcssText
  return style
}

function IndexPopup() {
  const [user] = useStorage<User>("user")

  return (
    <div className="px-8">
      <h2>Deskroom makes us closer to each other</h2>
      {user ? <p>Logged in as {user.email}</p> : <p>Not logged in</p>}
    </div>
  )
}

export default IndexPopup
