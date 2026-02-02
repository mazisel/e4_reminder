export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // We need to dynamic import to avoid bundling issues in edge or during build
        const { default: cron } = await import("node-cron")

        // Define the cron schedule (e.g., 09:00 AM every day)
        // Cron format: Minute Hour Day Month DayOfWeek
        // 0 9 * * * = Every day at 09:00
        const SCHEDULE = "0 9 * * *"

        // Prevent multiple initializations in dev mode if possible, 
        // though instrumentation usually runs once per server instance.
        if (!(global as any).cronJobInitialized) {
            console.log(`[Scheduler] Initializing internal cron job: ${SCHEDULE}`)

            cron.schedule(SCHEDULE, async () => {
                console.log("[Scheduler] Triggering daily special day check...")
                try {
                    // We call the logic directly or fetch the API. 
                    // Fetching the API via localhost is safer to ensure same context/env vars.
                    // Assuming port 6090 or using an env var for BASE_URL
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:6090"

                    // We use fetch to trigger the route handler
                    // Note: In production docker, localhost:6090 is internal.
                    const res = await fetch(`${baseUrl}/api/cron`)
                    const data = await res.json()
                    console.log("[Scheduler] Result:", data)
                } catch (error) {
                    console.error("[Scheduler] Execution failed:", error)
                }
            })

                ; (global as any).cronJobInitialized = true
        }
    }
}
