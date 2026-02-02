"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft } from "lucide-react"

export default function NewUnionPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        telegramChatId: "",
        internalChatId: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/unions", {
                method: "POST",
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

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/admin/unions">
                    <Button variant="ghost" size="sm">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Yeni Sendika Ekle</h1>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                            {loading ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
