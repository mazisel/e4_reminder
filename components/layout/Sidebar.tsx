"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Calendar, Settings, LogOut } from "lucide-react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Sendikalar",
        href: "/admin/unions",
        icon: Users,
    },
    {
        title: "Özel Günler",
        href: "/admin/special-days",
        icon: Calendar,
    },
    {
        title: "Ayarlar",
        href: "/admin/settings",
        icon: Settings,
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-gray-900 text-white">
            <div className="flex h-14 items-center border-b border-gray-800 px-6">
                <h1 className="text-lg font-bold">Reminder Bot</h1>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-800",
                            pathname === item.href ? "bg-gray-800 text-blue-400" : "text-gray-400"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                ))}
            </nav>
            <div className="border-t border-gray-800 p-4">
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white">
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                </button>
            </div>
        </div>
    )
}
