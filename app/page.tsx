import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Sendika Özel Gün Botu</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Özel gün hatırlatmaları ve otomatik bildirim yönetimi sistemi.
        </p>
        <div className="pt-4">
          <Link href="/admin">
            <Button size="lg" className="gap-2">
              Yönetim Paneline Git →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
