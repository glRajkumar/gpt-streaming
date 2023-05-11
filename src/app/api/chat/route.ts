import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const payload = {
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "user",
          content: message
        }
      ],
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPEN_AI_API_KEY ?? ""}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    }).catch(e => {
      console.log(e)
    })

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    // let counter = 0;

    const stream = new ReadableStream({
      async start(controller) {
        function onParse(event: ParsedEvent | ReconnectInterval) {
          if (event.type === "event") {
            const data = event.data;
            // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta?.content || "";
              // if (counter < 2 && (text.match(/\n/) || []).length) {
              //   // this is a prefix character (i.e., "\n\n"), do nothing
              //   return;
              // }
              const queue = encoder.encode(text);
              controller.enqueue(queue);
              // counter++;
            } catch (e) {
              controller.error(e);
            }
          }
        }

        const parser = createParser(onParse)

        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk))
        }
      },
    })

    return new Response(stream)

  } catch (error) {
    console.log(error)
  }
}