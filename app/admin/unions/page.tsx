"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Trash, Pencil } from "lucide-react"

interface Union {
    id: string
    name: string
    telegramChatId: string | null
    createdAt: string
}

export default function UnionsPage() {
    const [unions, setUnions] = useState<Union[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUnions()
    }, [])

    const fetchUnions = async () => {
        try {
            const res = await fetch("/api/unions")
            if (res.ok) {
                const data = await res.json()
                setUnions(data)
            }
        } catch (error) {
            console.error("Failed to fetch unions", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu sendikayı silmek istediğinize emin misiniz?")) return

        try {
            const res = await fetch(`/api/unions/${id}`, { method: "DELETE" })
            if (res.ok) {
                setUnions(unions.filter((u) => u.id !== id))
            }
        } catch (error) {
            console.error("Failed to delete union", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Sendikalar</h1>
                <Link href="/admin/unions/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Sendika
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Ad</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Telegram Grup ID</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground sm:text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center">Yükleniyor...</td>
                                </tr>
                            ) : unions.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">Kayıtlı sendika yok.</td>
                                </tr>
                            ) : (
                                unions.map((union) => (
                                    <tr key={union.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{union.name}</td>
                                        <td className="p-4 align-middle text-gray-500">{union.telegramChatId || "-"}</td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/unions/${union.id}`}>
                                                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(union.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
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
