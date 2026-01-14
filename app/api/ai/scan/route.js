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

From the image, extract ONLY:
- card name
- card number (exactly as printed, e.g. 25/102)

If you are unsure, return an empty string.

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
