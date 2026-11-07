const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "ai",
                version: "3.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        en: "Chat with an AI assistant on any topic",
                        vi: "Trò chuyện với trợ lý AI về bất kỳ chủ đề nào"
                },
                category: "ai",
                guide: {
                        en: '   {pn} <question>: Type your question',
                        vi: '   {pn} <câu hỏi>: Nhập câu hỏi của bạn'
                }
        },

        langs: {
                en: {
                        noInput: "× Baby, please ask something!",
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                },
                vi: {
                        noInput: "× Cưng ơi, hãy hỏi điều gì đó!",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ.\n•WhatsApp: 01836298139"
                }
        },

        onStart: async function ({ api, event, args, message, getLang, commandName }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const prompt = args.join(" ");
                if (!prompt) return message.reply(getLang("noInput"));

                return module.exports.handleAI({ api, event, prompt, getLang, commandName });
        },

        onReply: async function ({ api, event, Reply, getLang, commandName }) {
                if (Reply.author !== event.senderID) return;
                const prompt = event.body;
                if (!prompt) return;

                return module.exports.handleAI({ api, event, prompt, getLang, commandName });
        },

        handleAI: async function ({ api, event, prompt, getLang, commandName }) {
                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        const response = await axios.get(`${await baseApiUrl()}/api/ai`, {
                                params: {
                                        prompt: prompt,
                                        ai: "ai"
                                }
                        });

                        const replyText = response.data.response || "No response received.";
                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                        return api.sendMessage(replyText, event.threadID, (error, info) => {
                                if (!error) {
                                        global.GoatBot.onReply.set(info.messageID, {
                                                commandName,
                                                author: event.senderID
                                        });
                                }
                        }, event.messageID);

                } catch (err) {
                        console.error("AI Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        const errorMsg = err.response?.data?.error || err.message;
                        return api.sendMessage(getLang("error", errorMsg), event.threadID, event.messageID);
                }
        }
};
