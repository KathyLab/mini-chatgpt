const openai = require('openai');

const OPENAI_API_KEY = 'sk-xWBFwf3NgPwQRpE4rPp0bmPQDxsky8HkSTErK1FlvqvzqOcP';
const openaiClient = new openai.OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: 'https://api.chatanywhere.com.cn',
});

async function main() {
  const completion = await openaiClient.chat.completions.create({
    messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
    model: 'gpt-3.5-turbo',
  });

  console.log(completion.choices[0]);
}

main();
