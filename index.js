const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "5831285528:AAHt6Ec5X92D6pXJ5FG44bfX3ORm0fFSP50";
const webAppUrl = "https://rococo-granita-c30009.netlify.app";
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors);

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text === "/start") {
    await bot.sendMessage(
      chatId,
      "Pasdagi tugmachani bosing,surovni to'ldiring",
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Surovni tuldiring ",
                web_app: { url: webAppUrl + "/form" },
              },
            ],
          ],
        },
      }
    );

    await bot.sendMessage(chatId, "Internet do'konimizga kiring", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Buyurtma qilish", web_app: { url: webAppUrl } }],
        ],
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      await bot.sendMessage(chatId, "Aloqa uchun rahmat");
      await bot.sendMessage(chatId, "Sizning davaltingiz: " + data?.country);
      await bot.sendMessage(chatId, "Sizning ko'changiz: " + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(chatId, "Hamma xabarni ushbu chatda olasiz");
      });
    } catch (e) {
      console.log(e);
    }
  }

  // send a message to the chat acknowledging receipt of their message
  //bot.sendMessage(chatId, "Received your message");
});

app.post("/web-data", async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Xarid qilindi",
      input_message_content: {
        message_text: `Xaridingiz bilan tabriklayman,Siz ${totalPrice} summada xarid qildingiz`,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Xarid amalga oshmadi",
      input_message_content: {
        message_text: `Xarid amalga oshmadi`,
      },
    });
    return res.status(500).json({});
  }

  bot.answerWebAppQuery();
});

const PORT = 8000;

app.listen(PORT, () => console.log("server started on PORT " + PORT));
