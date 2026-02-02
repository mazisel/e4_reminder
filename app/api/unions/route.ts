import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function GET() {
    try {
        const unions = await db.union.findMany({
            orderBy: { createdAt: "desc" },
        })
        return NextResponse.json(unions)
    } catch (error) {
        console.error("GET /api/unions ERROR:", error)
        return NextResponse.json(
            { error: "Internal Server Error", details: String(error) }, // Returning details for easier debug in client too
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, telegramChatId, internalChatId } = body

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            )
        }

        const union = await db.union.create({
            data: {
                name,
                telegramChatId,
                internalChatId,
            },
        })

        return NextResponse.json(union)
    } catch (error) {
        console.error("POST /api/unions ERROR:", error)
        return NextResponse.json(
            { error: "Internal Server Error", details: String(error) },
            { status: 500 }
        )
    }
}
