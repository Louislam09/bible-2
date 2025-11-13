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

// export const sanitizeHTML = (html: string) => {
//   return `<p />${html}`
//     .replace(/<br\s*\/?>/gi, "<p />")
//     .trim();
// }
export const sanitizeHTML = (html: string) => {
  const isFirstTag = html.trim().startsWith('<');
  return (
    `${!isFirstTag ? '<p />' : ''}${html}`
      // 🧹 Remove empty tags like <div></div> or <p> </p>
      .replace(/<(\w+)[^>]*>\s*<\/\1>/g, "<$1 />")

      // 🪄 Replace <br> with <p /> (you can adjust this if Lexical prefers <br/>)
      .replace(/<br\s*\/?>/gi, "<p />")

      // 🩶 Add <p /> before any <b> not preceded by <p> or <div>
      .replace(/(?<!<\/?(?:p|div)[^>]*>)\s*<b>/gi, "<p /><b>")

      // 🧱 Wrap stray text nodes (like: </div>Text<div>)
      .replace(/(^|<\/div>|<\/p>)([^<]+)(?=<div|<p|$)/gi, (match, before, text) => {
        const cleanText = text.trim();
        return cleanText ? `${before}<div>${cleanText}</div>` : before;
      })

      // 🧩 Fix invalid nesting like <b><div>...</div></b>
      //    Move the <div> out of the <b> tag for valid structure.
      .replace(/<b([^>]*)>\s*(<div[^>]*>[\s\S]*?<\/div>)\s*<\/b>/gi, "$2")

      // 🧩 Also handle cases like <b><h2>...</h2></b> → <h2><b>...</b></h2>
      .replace(/<b([^>]*)>\s*(<h\d[^>]*>[\s\S]*?<\/h\d>)\s*<\/b>/gi, "$2")

      // ✨ Optional: collapse multiple <p /> in a row → single <p />
      .replace(/(?:<p\s*\/>\s*){2,}/gi, "<p />")

      .trim()
  );
};

export const sanitizeHTML2 = (html: string) => {
  return (
    `<p />${html}`
      // Convert <br> or <br/> into <p />
      .replace(/<br\s*\/?>/gi, "<p />")
      // Add <p /> before standalone inline tags (<b>, <i>, <u>, <strong>, <em>, <span>)
      // if they are not already preceded by <p>, <div>, <ul>, <ol>, or <li>
      .replace(
        /(?<!<\/?(?:p|div|ul|ol|li)[^>]*>)\s*<(b|i|u|strong|em|span)[^>]*>/gi,
        "<p /><$1>"
      )
      .trim()
  );
};

export default convertHtmlToText;