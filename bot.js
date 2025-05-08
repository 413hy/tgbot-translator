require('dotenv').config();
const { Telegraf } = require('telegraf');
const { chatWithAI } = require('./chat');
const fs = require('fs');

const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);
const userConfigPath = './userConfig.json';

// 加载用户配置、验证用户权限
function loadUserConfig() {
  if (!fs.existsSync(userConfigPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));
  } catch (error) {
    console.error('读取配置文件失败:', error);
    return null;
  }
}

// 权限检查中间件
const authMiddleware = (ctx, next) => {
  const userId = ctx.from.id.toString();
  const userConfig = loadUserConfig();
  
  if (!userConfig || !userConfig[userId]) {
    return ctx.reply('❌ 你没有权限使用本机器人。');
  }
  
  ctx.userConfig = userConfig[userId];
  return next();
};

// 使用中间件
bot.use(authMiddleware);

// 处理 /start 命令
bot.command('start', (ctx) => {
  ctx.reply('👋 你好！我是你的AI聊天助手。来跟我聊天吧！');
});

// 处理文本消息
bot.on('text', async (ctx) => {
  try {
    const response = await chatWithAI(ctx.message.text);
    await ctx.reply(response);
  } catch (error) {
    console.error('处理消息失败:', error);
    await ctx.reply('😢 抱歉，我遇到了一些问题，请稍后再试。');
  }
});

// 启动机器人
bot.launch().then(() => {
  console.log('🤖 Bot 启动成功');
}).catch(error => {
  console.error('启动失败:', error);
});

// 优雅退出
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


// 管理员命令
bot.command('stats', async (ctx) => {
  if (!ctx.userConfig.isAdmin) {
    return ctx.reply('⚠️ 此命令仅管理员可用');
  }
  
  const stats = {
    users: Object.keys(loadUserConfig()).length,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  
  await ctx.reply(`📊 统计信息:\n用户数: ${stats.users}\n运行时间: ${Math.floor(stats.uptime / 3600)}小时\n内存使用: ${Math.floor(stats.memory.heapUsed / 1024 / 1024)}MB`);
});
