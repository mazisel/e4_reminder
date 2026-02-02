"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
    const [updates, setUpdates] = useState<any[]>([])
    const [botInfo, setBotInfo] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const checkUpdates = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/settings/bot-updates")
            if (res.ok) {
                const data = await res.json()
                setUpdates(data.updates || [])
                setBotInfo(data.botInfo)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Ayarlar & Bot Kurulumu</h1>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Grup ID Bulucu</h2>
                <p className="mb-4 text-sm text-gray-500">
                    Botu bir gruba ekledikten sonra, buradan "Güncellemeleri Kontrol Et" butonuna basarak o grubun ID'sini öğrenebilirsiniz.
                    Not: Botun gruba mesaj atması veya eklenmesi gereklidir.
                </p>

                {botInfo && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-100 flex items-center justify-between">
                        <span>
                            Bağlı Bot: <strong>@{botInfo.username}</strong> ({botInfo.first_name})
                        </span>
                        <span className="text-xs bg-white px-2 py-1 rounded border">ID: {botInfo.id}</span>
                    </div>
                )}

                <Button onClick={checkUpdates} disabled={loading}>
                    {loading ? "Kontrol Ediliyor..." : "Telegram Güncellemelerini Kontrol Et"}
                </Button>

                {updates.length > 0 && (
                    <div className="mt-6 rounded-md bg-gray-50 p-4">
                        <h3 className="mb-2 font-medium">Son Aktiviteler</h3>
                        <ul className="space-y-4 text-sm">
                            {updates.map((u: any, i) => {
                                // Determine the type of update and extract chat info
                                const payload = u.message || u.channel_post || u.my_chat_member || u.edited_message;
                                const chat = payload?.chat || u.my_chat_member?.chat;
                                const text = payload?.text || (u.my_chat_member ? "Bot Gruba Eklendi/Durumu Değişti" : "Bilinmeyen Olay");
                                const type = u.channel_post ? "Kanal Mesajı" : u.my_chat_member ? "Üyelik Güncellemesi" : "Grup Mesajı";

                                return (
                                    <li key={i} className="border-b pb-2 last:border-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-bold text-blue-600">
                                                    {chat?.title || "Özel Sohbet"}
                                                </span>
                                                <span className="ml-2 text-xs uppercase bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                                    {chat?.type}
                                                </span>
                                            </div>
                                            <span className="text-xs font-mono bg-gray-900 text-white px-2 py-1 rounded">
                                                ID: {chat?.id}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-gray-700">
                                            <span className="font-semibold text-xs text-gray-500 mr-2">[{type}]</span>
                                            {text}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {updates.length === 0 && !loading && (
                    <p className="mt-4 text-sm text-gray-400">Son güncelleme bulunamadı veya bot token ayarlanmamış.</p>
                )}
            </div>
        </div>
    )
}
