"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft } from "lucide-react"

export default function EditUnionPage() {
    const router = useRouter()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        telegramChatId: "",
        internalChatId: "",
    })

    useEffect(() => {
        const fetchUnion = async () => {
            try {
                const res = await fetch(`/api/unions/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setFormData({
                        name: data.name,
                        telegramChatId: data.telegramChatId || "",
                        internalChatId: data.internalChatId || "",
                    })
                } else {
                    alert("Sendika bulunamadı")
                    router.push("/admin/unions")
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchUnion()
    }, [id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch(`/api/unions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push("/admin/unions")
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

    if (loading) {
        return <div className="p-8 text-center">Yükleniyor...</div>
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/admin/unions">
                    <Button variant="ghost" size="sm">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Sendika Düzenle</h1>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            Sendika Adı
                        </label>
                        <Input
                            required
                            placeholder="Örn: X Sendikası"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            Telegram Grup ID (Opsiyonel)
                        </label>
                        <Input
                            placeholder="Örn: -100123456789"
                            value={formData.telegramChatId}
                            onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Müşteri ile ortak olan grubun ID'si.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            Bizim Ekip Grubu ID (Opsiyonel)
                        </label>
                        <Input
                            placeholder="Örn: -100987654321"
                            value={formData.internalChatId}
                            onChange={(e) => setFormData({ ...formData, internalChatId: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Sadece ajans çalışanlarının olduğu grubun ID'si (Eğer müşteri grubundan farklıysa).
                        </p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Kaydediliyor..." : "Güncelle"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
