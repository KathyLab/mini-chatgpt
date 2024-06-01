import Markdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const MarkdownRenderer = ({ markdown, streaming }) => {
  return (
    <Markdown
      children={markdown}
      className="markdown cursor-ripple"
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <CodeBlock
              language={match[1]}
              value={String(children).replace(/\n$/, '')}
              {...props}
              className={streaming ? 'cursor-blink last:after:bg-white' : ''}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        p: ({ node, children, ...props }) => {
          return (
            <p
              className={streaming ? 'flex items-center cursor-blink' : ''}
              {...props}
            >
              {children}
            </p>
          );
        },
      }}
    />
  );
};

export default MarkdownRenderer;
