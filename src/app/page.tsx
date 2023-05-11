"use client"

import { useState, useRef } from "react";
import useMsgStore from "@/store/messages";

function Home() {
  const [loading, setLoading] = useState(false)
  const [message, setMsg] = useState("")
  const [ans, setAns] = useState("")
  const scrollRef = useRef<HTMLParagraphElement>(null)

  const messages = useMsgStore(s => s.messages)
  const addMsg = useMsgStore(s => s.addMsg)

  async function get() {
    if (!message) return;

    setMsg("")
    setLoading(true)
    addMsg(message, "question")

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    const reader = response.body?.getReader()
    let buffer = ''

    reader?.read().then(function processResult(result: any): any {
      if (result.done) {
        addMsg(buffer, "answer")
        setLoading(false)
        setAns("")
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
      <div className="h-full p-4 overflow-y-auto border">
        {
          messages.map(m => (
            <pre
              key={m.id}
              className={`break-words whitespace-pre-line text-gray-700 ${m.type === "answer" ? "pb-6 border-b" : "pt-4"}`}
            >
              <span className="text-lg font-medium text-black">{m.type === "answer" ? "Ans: " : "Que: "}</span>
              {m.content}
            </pre>
          ))
        }

        {
          (ans || loading) &&
          <pre className="break-words whitespace-pre-line text-gray-700">
            <span className="text-lg font-medium text-black">Ans: </span>
            {loading && !ans && "loading..."}{ans}
          </pre>
        }

        <p ref={scrollRef}></p>
      </div>

      <div className="flex items-center gap-4">
        <textarea
          value={message}
          onChange={e => setMsg(e.target.value)}
          className="w-full max-h-28 p-2 border focus-within:outline-none disabled:opacity-60"
          disabled={loading}
          onKeyDown={e => {
            if (e.code === "Enter") {
              get()
            }
          }}
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