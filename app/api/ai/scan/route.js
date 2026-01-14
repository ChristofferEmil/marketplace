export async function GET() {
  return Response.json({ ok: true })
}

export async function POST(req) {
  const { image } = await req.json()

  return Response.json({
    name: "Pikachu",
    card_number: "25/102",
  })
}
