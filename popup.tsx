import { useState } from "react"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div
      style={{
        padding: 16,
        borderRadius: "5px"
      }}>
      <h2>
        Closer makes us closer to each other
      </h2>
      <div>
        <p>https://closer.so</p>
      </div>
    </div>
  )
}

export default IndexPopup
