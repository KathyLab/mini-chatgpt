const Router = require('koa-router');
const router = new Router();
const PassThrough = require('stream').PassThrough;

const openai = require('openai/index.js');

const opneaiClinet = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.chatanywhere.com.cn', // 此处用的是免费的 key， 如果直接用 open ai API key，不用设置这个参数
});

const conversation = [];

router.post('/chat', async (ctx) => {
  const userInput = ctx.request.body?.text;
  const stream = new PassThrough();

  /**
   * @workaround
   * 带上每次的聊天记录，让对话具有连续性
   * 缺点：对话多了，会导致message 过大
   */
  conversation.push({ role: 'user', content: userInput });

  try {
    const completions = await opneaiClinet.chat.completions.create({
      engine: 'gpt-3.5-turbo', // 使用 GPT-3 引擎
      // messages: [{ role: 'user', content: userInput }], // 直接发送，不关联上下文
      messages: conversation, // 可关联上下文
      stream: true,
    });

    let answer = '';

    ctx.set('Content-Type', 'text/event-stream');
    ctx.set('Cache-Control', 'no-cache');
    // ctx.set('Connection', 'keep-alive');
    ctx.response.body = stream;
    // 返回生成的响应给用户
    for await (const chunk of completions) {
      // ctx.response.body = chunk.choices[0]?.delta?.content || '';
      answer += chunk.choices[0]?.delta?.content ?? '';
      stream.write(
        `data: ${JSON.stringify(chunk.choices[0]?.delta?.content || '')}\n\n`
      );
    }
    stream.write(`data: ${JSON.stringify('[DONE]')}\n\n`);

    conversation.push({ role: 'assistant', content: answer });
    ctx.req.on('close', () => {
      ctx.res.end();
      console.log('Client disconnected');
    });
    ctx.req.on('finish', () => {
      ctx.res.end();
      console.log('Client finish');
    });
    ctx.req.on('error', () => {
      ctx.res.end();
    });
  } catch (e) {
    console.error('Error:', e);
    ctx.status = 500;
    ctx.response.body = 'Internal Server Error';
  }
});

module.exports = router;
