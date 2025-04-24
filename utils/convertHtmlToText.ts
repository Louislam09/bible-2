/**
 * Removes HTML tags from content and returns plain text
 * @param htmlContent - The HTML string to process
 * @param options - Options for text processing
 * @returns Clean text without HTML tags
 */
const convertHtmlToText = (
    htmlContent: string | null | undefined,
    options: {
      preserveLineBreaks?: boolean;
      preserveWhitespace?: boolean;
      decodeEntities?: boolean;
      trimResult?: boolean;
      maxLength?: number;
      ellipsis?: string;
    } = {}
  ): string => {
    // Default options
    const {
      preserveLineBreaks = true,
      preserveWhitespace = false,
      decodeEntities = true,
      trimResult = true,
      maxLength = 0,
      ellipsis = '...'
    } = options;
  
    // If no content, return empty string
    if (!htmlContent) {
      return '';
    }
  
    let text = htmlContent;
  
    // First handle line breaks if we want to preserve them
    if (preserveLineBreaks) {
      // Replace <br>, <p>, <div> etc. with newlines before stripping tags
      text = text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>\s*<p/gi, '\n\np')
        .replace(/<\/(div|p|h[1-6]|blockquote|li)>/gi, '\n')
        .replace(/<hr\s*\/?>/gi, '\n---\n');
    }
  
    // Decode HTML entities if requested
    if (decodeEntities) {
      const entityMap: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' ',
        '&copy;': '©',
        '&reg;': '®',
        '&euro;': '€',
        '&pound;': '£',
        '&yen;': '¥',
        '&cent;': '¢',
      };
      
      text = text.replace(/&[#a-z0-9]+;/gi, match => {
        return entityMap[match] || match;
      });
    }
  
    // Remove all HTML tags
    text = text.replace(/<[^>]*>/g, '');
  
    // Handle whitespace based on options
    if (!preserveWhitespace) {
      // Normalize whitespace - replace multiple spaces with single space
      text = text.replace(/\s+/g, ' ');
    }
  
    // Trim result if requested
    if (trimResult) {
      text = text.trim();
    }
  
    // Limit text length if maxLength is set
    if (maxLength > 0 && text.length > maxLength) {
      text = text.substring(0, maxLength) + ellipsis;
    }
  
    return text;
  };
  
  export default convertHtmlToText;