"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import dayjs from "dayjs"

interface Union {
    id: string
    name: string
}

interface ImportedDay {
    title: string
    date: string // ISO string or relevant format
    description?: string
    isRecurring?: boolean
    reminderDaysBefore?: number
    isInternal?: boolean
}

export default function ImportPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<ImportedDay[]>([])
    const [unions, setUnions] = useState<Union[]>([])
    const [selectedUnionId, setSelectedUnionId] = useState<string>("")
    const [isInternal, setIsInternal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Fetch unions for selection
        fetch("/api/unions")
            .then(res => res.json())
            .then(data => setUnions(data))
            .catch(err => console.error("Unions fetch failed", err))
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            parseExcel(selectedFile)
        }
    }

    const parseExcel = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: "binary" })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(sheet) as any[]

                // Map excel columns to our format
                // Expected columns: Baslik (Title), Tarih (Date), Aciklama (Description), Tekrar (Recurring)
                const mappedData: ImportedDay[] = jsonData.map(row => {
                    // Try to parse date. Excel dates can be tricky.
                    // If it's a number (Excel serial date), convert it.
                    let dateStr = row["Tarih"] || row["Date"]

                    if (typeof dateStr === 'number') {
                        // Excel date to JS date
                        const date = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
                        dateStr = date.toISOString()
                    }

                    return {
                        title: row["Baslik"] || row["Title"] || "Başlıksız",
                        date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
                        description: row["Aciklama"] || row["Description"] || "",
                        isRecurring: (row["Tekrar"] === "Evet" || row["Tekrar"] === true || row["Recurring"] === true) ? true : true, // Default true
                        reminderDaysBefore: row["ErkenHatirlatma"] || 0,
                        isInternal: undefined // Will be set during submission or can be read from excel too
                    }
                })

                setPreviewData(mappedData)
                setError(null)
            } catch (err) {
                console.error("Excel parse error", err)
                setError("Dosya okunamadı. Lütfen geçerli bir Excel dosyası yükleyin.")
            }
        }
        reader.readAsBinaryString(file)
    }

    const handleImport = async () => {
        if (previewData.length === 0) return
        if (!confirm(`${previewData.length} adet kaydı ${selectedUnionId ? 'seçili sendikaya' : 'GENEL olarak'} aktarmak istiyor musunuz?`)) return

        setLoading(true)
        try {
            const res = await fetch("/api/special-days/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    days: previewData.map(d => ({ ...d, isInternal })), // Apply toggle to all items
                    unionId: selectedUnionId || null
                })
            })

            if (res.ok) {
                alert("✅ Başarıyla aktarıldı!")
                router.push("/admin/special-days")
            } else {
                const err = await res.json()
                alert("Hata: " + (err.error || "Bilinmeyen hata"))
            }
        } catch (error) {
            console.error(error)
            alert("Sunucu hatası")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/special-days">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Excel ile Toplu Yükleme</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Sol: Yükleme ve Ayarlar */}
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <h2 className="font-semibold mb-4">1. Dosya Seçimi</h2>
                        <Input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Örnek Sütunlar: Baslik, Tarih, Aciklama
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <h2 className="font-semibold mb-4">2. Hedef Sendika</h2>
                        <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={selectedUnionId}
                            onChange={(e) => setSelectedUnionId(e.target.value)}
                        >
                            <option value="">-- Genel (Tüm Sendikalar) --</option>
                            {unions.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-2">
                            Seçim yapmazsanız kayıtlar "Genel" olarak işaretlenir.
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <h2 className="font-semibold mb-4">3. Görünürlük Ayarı</h2>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isInternal"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={isInternal}
                                onChange={(e) => setIsInternal(e.target.checked)}
                            />
                            <label htmlFor="isInternal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Sadece Takım Grubuna Gönder (Müşteriye Gitmesin)
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 ml-6">
                            Bu seçenek işaretlenirse, bildirimler sadece iç ekibe (Internal Group) gider, müşterinin Telegram grubuna gönderilmez.
                        </p>
                    </div>

                    <Button
                        onClick={handleImport}
                        disabled={loading || previewData.length === 0}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? "Yükleniyor..." : "İçeri Aktar"}
                        <Save className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                {/* Sağ: Önizleme */}
                <div className="border rounded-lg bg-white shadow-sm overflow-hidden flex flex-col h-[500px]">
                    <div className="p-3 border-b bg-gray-50 font-medium flex justify-between items-center">
                        <span>Önizleme ({previewData.length} Kayıt)</span>
                        {error && <span className="text-red-500 text-xs flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{error}</span>}
                    </div>
                    <div className="flex-1 overflow-auto p-0">
                        {previewData.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Başlık</th>
                                        <th className="px-4 py-3">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, idx) => (
                                        <tr key={idx} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{row.title}</td>
                                            <td className="px-4 py-2 text-gray-500">
                                                {dayjs(row.date).isValid() ? dayjs(row.date).format("DD.MM.YYYY") : <span className="text-red-500">Geçersiz Tarih</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                Dosya yüklenmedi veya veri yok.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
