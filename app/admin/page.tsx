import { db } from "@/lib/prisma"

export default async function AdminPage() {
    // Fetch counts from DB
    const unionCount = await db.union.count()

    // Count upcoming special days (next 7 days)
    // Note: Since recurrence logic is complex in SQL/Prisma, we'll fetch basic count for now
    // or fetch all and filter in JS if performance allows (for small dataset).
    // For simple stats, let's just show total special days for now.
    const specialDayCount = await db.specialDay.count()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Stats cards */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Toplam Sendika</h3>
                    <div className="mt-2 text-3xl font-bold">{unionCount}</div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Kayıtlı Özel Günler</h3>
                    <div className="mt-2 text-3xl font-bold">{specialDayCount}</div>
                </div>
            </div>
        </div>
    )
}
