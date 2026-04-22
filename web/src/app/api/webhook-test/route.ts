
export async function POST(req: Request) {
    console.log("Webhook received")
    return new Response("ok", { status: 200 })
  }