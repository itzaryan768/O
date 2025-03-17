module.exports = {
  config: {
    name: "bet",
    version: "2.2",
    author: "Aryan Chauhan",
    countDown: 0,
    shortDescription: { en: "Place your bets and test your luck!" },
    longDescription: {
      en: "A thrilling betting game where you can risk your money and potentially win big!",
    },
    category: "economy",
  },

  langs: {
    en: {
      invalid_amount: "%1, please enter a valid and positive bet amount.",
      not_enough_money: "%1, you don't have enough balance to place that bet.",
      start_message: "%1, you've bet $%2. Let's see if luck is on your side...",
      win_message: "🎉 %1, you won $%2! Your bet paid off!",
      lose_message: "😢 %1, you lost $%2. Better luck next time!",
      jackpot_message: "🎯 Jackpot! %1, you hit the jackpot and won $%2!",
      odd_win: "🎲 %1, you won with an odd roll (%2) and earned a bonus! Total win: $%3!",
      even_win: "🎲 %1, you won with an even roll (%2) and earned a bonus! Total win: $%3!",
      tie_message: "🤝 %1, it's a tie! Your bet of $%2 has been returned.",
      game_summary: `
===== BET GAME SUMMARY =====
👤 Name: %1
💰 Bet Amount: $%2
🎲 Your Roll: %3
🤖 Bot's Roll: %4
%s
💸 Final Balance: $%5
===========================`,
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

    if (betAmount > userData.money) {
      return message.reply(getLang("not_enough_money", userName));
    }

    await message.reply(getLang("start_message", userName, betAmount));

    const playerRoll = Math.floor(Math.random() * 12) + 1;
    const botRoll = Math.floor(Math.random() * 12) + 1;

    let resultMessage = "";
    let winnings = 0;
    let statusText = "";

    if (playerRoll === botRoll) {
      resultMessage = getLang("tie_message", userName, betAmount);
      winnings = 0;
      statusText = `🔁 Result: Tie - No money won or lost`;
    } else if (playerRoll > botRoll) {
      winnings = betAmount * 2;

      if (playerRoll === 12) {
        winnings = betAmount * 5;
        resultMessage = getLang("jackpot_message", userName, winnings);
        statusText = `🏆 Result: JACKPOT - You won $${winnings}`;
      } else {
        if (playerRoll % 2 === 0) {
          winnings = Math.floor(winnings * 1.5);
          resultMessage = getLang("even_win", userName, playerRoll, winnings);
          statusText = `✅ Result: WIN (Even Bonus) - You won $${winnings}`;
        } else {
          winnings = Math.floor(winnings * 1.25);
          resultMessage = getLang("odd_win", userName, playerRoll, winnings);
          statusText = `✅ Result: WIN (Odd Bonus) - You won $${winnings}`;
        }
      }
    } else {
      winnings = -betAmount;
      resultMessage = getLang("lose_message", userName, betAmount);
      statusText = `❌ Result: LOSS - You lost $${betAmount}`;
    }

    const finalBalance = userData.money + winnings;
    await usersData.set(uid, {
      money: finalBalance,
      data: userData.data,
    });

    const summary = getLang(
      "game_summary",
      userName,
      betAmount,
      playerRoll,
      botRoll,
      statusText,
      finalBalance
    );

    return message.reply(`${resultMessage}\n\n${summary}`);
  },
};
