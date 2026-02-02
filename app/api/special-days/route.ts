import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function GET() {
    try {
        const specialDays = await db.specialDay.findMany({
            include: {
                union: true,
            },
            orderBy: { date: "asc" },
        })
        return NextResponse.json(specialDays)
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { title, date, isRecurring, unionId, description, reminderDaysBefore } = body

        if (!title || !date) {
            return NextResponse.json(
                { error: "Title and Date are required" },
                { status: 400 }
            )
        }

        const specialDay = await db.specialDay.create({
            data: {
                title,
                date: new Date(date),
                isRecurring: isRecurring || false,
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
