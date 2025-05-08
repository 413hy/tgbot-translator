const axios = require('axios');

async function chatWithAI(text, retries = 3) {
  const apiKey = process.env.AI_API_KEY; 
  const endpoint = process.env.AI_API_ENDPOINT;
  const model = process.env.AI_MODEL;

  const messages = [
    {
      role: 'system',
      content: `
      你是一个友好的聊天助手，能够用自然、亲切的语气与用户交流。
      你应该：
      1. 保持对话的连贯性和自然性
      2. 适当使用表情符号增加趣味性
      3. 给出有见地且有帮助的回答
      4. 在合适的场景使用幽默元素
      请直接回答用户的问题，保持简洁明了。`,
    },
    {
      role: 'user',
      content: text,
    },
  ];

  async function attemptChat(attempt = 1) {
    try {
      const response = await axios.post(
        endpoint,
        {
          model: model,
          messages: messages,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30秒超时
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (attempt < retries) {
        console.log(`重试第 ${attempt} 次...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return attemptChat(attempt + 1);
      }
      throw error;
    }
  }

  try {
    return await attemptChat();
  } catch (error) {
    console.error('对话失败:', error.response ? error.response.data : error.message);
    return '⚠️ 抱歉，我现在遇到了一些问题，请稍后再试。';
  }
}

module.exports = {
  chatWithAI
};