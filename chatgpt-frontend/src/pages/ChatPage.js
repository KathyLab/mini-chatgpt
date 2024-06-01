import { useState } from 'react';
import ChatgptIcon from '../components/ChatgptIcon';
import { motion } from 'framer-motion';
import TypeWriter from '../components/TypeWriter';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ScrollToBottom from 'react-scroll-to-bottom';
import { FiStopCircle } from 'react-icons/fi';

function ChatPage() {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setConversation((conversation) => [
      ...conversation,
      { role: 'user', message: userInput },
      { role: 'assistant', message: '' },
    ]);
    // 清空输入
    setUserInput('');
    setStreaming(true);

    const controller = new AbortController();
    try {
      // 使用fetch api 获取流数据
      const response = await fetch('http://localhost:3030/chat', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInput }),
        signal: controller.signal,
      });

      // TODO show error on the page
      if (!response.ok) {
        throw new Error('Internal Server Error');
      }

      // 得到流
      const reader = response.body.getReader();

      const updateMsg = (text) => {
        setTimeout(() => {
          setConversation((prevConversation) => {
            const updateConversation = prevConversation.slice(
              0,
              prevConversation.length - 1
            );
            updateConversation.push({ role: 'assistant', message: text });
            return updateConversation;
          });
        }, 0);
      };

      let streamData = '';
      while (true) {
        const { done, value } = await reader.read();
        /**
         * @workaround
         * 完成了所有的读取
         * (这段代码实际不会运行)
         */
        if (done) {
          controller.abort();
          setStreaming(false);
          break;
        }
        let text = new TextDecoder().decode(value);
        const pattern = /data:\s*(.*?)\s*\n\n/g;
        const match = text.matchAll(pattern);
        for (let m of match) {
          const s = JSON.parse(m[1]);
          /**
           * @workaround
           * 用 fetch 读不到 { done: true, value: '' }
           * 以下是自己后台生成的结束标志
           */
          if (s === '[DONE]') {
            controller.abort(); // 断开连接
            setStreaming(false);
            return;
          }
          streamData += s;
          updateMsg(streamData);
        }

        // let lines = text
        //   .toString()
        //   .split('\n\n')
        //   .filter((line) => line.trim() !== '');
        // for (const line of lines) {
        //   streamData += line;
        // }

        // 把获取的数据块转换为字符串并加到streamData中
        // streamData += text;
        // setConversation(setFn());
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default action (newline)
      handleSubmit(e);
    }
  };

  return (
    <ScrollToBottom className="w-full h-full">
      <div className="flex justify-center h-screen">
        <div className="w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl flex flex-col gap-2">
          <h1 className="sticky top-0 bg-white z-10 text-3xl font-bold p-2 text-center h-14">
            mini ChatGPT
          </h1>

          <div className="flex-1 bg-gray-100 p-4 rounded-lg leading-normal">
            {conversation.map((chat, index) => (
              <div key={index} className="mb-2">
                {/* 显示用户输入提示 */}

                {chat.role === 'user' && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-left mb-4 flex justify-end">
                      <div className="max-w-[90%] bg-blue-200 text-blue-800 rounded-full px-3 py-1 inline-block">
                        {chat.message}
                      </div>
                    </div>
                  </motion.div>
                )}
                {/* 显示 ChatGPT 生成的回答 */}
                {chat.role === 'assistant' && (
                  <div className="max-w-[96%] mx-auto flex flex-1 gap-3 mb-4">
                    <div className="flex-shrink-0 flex">
                      <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white p-1">
                        <ChatgptIcon />
                      </div>
                    </div>

                    <div className="relative w-full min-w-0">
                      {index !== conversation.length - 1 && (
                        <MarkdownRenderer
                          markdown={chat.message}
                        ></MarkdownRenderer>
                      )}
                      {index === conversation.length - 1 && (
                        <TypeWriter streaming={streaming} text={chat.message} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* <ScrollToBottom effects={conversation} /> */}
          </div>

          {/* 用户输入提示表单 */}
          <div className="w-full sticky bottom-0 bg-white py-2">
            <form onSubmit={handleSubmit} className="flex">
              <textarea
                value={userInput}
                rows={1}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => {
                  setIsComposing(false);
                }}
                placeholder="Enter your prompt..."
                className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 resize-none"
              />
              {streaming ? (
                <motion.div className="flex justify-center items-center ml-2 px-4 py-2 rounded-lg bg-blue-300 text-white">
                  <FiStopCircle className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Send
                </motion.button>
              )}
            </form>
          </div>
        </div>
      </div>
    </ScrollToBottom>
  );
}

export default ChatPage;
