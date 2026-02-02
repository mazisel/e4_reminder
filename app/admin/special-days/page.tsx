"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Trash, Calendar as CalendarIcon, Repeat, Pencil } from "lucide-react"
import dayjs from "dayjs"
import "dayjs/locale/tr"

dayjs.locale("tr")

interface SpecialDay {
    id: string
    title: string
    date: string
    isRecurring: boolean
    union: { id: string; name: string } | null
}

export default function SpecialDaysPage() {
    const [specialDays, setSpecialDays] = useState<SpecialDay[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSpecialDays()
    }, [])

    const fetchSpecialDays = async () => {
        try {
            const res = await fetch("/api/special-days")
            if (res.ok) {
                const data = await res.json()
                setSpecialDays(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return

        try {
            const res = await fetch(`/api/special-days/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                // Remove from local state immediately
                setSpecialDays(prev => prev.filter(day => day.id !== id))
            } else {
                const data = await res.json()
                alert("Silme başarısız: " + (data.error || "Bilinmeyen hata"))
            }
        } catch (error) {
            console.error("Delete failed", error)
            alert("Silme işlemi sırasında bir hata oluştu.")
        }
    }

    const handleCreateTest = async () => {
        setLoading(true)
        try {
            // Create a date for 1 minute later for testing? Or just 'Today' to test the Cron logic which matches 'Today'
            // The cron logic looks for matches on the current day, so let's just create one for today.
            const today = dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]")

            const res = await fetch("/api/special-days", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test Hatırlatma - Bugüne",
                    date: today,
                    isRecurring: false,
                    unionId: "", // Global
                    description: "Otomatik oluşturulan test kaydı."
                })
            })

            if (res.ok) {
                alert("Test verisi oluşturuldu!")
                fetchSpecialDays()
            } else {
                const err = await res.json()
                alert("Hata: " + (err.error || "Bilinmeyen hata"))
            }
        } catch (error) {
            console.error(error)
            alert("İstek hatası oluştu")
        } finally {
            setLoading(false)
        }
    }

    const handleTriggerCron = async () => {
        const btn = document.getElementById("cron-btn") as HTMLButtonElement
        if (btn) btn.disabled = true

        try {
            // Call API with 120 seconds delay
            const res = await fetch("/api/cron?delay=120")
            const data = await res.json()

            if (res.ok) {
                alert(`✅ Başarılı!\n\n${data.message}\n\nSunucu 2 dakika geri sayacak ve ardından bildirimleri gönderecek. Sayfayı kapatabilirsiniz.`)
            } else {
                alert("Hata: " + (data.error || "Bilinmeyen sunucu hatası"))
            }
        } catch (error) {
            alert("İstek hatası: " + error)
        } finally {
            if (btn) btn.disabled = false
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Özel Günler</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleCreateTest} disabled={loading}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Test Verisi Ekle
                    </Button>
                    <Button
                        variant="outline"
                        id="cron-btn"
                        onClick={handleTriggerCron}
                        disabled={loading}
                    >
                        <Repeat className="mr-2 h-4 w-4" />
                        Manuel Tetikle (2dk Gecikmeli)
                    </Button>
                    <Link href="/admin/special-days/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Özel Gün
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Başlık</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Tarih</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Tekrar</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Sendika</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr><td colSpan={5} className="p-4 text-center">Yükleniyor...</td></tr>
                            ) : specialDays.length === 0 ? (
                                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Kayıtlı gün yok.</td></tr>
                            ) : (
                                specialDays.map((day) => (
                                    <tr key={day.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{day.title}</td>
                                        <td className="p-4 align-middle flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                                            {dayjs(day.date).format("D MMMM YYYY")}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {day.isRecurring && (
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                                                    <Repeat className="mr-1 h-3 w-3" />
                                                    Her Yıl
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {day.union ? (
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {day.union.name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    Genel
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/special-days/${day.id}`}>
                                                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(day.id)}>
                                                    <Trash className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
