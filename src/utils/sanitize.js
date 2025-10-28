// utils/sanitize.js
import DOMPurify from 'dompurify';

// Consistent sanitization configuration between frontend and backend
export const ALLOWED_TAGS = [
  'b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'div', 'span' // Basic structural elements
];

export const ALLOWED_ATTR = {
  // Add specific allowed attributes for specific tags if needed
  '*': ['class', 'id', 'data-*'] // Allow some basic attributes for styling/JS hooks
};

// Clean HTML content
export const sanitizeHtml = (content) => {
  if (!content) return '';
  
  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
    FORCE_BODY: false
  };

  return DOMPurify.sanitize(content, config);
};

// For plain text (no HTML allowed)
export const sanitizePlainText = (text) => {
  if (!text) return '';
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: {}
  });
};

// For safely rendering HTML content
export const SafeHTML = ({ html, className = '' }) => {
  const cleanHtml = sanitizeHtml(html);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};
