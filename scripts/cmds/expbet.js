module.exports = {
  config: {
    name: "expbet",
    version: "2.0",
    author: "Aryan Chauhan",
    countDown: 0,
    shortDescription: { en: "Bet to win XP only!" },
    longDescription: {
      en: "Test your luck by placing a bet and win XP! No money involved.",
    },
    category: "economy",
  },

  langs: {
    en: {
      invalid_amount: "%1, please enter a valid and positive bet amount.",
      start_message: "%1, you've bet $%2 to earn XP. Let's roll...",
      win_message: "🎉 %1, you rolled higher and won %2 XP!",
      lose_message: "😢 %1, you lost the bet but still gained %2 XP!",
      tie_message: "🤝 %1, it's a tie! You earned %2 XP!",
      game_summary: `
====== XP BET SUMMARY ======
👤 Name: %1
💰 Fake Bet Amount: $%2
🎲 Your Roll: %3
🤖 Bot's Roll: %4
📊 Result: %5
⭐ XP Gained: %6
============================`,
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const uid = event.senderID;
    const userData = await usersData.get(uid);
    const userName = userData.name || "Player";
    const betAmount = parseInt(args[0]);

    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(getLang("invalid_amount", userName));
    }

    await message.reply(getLang("start_message", userName, betAmount));

    const playerRoll = Math.floor(Math.random() * 12) + 1;
    const botRoll = Math.floor(Math.random() * 12) + 1;
    const xpEarned = Math.floor(Math.random() * 20) + 10; // 10-30 XP

    let result = "";
    let resultText = "";

    if (playerRoll > botRoll) {
      result = "WIN";
      resultText = getLang("win_message", userName, xpEarned);
    } else if (playerRoll < botRoll) {
      result = "LOSS";
      resultText = getLang("lose_message", userName, xpEarned);
    } else {
      result = "TIE";
      resultText = getLang("tie_message", userName, xpEarned);
    }

    const newXP = (userData.exp || 0) + xpEarned;
    await usersData.set(uid, {
      ...userData,
      exp: newXP
    });

    const summary = getLang(
      "game_summary",
      userName,
      betAmount,
      playerRoll,
      botRoll,
      result,
      xpEarned
    );

    return message.reply(`${resultText}\n\n${summary}`);
  },
};
