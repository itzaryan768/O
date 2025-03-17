module.exports = {
  config: {
    name: "dice",
    version: "4.0",
    author: "Aryan Chauhan",
    countDown: 3,
    shortDescription: { en: "Roll dice vs bot with entry fee and win rewards!" },
    longDescription: {
      en: "Pay to play dice game. Beat the bot to win XP & money!",
    },
    category: "economy",
  },

  langs: {
    en: {
      start: "🎲 Rolling the dice for you and the bot...",
      result: `
🎯 DICE GAME RESULT

👤 %1: %2 (%3)
🤖 Bot : %4 (%5)

%6`,
      win: "🎉 You win! Earned $%1 and +%2 XP!",
      lose: "😢 You lost! You paid $%1 to play.",
      tie: "🤝 It's a tie! You paid $%1 but got no rewards.",
      not_enough: "%1, you need at least $%2 to play the dice game!",
    },
  },

  onStart: async function ({ message, event, usersData, getLang }) {
    const uid = event.senderID;
    const userData = await usersData.get(uid);
    const userName = userData?.name || "Player";

    const entryFee = 50; // Minimum money needed to play
    const rewardMoney = 100; // Winning reward
    const rewardXP = 20;

    if (userData.money < entryFee) {
      return message.reply(getLang("not_enough", userName, entryFee));
    }

    const diceFaces = {
      1: "⚀", 2: "⚁", 3: "⚂",
      4: "⚃", 5: "⚄", 6: "⚅",
    };

    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;

    // Deduct entry fee
    userData.money -= entryFee;
    let resultText = "";

    if (playerRoll > botRoll) {
      userData.money += rewardMoney;
      userData.exp = (userData.exp || 0) + rewardXP;
      resultText = getLang("win", rewardMoney, rewardXP);
    } else if (playerRoll < botRoll) {
      resultText = getLang("lose", entryFee);
    } else {
      resultText = getLang("tie", entryFee);
    }

    await usersData.set(uid, {
      money: userData.money,
      exp: userData.exp,
      data: userData.data,
    });

    const finalMessage = getLang(
      "result",
      userName,
      diceFaces[playerRoll],
      playerRoll,
      diceFaces[botRoll],
      botRoll,
      resultText
    );

    return message.reply(`${getLang("start")}\n${finalMessage}`);
  },
};
