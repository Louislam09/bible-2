import { IBookVerse, TTheme, TFont } from "@/types";
import { parseText, parseGreekText, mergeTexts } from "@/utils/interleanerHelper";
import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { getFontCss } from "@/hooks/useLoadFonts";
import { storedData$ } from "@/context/LocalstoreContext";
import { bibleState$ } from "@/state/bibleState";

const NT_BOOK_NUMBER = 470;

const interlinearStyles = (theme: TTheme, fontSize: number) => `
    <style>
        :root {
            --color-primary: ${theme.colors.primary};
            --color-text: ${theme.colors.text};
            --color-notification: ${theme.colors.notification};
            --color-background: ${theme.colors.background};
            --color-card: ${theme.colors.card};
        }

        body {
            background-color: var(--color-background);
            color: var(--color-text);
            font-family: system-ui, -apple-system, sans-serif;
        }
        
        /* Dynamic font sizes */
        .text-xs-dynamic { font-size: ${fontSize}px; line-height: 1.2; }
        .text-sm-dynamic { font-size: ${fontSize + 2}px; line-height: 1.2; }
        .text-lg-dynamic { font-size: ${fontSize + 7}px; line-height: 1.3; }

        .font-hebrew {
            font-family: '${TFont.NotoSansHebrew}', serif;
        }
    </style>
`;

const renderHebrewVerse = (item: IBookVerse, topVerses: IBookVerse[]) => {
    // Use topVerses to get Strong's data if available
    const verseWithStrong = topVerses?.[item.verse - 1];
    const mergeText = mergeTexts(verseWithStrong?.text || "", item.text);
    const segments = parseText(mergeText);

    return `
        <div class="flex flex-col items-end justify-end px-4 py-2 w-full">
             <div class="flex flex-row-reverse flex-wrap gap-2 p-1 justify-start w-full">
                 ${segments.map((segment, index) => `
                    <div class="flex flex-col items-end justify-end pr-2 mb-2 relative min-w-[40px] cursor-pointer" 
                         onclick="handleStrongPress('${segment.strong || ''}', '${segment.hebrew.replace(/'/g, "\\'")}', 'H')">
                        
                        ${index === 0 ? `
                            <div class="text-lg-dynamic text-theme-notification font-bold decoration-theme-notification mb-1 text-right">
                                ${item.verse}
                            </div>
                        ` : ''}
                        
                        <div class="text-font-base font-bold text-theme-primary text-right w-full mb-1">
                            ${segment.strong}
                        </div>
                        
                        <div class="text-font-base italic text-theme-text font-bold text-right lowercase w-full mb-1">
                            ${segment.translit}
                        </div>
                        
                        <div class="text-font-5xl font-bold text-theme-text text-right mb-1 font-hebrew" dir="rtl">
                            ${segment.hebrew}
                        </div>
                        
                        <div class="text-font-xl text-theme-notification text-right w-full mb-1 flex-wrap">
                            ${segment.spanish || segment.english || "-"}
                        </div>
                    </div>
                 `).join('')}
             </div>
        </div>
    `;
};

const renderGreekVerse = (item: IBookVerse) => {
    const segments = parseGreekText(item.text);

    return `
        <div class="flex flex-col items-end justify-end px-4 py-2 w-full">
             <div class="flex flex-row flex-wrap gap-2 p-1 justify-start w-full">
                 <div class="text-lg-dynamic text-theme-notification font-bold underline decoration-theme-notification mr-2">
                    ${item.verse}
                 </div>
                 ${segments.map(segment => `
                    <div class="flex flex-col items-start justify-start pr-2 mb-2 relative min-w-[40px] cursor-pointer" 
                         onclick="handleStrongPress('${segment.strong || ''}', '${segment.greek.replace(/'/g, "\\'")}', 'G')">
                        <div class="text-font-base font-bold text-theme-primary text-left w-full mb-1">
                            ${segment.strong}
                        </div>

                        <div class="text-font-5xl font-bold text-theme-text text-left mb-1 font-hebrew">
                            ${segment.greek}
                        </div>
                        
                        <div class="text-font-2xl text-theme-notification text-left w-full mb-1 flex-wrap">
                            ${segment.spanish || "-"}
                        </div>
                    </div>
                 `).join('')}
             </div>
        </div>
    `;
};

export const interlinearChapterHtmlTemplate = ({
    data,
    theme,
    fontSize,
    topVerses
}: {
    data: IBookVerse[];
    theme: TTheme;
    fontSize: number;
    topVerses: IBookVerse[];
}) => {
    const chapterNumber = data[0]?.chapter || 1;
    const themeSchema = theme.dark ? 'dark' : 'light';
    const showReadingTime = storedData$.showReadingTime.get();

    // Generate content
    const content = data.map(item => {
        const isNewCovenant = item.book_number >= NT_BOOK_NUMBER;
        return isNewCovenant ? renderGreekVerse(item) : renderHebrewVerse(item, topVerses);
    }).join('');

    return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Interlinear Chapter ${chapterNumber}</title>
         ${scriptDownloadHelpers.getTailwindScript()}
      
        ${getTailwindStyleTag({ theme, fontSize: 16 })}
        ${getFontCss({ fontName: TFont.NotoSansHebrew })}
        ${interlinearStyles(theme, fontSize)}
    </head>
    <body class="p-0 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden pb-24 pt-12">
        <div id="chapterContainer" class="w-full">
            <div class="px-4 pt-3 my-2">
                <h1 class="font-bold text-theme-text text-center text-3xl">Capítulo ${chapterNumber}</h1>
                <p class="text-theme-text text-center text-xs mt-1 ${showReadingTime ? 'block' : 'hidden'}">Tiempo de lectura: ~ ${bibleState$.readingTimeData.top.get()} min(s)</p>
            </div>
           ${content}
        </div>

        <script>
            // Handle strong press
            function handleStrongPress(strong, text, cognate) {
                if (!strong) return;
                
                // Prepare data for React Native
                const addCognate = (tagValue) => 
                    tagValue.split(",")
                    .map(code => \`\${cognate}\${code}\`)
                    .join(",");
                
                const searchCode = addCognate(strong);
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'strongWordClick',
                    data: {
                        text: text,
                        code: searchCode
                    }
                }));
            }

            window.addEventListener('scroll', function(event) {
                 // Similar to WebViewChapter if needed
            });

        </script>
    </body>
    </html>
    `;
};
