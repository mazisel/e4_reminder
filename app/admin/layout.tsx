import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get("e4_auth")?.value === "1"

    if (!isAuthenticated) {
        redirect("/")
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
