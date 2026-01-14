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

Your task:
- Identify the Pokémon name
- Identify the card number as printed on the card (e.g. 25/102)

Rules:
- If the name is visible or highly likely, return it.
- If the number is partially visible, make a best guess.
- Only return empty strings if the card cannot be identified at all.

Return ONLY valid JSON in this format:
{
  "name": "",
  "card_number": ""
}
              `,
            },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    })

    const text = response.output_text
    const parsed = JSON.parse(text)

    return Response.json({
      name: parsed.name || "",
      card_number: parsed.card_number || "",
    })
  } catch (err) {
    console.error(err)
    return Response.json({
      name: "",
      card_number: "",
    })
  }
}
