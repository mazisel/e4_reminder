import { Telegraf } from "telegraf"

const botToken = process.env.TELEGRAM_BOT_TOKEN

export const telegramBot = botToken ? new Telegraf(botToken) : null

export async function sendTelegramMessage(chatId: string, message: string) {
    if (!telegramBot) {
        console.warn("TELEGRAM_BOT_TOKEN is not set")
        return false
    }
    try {
        await telegramBot.telegram.sendMessage(chatId, message)
        return true
    } catch (error) {
        console.error(`Failed to send message to ${chatId}`, error)
        return false
    }
}

export async function getBotUpdates() {
    if (!telegramBot) return { updates: [], botInfo: null }
    try {
        // Ensure webhook is deleted to allow getUpdates (long polling)
        await telegramBot.telegram.deleteWebhook()

        const updates = await telegramBot.telegram.getUpdates()
        const botInfo = await telegramBot.telegram.getMe()

        return { updates, botInfo }
    } catch (error) {
        console.error("Failed to get updates", error)
        return { updates: [], botInfo: null }
    }
}
