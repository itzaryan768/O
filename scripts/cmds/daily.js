const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "daily",
    version: "1.1",
    author: "NTKhang",
    countDown: 10,
    role: 0,
    longDescription: {
      en: "Get daily gift"
    },
    category: "economy",
    guide: {
      en: "   {pn}"
        + "\n   {pn} info: View daily gift information"
    },
    envConfig: {
      rewardFirstDay: {
        coin: 10000,
        exp: 1000
      }
    }
  },

  langs: {
    en: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      alreadyReceived: "⛔ 𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗖𝗹𝗮𝗶𝗺𝗲𝗱\n━━━━━━━━━━\n\nYou have already received the gift.",
      received: "🎁 𝗗𝗮𝗶𝗹𝘆 𝗚𝗶𝗳𝘁𝘀\n━━━━━━━━━━━━\n\nYou have received ➤【 %1 】 💸 Dollars\n\n  Your Exp Has Been Increased By  \n➤【 %2 】INC  EXP"
    }
  },

  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
    const reward = envCommands[commandName].rewardFirstDay;
    if (args[0] == "info") {
      let msg = "";
      for (let i = 1; i < 8; i++) {
        const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
        const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
        const day = i == 7 ? getLang("sunday") :
          i == 6 ? getLang("saturday") :
            i == 5 ? getLang("friday") :
              i == 4 ? getLang("thursday") :
                i == 3 ? getLang("wednesday") :
                  i == 2 ? getLang("tuesday") :
                    getLang("monday");
        msg += `${day}: ${getCoin} coin, ${getExp} exp\n`;
      }
      return message.reply(msg);
    }

    const dateTime = moment.tz("Asia/Delhi").format("DD/MM/YYYY");
    const date = new Date();
    const currentDay = date.getDay(); // 0: sunday, 1: monday, 2: tuesday, 3: wednesday, 4: thursday, 5: friday, 6: saturday
    const { senderID } = event;

    const userData = await usersData.get(senderID);
    if (userData.data.lastTimeGetReward === dateTime)
      return message.reply(getLang("alreadyReceived"));

    const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
    const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
    userData.data.lastTimeGetReward = dateTime;
    await usersData.set(senderID, {
      money: userData.money + getCoin,
      exp: userData.exp + getExp,
      data: userData.data
    });
    message.reply(getLang("received", getCoin, getExp));
  }
};
