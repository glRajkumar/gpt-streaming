import { create } from 'zustand';
import { nanoid } from 'nanoid';

type typeVal = "question" | "answer"

interface msg {
  messages: {
    id: string
    type: typeVal
    content: string
  }[]
  addMsg: (content: string, type: typeVal) => void
}

const useMsgStore = create<msg>((set) => ({
  messages: [],
  addMsg: (content, type) => set(prev => ({
    messages: [...prev.messages, {
      id: nanoid(10),
      type,
      content,
    }]
  })),
}))

export default useMsgStore