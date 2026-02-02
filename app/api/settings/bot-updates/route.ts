import { NextResponse } from "next/server"
import { getBotUpdates } from "@/lib/telegram"

export async function GET() {
    try {
        const updates = await getBotUpdates()
        return NextResponse.json(updates)
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 })
    }
}
