// FORCE DEPLOY CHANGE

export async function POST(req) {
  try {
    const body = await req.json()

    return Response.json({
      received: true,
      hasImage: !!body.image,
      imageType: typeof body.image,
      imageLength: body.image ? body.image.length : 0,
    })
  } catch (e) {
    return Response.json({
      received: false,
      error: e.message,
    })
  }
}
