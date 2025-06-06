'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Code Block Component
export const CodeBlock = ({ 
  children, 
  language 
}: { 
  children: string; 
  language?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg bg-gray-900 text-gray-100 overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <span className="text-xs text-gray-400">{language || 'text'}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-6 px-2 text-gray-400 hover:text-gray-100"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="text-sm">{children}</code>
      </pre>
    </div>
  );
};

// Inline Code Component
export const InlineCode = ({ children }: { children: React.ReactNode }) => (
  <code className="px-1.5 py-0.5 text-sm bg-gray-100 text-gray-800 rounded">
    {children}
  </code>
);

// Table Component
export const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="my-4 overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  </div>
);

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

export const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr>{children}</tr>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

export const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-3 text-sm text-gray-900">
    {children}
  </td>
);

// List Components
export const UnorderedList = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc list-inside space-y-1 my-4 text-gray-700">
    {children}
  </ul>
);

export const OrderedList = ({ children }: { children: React.ReactNode }) => (
  <ol className="list-decimal list-inside space-y-1 my-4 text-gray-700">
    {children}
  </ol>
);

export const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="ml-4">{children}</li>
);

// Blockquote Component
export const Blockquote = ({ children }: { children: React.ReactNode }) => (
  <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-600">
    {children}
  </blockquote>
);

// Link Component
export const Link = ({ 
  href, 
  children 
}: { 
  href: string; 
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:text-blue-800 underline"
  >
    {children}
  </a>
);

// Heading Components
export const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4">{children}</h1>
);

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-3">{children}</h2>
);

export const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h3>
);

export const H4 = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-base font-semibold text-gray-900 mt-3 mb-2">{children}</h4>
);

// Paragraph Component
export const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
);

// Horizontal Rule
export const HorizontalRule = () => (
  <hr className="my-6 border-gray-200" />
);

// Markdown component mapping
export const markdownComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: Paragraph,
  a: Link,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  blockquote: Blockquote,
  code: ({ inline, className, children }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
    ) : (
      <InlineCode>{children}</InlineCode>
    );
  },
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: TableHeader,
  td: TableCell,
  hr: HorizontalRule,
};