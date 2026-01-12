import { storedData$ } from "@/context/LocalstoreContext";
import { getFontCss } from "@/hooks/useLoadFonts";
import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TTheme } from "@/types";

interface WordDefinitionTemplateProps {
    content: string;
    topic: string;
    theme: TTheme;
    fontSize?: number;
    isPrint?: boolean;
    mainColor?: string;
}

export const wordDefinitionHtmlTemplate = ({
    content,
    topic,
    theme,
    fontSize = 16,
    isPrint = false,
    mainColor = "",
}: WordDefinitionTemplateProps): string => {
    const { colors, dark: isDark } = theme;
    const themeSchema = isDark ? 'dark' : 'light';
    const accentColor = mainColor

    // Process content to enhance formatting
    const processedContent = content
        ?.replace(/<b>(.*?)<\/b>/g, '<h3 class="section-heading">$1</h3>')
        || '';

    const printStyles = isPrint ? `
        @page { 
            size: A4; 
            margin: 20mm; 
        }
        body {
            font-size: 14pt !important;
            background: white !important;
            color: #1a1a1a !important;
        }
        .section-heading {
            color: ${mainColor} !important;
        }
        a {
            color: ${mainColor} !important;
        }
    ` : '';

    return `
        <!DOCTYPE html>
        <html data-theme="${themeSchema}" lang="es">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>${topic || 'Definición'}</title>
            ${scriptDownloadHelpers.getTailwindScript()}
            ${getTailwindStyleTag({ theme, fontSize })}
            ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
            
            <style>
                * {
                    font-family: system-ui, -apple-system, sans-serif;
                    box-sizing: border-box;
                }
                
                html, body {
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                    max-width: 100vw;
                }
                
                body {
                    color: ${colors.text};
                    background: ${isPrint ? 'white' : colors.background};
                    font-size: ${isPrint ? '14pt' : (fontSize) + 'px'};
                    line-height: 1.7;
                    -webkit-font-smoothing: antialiased;
                    user-select: none;
                    -webkit-user-select: none;
                    padding: 16px;
                    padding-bottom: 100px;
                }
                
                /* Section headings */
                .section-heading {
                    text-transform: uppercase;
                    color: ${accentColor};
                    font-size: 0.85em;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    margin-top: 24px;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid ${accentColor}30;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .section-heading::before {
                    content: '';
                    width: 4px;
                    height: 16px;
                    background: ${accentColor};
                    border-radius: 2px;
                    flex-shrink: 0;
                }
                
                /* Paragraph styling */
                p {
                    color: ${colors.text};
                    margin: 12px 0;
                    text-align: justify;
                }
                
                /* Bible reference links */
                a {
                    color: ${accentColor};
                    text-decoration: none;
                    font-weight: 500;
                    background: ${accentColor}15;
                    padding: 2px 8px;
                    border-radius: 6px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                
                a:active {
                    transform: scale(0.97);
                    background: ${accentColor}25;
                }
                
                a::after {
                    content: '';
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%23cec8ff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25'/%3E%3C/svg%3E");
                    background-size: contain;
                    background-repeat: no-repeat;
                    flex-shrink: 0;
                }
                
                /* First paragraph styling */
                body > p:first-of-type {
                    font-size: 1.05em;
                }
                
                /* Blockquote styling for emphasis */
                blockquote {
                    margin: 16px 0;
                    padding: 12px 16px;
                    border-left: 3px solid ${accentColor};
                    background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
                    border-radius: 0 8px 8px 0;
                    font-style: italic;
                }
                
                /* Strong/bold text */
                strong, b {
                    color: ${accentColor};
                    font-weight: 600;
                }
                
                /* Lists */
                ul, ol {
                    padding-left: 20px;
                    margin: 12px 0;
                }
                
                li {
                    margin: 8px 0;
                    line-height: 1.6;
                }
                
                li::marker {
                    color: ${accentColor};
                }
                
                ${printStyles}
            </style>
        </head>
        <body class="text-theme-text bg-theme-background">
            <article class="definition-content">
                ${processedContent}
            </article>
        </body>
        </html>
    `;
};

// Legacy function signature for backward compatibility
export const wordDefinitionHtmlTemplateLegacy = (
    content: any,
    colors: any,
    fontSize: any,
    isPrint: boolean = false
) => {
    return wordDefinitionHtmlTemplate({
        content: content || '',
        topic: '',
        theme: { colors, dark: colors.background !== '#ffffff' } as TTheme,
        fontSize,
        isPrint,
    });
};
