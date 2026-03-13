"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ENTRY_PASSWORD = "Remindere4";
const AUTH_COOKIE_NAME = "e4_auth";

export default function Home() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== ENTRY_PASSWORD) {
      setError("Şifre yanlış.");
      return;
    }

    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=28800; samesite=lax`;
    setError("");
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Sendika Özel Gün Botu</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Özel gün hatırlatmaları ve otomatik bildirim yönetimi sistemi.
        </p>
        <form onSubmit={handleSubmit} className="pt-4 space-y-3 w-full max-w-sm mx-auto">
          <Input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) {
                setError("");
              }
            }}
            placeholder="Şifre"
            autoComplete="off"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" size="lg" className="w-full gap-2">
            Yönetim Paneline Git →
          </Button>
        </form>
      </div>
    </div>
  );
}
