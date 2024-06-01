import React, { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiCopy, FiCheck } from 'react-icons/fi';
// 导入你需要的语言高亮模块
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import shell from 'react-syntax-highlighter/dist/esm/languages/hljs/shell';

// 注册语言模块
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', shell);

const CodeBlock = ({ language, value, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(() => false), 3000);
  };

  return (
    <div className="relative my-4 border-[0.5px]">
      <div className="flex justify-between items-center text-xs p-2 rounded-t-md bg-[#2f2f2f] text-gray-50">
        <span>{language}</span>
        <CopyToClipboard text={value} onCopy={handleCopy}>
          <button className="flex items-center hover:text-white">
            {isCopied ? (
              <FiCheck className="mr-1" />
            ) : (
              <FiCopy className="mr-1" />
            )}
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </CopyToClipboard>
      </div>
      <SyntaxHighlighter language={language} style={monokaiSublime} {...props}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
