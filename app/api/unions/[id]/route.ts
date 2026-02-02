import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        const union = await db.union.findUnique({
            where: { id },
        })

        if (!union) {
            return NextResponse.json(
                { error: "Union not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(union)
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        const body = await req.json()
        const { name, telegramChatId, internalChatId } = body

        const union = await db.union.update({
            where: { id },
            data: {
                name,
                telegramChatId,
                internalChatId,
            },
        })

        return NextResponse.json(union)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await db.union.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
