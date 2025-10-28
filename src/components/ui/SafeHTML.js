// components/ui/SafeHTML.js
'use client';
import { useMemo } from 'react';
import { sanitizeHtml } from '@/utils/sanitize';

export default function SafeHTML({ 
  content,
  className = '',
  preserveWhitespace = false,
  tag: Tag = 'div'
}) {
  // Memoize the sanitized content to prevent unnecessary re-sanitization
  const sanitizedContent = useMemo(() => {
    return sanitizeHtml(content);
  }, [content]);

  return (
    <Tag 
      className={`${className} ${preserveWhitespace ? 'whitespace-pre-wrap' : ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

// Example usage:
// <SafeHTML 
//   content={htmlContent} 
//   className="prose"
//   preserveWhitespace={true}
//   tag="article"
// />
