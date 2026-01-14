import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req) {
  try {
    const { image } = await req.json()

    if (!image) {
      return Response.json({ name: "", card_number: "" })
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, "")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
You are scanning a Pokémon trading card.

Identify:
- Pokémon name
- Card number as printed (e.g. 25/102)

Return ONLY valid JSON:
{
  "name": "",
  "card_number": ""
}
              `,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    })

    const text = completion.choices[0].message.content

    let parsed = { name: "", card_number: "" }
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      console.error("Invalid JSON from AI:", text)
    }

    return Response.json({
      name: parsed.name || "",
      card_number: parsed.card_number || "",
    })
  } catch (err) {
    console.error(err)
    return Response.json({ name: "", card_number: "" })
  }
}
