"use client"

import { useState, useRef } from "react";

function Home() {
  const [loading, setLoading] = useState(false)
  const [message, setMsg] = useState("")
  const [ans, setAns] = useState("")
  const scrollRef = useRef<HTMLParagraphElement>(null)

  async function get() {
    setMsg("")
    setLoading(true)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    const reader = response.body?.getReader()
    let buffer = ''

    reader?.read().then(function processResult(result: any): any {
      if (result.done) {
        setLoading(false)
        return;
      }

      buffer += new TextDecoder().decode(result.value)
      setAns(buffer)
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })

      return reader.read().then(processResult)
    })
  }

  return (
    <div className="p-8 h-screen grid grid-rows-[1fr_auto] gap-4 max-w-5xl mx-auto">
      <div className="h-full p-2 overflow-y-auto border">
        <pre className="break-words prose whitespace-pre-line">
          {ans}
        </pre>

        <p ref={scrollRef}></p>
      </div>

      <div className="flex items-center gap-4">
        <textarea
          value={message}
          onChange={e => setMsg(e.target.value)}
          className="w-full max-h-20 p-2 border focus-within:outline-none disabled:opacity-60"
          disabled={loading}
        ></textarea>

        <button
          onClick={get}
          className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-900 disabled:opacity-60"
          disabled={loading}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default Home