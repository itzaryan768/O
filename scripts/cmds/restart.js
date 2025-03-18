const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "restart",
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		description: {
			vi: "Khởi động lại bot",
			en: "Restart bot"
		},
		category: "Owner",
		guide: {
			vi: " {pn}: Khởi động lại bot",
			en: " {pn}: Restart bot"
		}
	},

	langs: {
		vi: {
			restartting: "🔄 | Đang khởi động lại bot...",
			restarted: "✅ | Bot đã khởi động lại!\n⏰ | Thời gian: {time}s"
		},
		en: {
			restartting: "🔄 | Restarting bot...",
			restarted: "✅ | Bot restarted!\n⏰ | Time: {time}s"
		}
	},

	onLoad: function ({ api, getLang }) {
		const tmpDir = path.join(__dirname, "tmp");
		const pathFile = path.join(tmpDir, "restart.txt");

		if (fs.existsSync(pathFile)) {
			const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
			const duration = ((Date.now() - parseInt(time)) / 1000).toFixed(2);
			api.sendMessage(getLang("restarted", { time: duration }), tid);
			fs.unlinkSync(pathFile);
		}
	},

	onStart: async function ({ message, event, getLang }) {
		const tmpDir = path.join(__dirname, "tmp");
		const pathFile = path.join(tmpDir, "restart.txt");

		// Ensure tmp directory exists
		if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

		fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
		await message.reply(getLang("restartting"));
		process.exit(2);
	}
};