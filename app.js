import {Telegraf} from 'telegraf'
import mysql from 'mysql2/promise';
import dotenv from "dotenv";
dotenv.config()
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.telegram.setChatMenuButton([
  { command: "start", description: "Start the bot" },
  { command: "menu", description: "Show restaurant menu" },
  { command: "help", description: "Show help info" },
  { command: "contact", description: "Contact support" },
  { command: "reset", description: "Restart Bot" }
]);

try {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'menus',
    port: 3306,
    password: '',
  });
} catch (err) {
  console.log(err);
};

bot.start((ctx) => ctx.reply("Bot is working!"));

bot.command('menu',(ctx)=>
ctx.replyWithPhoto('https://assets.bonappetit.com/photos/5b919cb83d923e31d08fed17/4:3/w_2666,h_2000,c_limit/basically-burger-1.jpg', {
  caption: `🍕 *Margherita Pizza*\nDelicious cheese pizza.\n💰 $12.99`,
  parse_mode: "Markdown"
})
);

bot.command('contact',(ctx)=>
ctx.replyWithPhoto('https://assets.bonappetit.com/photos/5b919cb83d923e31d08fed17/4:3/w_2666,h_2000,c_limit/basically-burger-1.jpg', {
  caption: `🍕 *Margherita Pizza*\nDelicious cheese pizza.\n💰 $12.99`,
  parse_mode: "Markdown"
})
);

bot.command("reset", async (ctx) => {
  ctx.session = {};  // Clear stored user data
});

// const getProduct = async ()=>{
// try {
//   const sql = 'SELECT name FROM `product` WHERE `name` = "Product One"';

//   const [rows, fields] = await connection.query(sql);

//   console.log(rows);
//   console.log(fields);
//   return rows;
// } catch (err) {
//   console.log(err);
// }
// }

bot.launch();