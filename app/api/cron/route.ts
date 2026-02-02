import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { sendTelegramMessage } from "@/lib/telegram"
import dayjs from "dayjs"

export const dynamic = 'force-dynamic';

// Helper to determine if a special day matches "today" or "upcoming"
function checkMatch(specialDay: any, today: dayjs.Dayjs) {
    const dayDate = dayjs(specialDay.date)
    const currentYear = today.year()

    // 1. Check for TODAY match
    let isTodayMatch = false
    if (specialDay.isRecurring) {
        if (dayDate.date() === today.date() && dayDate.month() === today.month()) {
            isTodayMatch = true
        }
    } else {
        if (dayDate.format("YYYY-MM-DD") === today.format("YYYY-MM-DD")) {
            isTodayMatch = true
        }
    }

    if (isTodayMatch) return { match: true, type: "today" }

    // 2. Check for REMINDER match (e.g. 3 days before)
    if (specialDay.reminderDaysBefore && specialDay.reminderDaysBefore > 0) {
        // We need to check if (Today + X days) == SpecialDay
        // Or simpler: SpecialDay - Today == X days

        // For recurring, we need to construct the "current year's" occurrence of the special day
        let targetDate
        if (specialDay.isRecurring) {
            targetDate = dayjs(`${currentYear}-${dayDate.month() + 1}-${dayDate.date()}`)
            // Handle edge case if the date has passed this year? (Not needed for forward reminder check usually, 
            // but if today is Dec 30 and special day is Jan 2, we might need next year. 
            // For simplicity, let's assume same year first, or handle year diff)
            if (targetDate.isBefore(today, 'day')) {
                targetDate = targetDate.add(1, 'year')
            }
        } else {
            targetDate = dayDate
        }

        const diffDays = targetDate.diff(today, 'day')

        if (diffDays === specialDay.reminderDaysBefore) {
            return { match: true, type: "upcoming", daysLeft: diffDays }
        }
    }

    return { match: false }
}

// Logic to process notifications (separated for background execution)
async function processCronJob() {
    try {
        const today = dayjs()
        const allSpecialDays = await db.specialDay.findMany({
            include: { union: true }
        })

        const notificationsToSend: Array<{ chatId: string, message: string, unionName: string }> = []

        for (const specialDay of allSpecialDays) {
            const check = checkMatch(specialDay, today)

            if (check.match) {
                let titlePrefix = ""
                let dateInfo = ""

                if (check.type === "today") {
                    titlePrefix = "📅 *Bugün Özel Gün!*"
                    dateInfo = `Tarih: ${today.format("DD.MM.YYYY")}`
                } else if (check.type === "upcoming") {
                    titlePrefix = `⏳ *Yaklaşıyor! (${check.daysLeft} Gün Kaldı)*`
                    // For recurring, show the calculated target date, or just the day/month
                    const d = dayjs(specialDay.date)
                    dateInfo = `Tarih: ${d.format("DD MMMM")}`
                }

                const message = `${titlePrefix}\n\n**${specialDay.title}**\n${specialDay.description ? `\n_${specialDay.description}_` : ""}\n${dateInfo}`

                if (specialDay.unionId && specialDay.union) {
                    // Specific Union
                    if (specialDay.union.telegramChatId) {
                        notificationsToSend.push({
                            chatId: specialDay.union.telegramChatId,
                            message: message,
                            unionName: specialDay.union.name
                        })
                    }
                    if (specialDay.union.internalChatId) {
                        notificationsToSend.push({
                            chatId: specialDay.union.internalChatId,
                            message: `[Ekip - ${specialDay.union.name}]\n` + message,
                            unionName: specialDay.union.name
                        })
                    }
                } else {
                    // Global logic
                    const allUnions = await db.union.findMany()
                    for (const union of allUnions) {
                        if (union.telegramChatId) {
                            notificationsToSend.push({
                                chatId: union.telegramChatId,
                                message: message,
                                unionName: union.name
                            })
                        }
                        if (union.internalChatId) {
                            notificationsToSend.push({
                                chatId: union.internalChatId,
                                message: `[Ekip - ${union.name}]\n` + message,
                                unionName: union.name
                            })
                        }
                    }
                }
            }
        }

        // Send Messages
        const results = []
        for (const notif of notificationsToSend) {
            const success = await sendTelegramMessage(notif.chatId, notif.message)
            results.push({ union: notif.unionName, success })
        }

        console.log(`Cron job finished. Processed: ${notificationsToSend.length}`)
        return { processed: notificationsToSend.length, results }

    } catch (error) {
        console.error("Cron logic error", error)
        return { error: String(error) }
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const delaySeconds = parseInt(searchParams.get("delay") || "0")

        if (delaySeconds > 0) {
            console.log(`Cron job scheduled with ${delaySeconds}s delay...`)

            // Execute in background without awaiting
            setTimeout(async () => {
                console.log("Executing delayed cron job...")
                await processCronJob()
            }, delaySeconds * 1000)

            return NextResponse.json({
                success: true,
                message: `Cron job ${delaySeconds} saniye sonra çalışacak şekilde planlandı.`,
                isBackground: true
            })
        }

        // Immediate execution
        const result = await processCronJob()
        return NextResponse.json({
            success: true,
            ...result
        })

    } catch (error) {
        console.error("Cron failed", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
