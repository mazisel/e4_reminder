import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { days, unionId } = body

        if (!Array.isArray(days) || days.length === 0) {
            return NextResponse.json(
                { error: "Valid 'days' array is required" },
                { status: 400 }
            )
        }

        // Prepare data for bulk insert
        const dataToInsert = days.map((day: any) => ({
            title: day.title,
            date: new Date(day.date),
            isRecurring: day.isRecurring ?? true, // Default to recurring if not specified
            description: day.description || null,
            unionId: unionId || null, // If unionId is provided, assign to that union, else global
            reminderDaysBefore: day.reminderDaysBefore ? parseInt(day.reminderDaysBefore) : 0
        }))

        // Prisma createMany is supported in SQLite
        const result = await db.specialDay.createMany({
            data: dataToInsert
        })

        return NextResponse.json({
            success: true,
            count: result.count
        })

    } catch (error) {
        console.error("Bulk create error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
