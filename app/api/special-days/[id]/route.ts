import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        const specialDay = await db.specialDay.findUnique({
            where: { id },
            include: { union: true }
        })

        if (!specialDay) {
            return NextResponse.json(
                { error: "Special Day not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(specialDay)
    } catch (error) {
        console.error(error)
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
        const { title, date, isRecurring, unionId, description, reminderDaysBefore } = body

        const specialDay = await db.specialDay.update({
            where: { id },
            data: {
                title,
                date: new Date(date),
                isRecurring,
                unionId: unionId || null,
                description,
                reminderDaysBefore: reminderDaysBefore ? parseInt(reminderDaysBefore) : 0
            },
        })

        return NextResponse.json(specialDay)
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
        await db.specialDay.delete({
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
