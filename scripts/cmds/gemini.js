const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/rahamanleon/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "gemini",
                version: "2.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                category: "ai",
                guide: {
                        en: '   {pn} <prompt>: Ask anything to AI\n   Or reply to an image with a prompt',
                        vi: '   {pn} <câu hỏi>: Hỏi bất cứ điều gì\n   Hoặc phản hồi một hình ảnh'
                }
        },

        langs: {
                en: {
                        noPrompt: "⚠️ Baby, please provide a question\n\nExample: {pn} Who are you?",
                        noResponse: "× No response received from AI.",
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                },
                vi: {
                        noPrompt: "⚠️ Cưng ơi, vui lòng nhập câu hỏi! Ví dụ: {pn} Bạn là ai?",
                        noResponse: "× Không nhận được phản hồi từ AI.",
                        error: "× Lỗi API: %1. Liên hệ MahMUD để được trợ giúp.\n•WhatsApp: 01836298139"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const prompt = args.join(" ");
                if (!prompt) return message.reply(getLang("noPrompt"));

                let imageUrl = "";
                if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
                        const attachment = event.messageReply.attachments[0];
                        if (attachment.type === "photo") {
                                imageUrl = attachment.url;
                        }
                }

                return await handleGemini(api, event, prompt, imageUrl, this.config.name, getLang);
        },

        onReply: async function ({ api, event, Reply, args, getLang }) {
                if (Reply.author !== event.senderID) return;
                
                const prompt = args.join(" ");
                if (!prompt) return;

                let imageUrl = "";
                if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
                        const attachment = event.messageReply.attachments[0];
                        if (attachment.type === "photo") {
                                imageUrl = attachment.url;
                        }
                }

                return await handleGemini(api, event, prompt, imageUrl, this.config.name, getLang);
        }
};

async function handleGemini(api, event, prompt, imageUrl, commandName, getLang) {
        try {
                const response = imageUrl 
                        ? await axios.get(`${await baseApiUrl()}/api/gemini?chat=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`)
                        : await axios.get(`${await baseApiUrl()}/api/gemini?chat=${encodeURIComponent(prompt)}`);

                const replyText = response.data.response || response.data.reply || getLang("noResponse");

                api.sendMessage(replyText, event.threadID, (error, info) => {
                        if (!error) {
                                global.GoatBot.onReply.set(info.messageID, {
                                        commandName: commandName,
                                        author: event.senderID,
                                        messageID: info.messageID,
                                        type: "reply"
                                });
                        }
                }, event.messageID);

        } catch (err) {
                api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
        }
}
