const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "spotify",
                version: "2.8",
                author: "MahMUD",
                role: 0,
                category: "music",
                cooldown: 10,
                guide: {
                        en: '   {pn} [song name] - Example: {pn} Mood Lo-Fi',
                        vi: '   {pn} [tên bài hát] - Ví dụ: {pn} Mood Lo-Fi'
                }
        },

        langs: {
                en: {
                        noQuery: "• Please provide a song name.\n\nExample: !spotify Mood Lo-Fi",
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139",
                        success: "✅ Here's Your Spotify song\n• Search: %1"
                },
                vi: {
                        noQuery: "• Vui lòng cung cấp từ khóa tìm kiếm! Ví dụ: !spotify Mood Lo-Fi",
                        error: "× Lỗi API: %1. Liên hệ MahMUD để được giúp đỡ.\n•WhatsApp: 01836298139",
                        success: "✅ Here's Your Spotify song\n• Search: %1"
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID } = event;
                const query = args.join(" ");

                if (!query) return api.sendMessage(getLang("noQuery"), threadID, messageID);

                try {
                        api.setMessageReaction("⏳", messageID, () => { }, true);

                        const downloadUrl = `${await mahmud()}/api/spotify?search=${encodeURIComponent(query)}`;
                        const stream = await global.utils.getStreamFromURL(downloadUrl);

                        api.sendMessage({
                                body: getLang("success", query),
                                attachment: stream
                        }, threadID, (err) => {
                                if (!err) {
                                        api.setMessageReaction("✅", messageID, () => { }, true);
                                }
                        }, messageID);

                } catch (err) {
                        api.setMessageReaction("❌", messageID, () => { }, true);
                        api.sendMessage(getLang("error", err.message || "API Error"), threadID, messageID);
                }
        }
};
