import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req) {
  try {
    const { image } = await req.json()

    if (!image) {
      return Response.json(
        { name: "", card_number: "" },
        { status: 400 }
      )
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
  {
    type: "input_text",
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
    type: "input_image",
    image_base64: image.replace(/^data:image\/\w+;base64,/, ""),
  },
],
        },
      ],
    })

    const text =
  response.output?.[0]?.content?.[0]?.text || ''


let parsed = { name: '', card_number: '' }

try {
  parsed = JSON.parse(text)
} catch (e) {
  console.error('AI did not return valid JSON:', text)
}

return Response.json({
  name: parsed.name || '',
  card_number: parsed.card_number || '',
})


  } catch (err) {
    console.error(err)
    return Response.json({
      name: "",
      card_number: "",
    })
  }
}
