const axios = require('axios');
const fs = require("fs-extra");
const path = require('path');

module.exports = {
    config: {
        name: "gen",
        version: "1.0",
        author: "Team Calyx",
        category: "ai",
        countDown: 40,
        shortDescription: "Generate an image",
        longDescription: "Generates an image based on the provided prompt.",
        guide: "{pn} <prompt>",
    },

    onStart: async function ({ event, message, args }) {
        if (!args || args.length === 0) {
            return message.reply("❌ Please provide a prompt.\nUsage: -gen <prompt>");
        }

        const prompt = args.join(" ");

        try {
            const apiUrl = await getApiUrl();
            if (!apiUrl) {
                return message.reply("❌ Failed to fetch API URL.");
            }

            const genUrl = `${apiUrl}/gen?prompt=${encodeURIComponent(prompt)}`;
            const response = await axios.get(genUrl, { responseType: 'arraybuffer' });

            const tmpDir = path.join(__dirname, 'tmp');
            await fs.ensureDir(tmpDir);

            const fileName = `generated_${Date.now()}.jpg`;
            const filePath = path.join(tmpDir, fileName);
            await fs.writeFile(filePath, response.data);

            await message.reply({ attachment: fs.createReadStream(filePath) });

            setTimeout(() => {
                fs.unlink(filePath).catch(() => {});
            }, 10000); 

        } catch (error) {
            console.error("❌ Error generating image:", error.message || error);
            message.reply("❌ Failed to generate image. Please try again later.");
        }
    }
};

async function getApiUrl() {
    try {
        const response = await axios.get("https://raw.githubusercontent.com/Savage-Army/extras/main/api.json");
        return response.data.api;
    } catch (error) {
        console.error("❌ Error fetching API URL:", error.message || error);
        return null;
    }
}
