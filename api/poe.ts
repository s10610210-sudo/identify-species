import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeSpecies } from '../services/geminiService';  // ← 依你的專案路徑調整

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("Poe request received:", req.body);

    const messages = req.body?.messages || [];
    const lastMsg = messages[messages.length - 1];
    const text = lastMsg?.content ?? "";

    let reply = "";

    // 🟦 判斷是否有圖片（Poe 的圖片 attachments 格式）
    if (lastMsg?.attachments?.length > 0) {
      const img = lastMsg.attachments[0];
      const imageUrl = img.url;

      reply = await analyzeSpecies(imageUrl, "zh-TW");  
    } else {
      reply = "請上傳一張照片，我可以幫你辨識物種、提供歷史背景與飼養建議。";
    }

    // 🟦 回傳 Poe 指定格式
    return res.json({
      bot_response: {
        response_type: "text",
        text: reply
      }
    });
  } catch (err: any) {
    console.error("Error:", err);
    return res.json({
      bot_response: {
        response_type: "text",
        text: "伺服器發生錯誤，請稍後再試。"
      }
    });
  }
}
