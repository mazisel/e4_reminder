"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft } from "lucide-react"

interface Union {
    id: string
    name: string
}

export default function NewSpecialDayPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [unions, setUnions] = useState<Union[]>([])
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        unionId: "", // Empty string means "Global"
        isRecurring: true,
        reminderDaysBefore: 0,
        description: ""
    })

    useEffect(() => {
        // Fetch unions for the dropdown
        fetch("/api/unions")
            .then(res => res.json())
            .then(data => setUnions(data))
            .catch(err => console.error(err))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/special-days", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    unionId: formData.unionId === "" ? null : formData.unionId
                }),
            })

            if (res.ok) {
                router.push("/admin/special-days")
                router.refresh()
            } else {
                alert("Bir hata oluştu")
            }
        } catch (error) {
            console.error(error)
            alert("Bir hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/admin/special-days">
                    <Button variant="ghost" size="sm">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Yeni Özel Gün Ekle</h1>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Başlık</label>
                        <Input
                            required
                            placeholder="Örn: 23 Nisan"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tarih</label>
                            <Input
                                required
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2 pt-8">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                                />
                                <span className="text-sm">Her yıl tekrar eder</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Erken Hatırlatma (Opsiyonel)</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.reminderDaysBefore}
                            onChange={(e) => setFormData({ ...formData, reminderDaysBefore: parseInt(e.target.value) })}
                        >
                            <option value={0}>Sadece O Gün Hatırlat</option>
                            <option value={1}>1 Gün Önce Haber Ver</option>
                            <option value={2}>2 Gün Önce Haber Ver</option>
                            <option value={3}>3 Gün Önce Haber Ver</option>
                            <option value={7}>1 Hafta Önce Haber Ver</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                            Seçerseniz, asıl güne ek olarak belirtilen gün kadar önce de bildirim alırsınız.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sendika (Opsiyonel)</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.unionId}
                            onChange={(e) => setFormData({ ...formData, unionId: e.target.value })}
                        >
                            <option value="">Genel (Tüm Sendikalar İçin)</option>
                            {unions.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">
                            Eğer bir sendika seçerseniz, sadece o sendikanın grubuna mesaj gider. Seçmezseniz tüm sendikalara gider (Örn: Milli Bayramlar).
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ekstra Not / Mesaj Şablonu</label>
                        <Input
                            placeholder="Örn: Kutlama mesajı içeriği..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
