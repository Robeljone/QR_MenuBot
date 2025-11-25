import { Telegraf } from 'telegraf'
import mysql from 'mysql2/promise';
import dotenv from "dotenv";

dotenv.config()

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "menus"
});

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.telegram.setChatMenuButton([
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help info" },
  { command: "contact", description: "Contact support" },
  { command: "Reset", description: "Show restaurant menu" }
]);

bot.start((ctx) =>
  ctx.reply(
    "👋 Welcome to FlavorHub Restaurant Bot !\n\n" +
    "Browse meals with pictures, check ingredients, explore categories, " +
    "and enjoy a smooth, responsive ordering experience — all from your phone.\n\n" +
    "🍽️ How can we help you today ? ",
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Menus", callback_data: "menus" },
            { text: "Categories", callback_data: "categories" }
          ],
          [
            { text: "About_Us", callback_data: "about" },
            { text: "Clear", callback_data: "clear" }
          ]
        ]
      }
    }
  )
);

bot.command("contact", async (ctx) => {
  // Contact info message
  await ctx.reply(
    "📍 *FlavorHub Restaurant*\n" +
    "We are happy to serve you!\n\n" +
    "Here is our location on the map 👇"
  );
  // Send map pin
  ctx.replyWithLocation(9.010792, 38.761253); // Replace with your coordinates
});


bot.action("menus", (ctx) => {
  ctx.reply("Here is the menu 📋");
});

bot.action("categories", async (ctx) => {
   try {
    // Fetch categories from DB
    const [rows] = await db.query("SELECT id, name FROM categories");

    // Create inline keyboard buttons
    const buttons = rows.map(row => [{ text: row.name, callback_data: `cat_${row.id}` }]);

    ctx.reply("Select a category:", {
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Error fetching categories.");
  }
});

bot.action(/cat_(\d+)/, async (ctx) => {
  const categoryId = ctx.match[1];
  await ctx.sendChatAction("typing");
  await ctx.answerCbQuery("Loading products...");


  try {
    const [products] = await db.query(
      "SELECT id, name FROM products WHERE category_id = ?",
      [categoryId]
    );

    if (products.length === 0) {
      return ctx.reply("No products found in this category.");
    }

   for (const product of products) {
      // Inline buttons: Details and Back to Categories
      const buttons = [
        [
          { text: "ℹ️ Details", callback_data: `prod_${product.id}` },
        ],
        [
          { text: "🔙 Back to Categories", callback_data: "categories" }
        ]
      ];

      await ctx.replyWithPhoto(
        { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuLHpAGaQCO-oFBmgtg872-QpnYNMoBLBglHRalxDihavJlbJo7IlPAFHKFqHLs7aAH6JBnmvtUDyrYzO5KKp1zA_i89EkBM25S3r96h8H&s=10' },
        {
          caption: `🍽️ *${product.name}*\n\n${product.description}\n`,
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: buttons }
        }
      );
    }

  } catch (err) {
    console.error(err);
    ctx.reply("❌ Error fetching products");
  }
});


bot.action("about", (ctx) => {
  ctx.reply(
    "📍 *FlavorHub Restaurant*\n" +
    "We are happy to serve you!\n\n" +
    "Here is our location on the map 👇"
  );
  // Send map pin
  ctx.replyWithLocation(9.010792, 38.761253);
});

bot.action("clear", async (ctx) => {
 try {
    // Make sure the message exists
    if (!ctx.callbackQuery || !ctx.callbackQuery.message) {
      return ctx.answerCbQuery("Cannot clear messages ❌");
    }

    const chatId = ctx.callbackQuery.message.chat.id;
    const messageId = ctx.callbackQuery.message.message_id;

    // Delete last 50 messages (or as many as you like)
    for (let i = messageId; i > messageId - 100; i--) {
      await ctx.telegram.deleteMessage(chatId, i).catch(() => {});
    }

    ctx.answerCbQuery("Chat cleared ✅");
  } catch (err) {
    console.error(err);
    ctx.answerCbQuery("Failed to clear messages ❌");
  }
});


// bot.on("text", (ctx) => {
//   const msg = ctx.message.text.toLowerCase();

//   if (msg.includes("about_us")) {
//     return ctx.reply("Hello! 👋 How can I help you today?");
//   }

//   if (msg.includes("view_menu")) {
//     return ctx.reply("Here is our menu 📋");
//   }

//   if (msg.includes("popular_dishes")) {
//     return ctx.reply("Here is our menu 📋");
//   }

//   if (msg.includes("categories")) {
//     return ctx.reply("Here is our menu 📋");
//   }

//   ctx.reply("I'm not sure what you mean. Try: *menu*, *hello*, or *help*.");
// });
bot.launch();