import { TTheme } from "@/types";
import { DB_BOOK_CHAPTER_NUMBER, DB_BOOK_NAMES, DB_BOOK_CHAPTER_VERSES } from "./constants/BookNames";

// Helper functions
const abbr = (name: string) => name.replace(/\s+/g, "").slice(0, 3);

// CSS Styles
const chooseReferenceStyles = (theme: TTheme) => `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, ".SFNSText-Regular", sans-serif;
      font-weight: 500;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: ${theme.colors.background};
      color: ${theme.colors.text};
      height: 100vh;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    .container {
      width: 100%;
      height: 100vh;
      background-color: ${theme.colors.background};
      color: ${theme.colors.text};
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .max-width-container {
      max-width: 1024px;
      margin: 0 auto;
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 8px;
    }

    .title {
      font-size: 20px;
      font-weight: 600;
      color: ${theme.colors.text};
      opacity: 0.9;
    }

    .back-button {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid ${theme.colors.text}40;
      color: ${theme.colors.text};
      font-size: 15px;
      background: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 0.8;
      transform: scale(1);
      align-self: flex-end;
    }

    .back-button:hover {
      opacity: 1;
      background-color: ${theme.colors.primary}20;
      border-color: ${theme.colors.primary}60;
      transform: translateX(-2px) scale(1.02);
    }

    .section {
      padding: 4px;
      background: transparent;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      transition: all 0.3s ease-in-out;
      opacity: 1;
      transform: translateX(0);
    }

    .section.hidden {
      opacity: 0;
      transform: translateX(-20px);
      pointer-events: none;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      background-color: ${theme.colors.background};
    }

    .section-title {
      font-size: 17px;
      font-weight: 600;
      color: ${theme.colors.text};
      opacity: 0.8;
    }

    .section-divider {
      height: 2px;
      width: 100%;
      opacity: 0.4;
      margin: 8px 0;
      border-radius: 1px;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 12px;
      max-height: none;
      overflow: visible;
    }

    @media (min-width: 640px) {
      .books-grid {
        grid-template-columns: repeat(6, 1fr);
      }
    }

    @media (min-width: 768px) {
      .books-grid {
        grid-template-columns: repeat(8, 1fr);
      }
    }

    .book-button {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid ${theme.colors.text}70;
      font-size: 18px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: ${theme.colors.background};
      color: ${theme.colors.text};
      opacity: 0.9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: scale(1);
      animation: fadeInUp 0.4s ease forwards;
    }

    .book-button:hover {
      opacity: 1;
      color: ${theme.colors.text};
      background-color: ${theme.colors.primary}20;
      border-color: ${theme.colors.primary}80;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px) scale(1.02);
    }

    .book-button.selected {
      opacity: 1;
      color: ${theme.colors.text};
      background-color: ${theme.colors.notification}40;
      border-color: ${theme.colors.notification};
      box-shadow: 0 4px 12px ${theme.colors.notification}30;
      transform: translateY(-2px) scale(1.05);
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    @keyframes fadeInUp {
      0% {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      100% {
        opacity: 0.9;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes slideInFromLeft {
      0% {
        opacity: 0;
        transform: translateX(-30px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideInFromRight {
      0% {
        opacity: 0;
        transform: translateX(30px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .chapters-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      place-items: center;
      max-height: none;
      overflow: visible;
    }

    @media (min-width: 640px) {
      .chapters-grid {
        grid-template-columns: repeat(8, 1fr);
      }
    }

    @media (min-width: 768px) {
      .chapters-grid {
        grid-template-columns: repeat(10, 1fr);
      }
    }

    .chapter-button {
      color: ${theme.colors.text};
      width: 100%;
      height: 44px;
      text-align: center;
      border-radius: 6px;
      border: 1px solid ${theme.colors.text}60;
      font-size: 17px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: ${theme.colors.background};
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.9;
      transform: scale(1);
      animation: fadeInUp 0.4s ease forwards;
    }

    .chapter-button:hover {
      opacity: 1;
      background-color: ${theme.colors.primary}20;
      border-color: ${theme.colors.primary}60;
      transform: translateY(-1px) scale(1.02);
    }

    .chapter-button.selected {
      opacity: 1;
      background-color: ${theme.colors.notification}30;
      border-color: ${theme.colors.notification}80;
      transform: translateY(-1px) scale(1.03);
    }

    .verses-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      max-height: none;
      overflow: visible;
    }

    @media (min-width: 640px) {
      .verses-grid {
        grid-template-columns: repeat(10, 1fr);
      }
    }

    @media (min-width: 768px) {
      .verses-grid {
        grid-template-columns: repeat(12, 1fr);
      }
    }

    .verse-button {
      color: ${theme.colors.text};
      width: 100%;
      height: 44px;
      text-align: center;
      border-radius: 6px;
      border: 1px solid ${theme.colors.text}60;
      font-size: 17px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: ${theme.colors.background};
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.9;
      transform: scale(1);
      animation: fadeInUp 0.4s ease forwards;
    }

    .verse-button:hover {
      opacity: 1;
      background-color: ${theme.colors.primary}20;
      border-color: ${theme.colors.primary}60;
      transform: translateY(-1px) scale(1.02);
    }

    .verse-button.selected {
      opacity: 1;
      background-color: ${theme.colors.notification}30;
      border-color: ${theme.colors.notification}80;
      transform: translateY(-1px) scale(1.03);
    }

    .placeholder-text {
      font-size: 15px;
      opacity: 0.6;
      padding: 12px 16px;
      border-radius: 6px;
      border: 1px solid ${theme.colors.text}30;
      background-color: ${theme.colors.background};
      text-align: center;
      margin: 8px 0;
    }

    .hidden {
      display: none !important;
    }

    .icon {
      width: 14px;
      height: 14px;
      display: inline-block;
      opacity: 0.7;
      color: ${theme.colors.notification};
    }

    .icon-hash::before {
      content: "#";
      font-weight: normal;
    }

    /* Minimal scrollbar styling */
    .container::-webkit-scrollbar {
      width: 4px;
    }

    .container::-webkit-scrollbar-track {
      background: transparent;
    }

    .container::-webkit-scrollbar-thumb {
      background: ${theme.colors.notification}40;
      border-radius: 2px;
    }

    .container::-webkit-scrollbar-thumb:hover {
      background: ${theme.colors.notification}60;
    }

    .section::-webkit-scrollbar {
      width: 3px;
    }

    .section::-webkit-scrollbar-track {
      background: transparent;
    }

    .section::-webkit-scrollbar-thumb {
      background: ${theme.colors.primary}30;
      border-radius: 2px;
    }

    .section::-webkit-scrollbar-thumb:hover {
      background: ${theme.colors.primary}50;
    }
  </style>
`;

// HTML structure functions
const createHtmlHead = (theme: TTheme) => `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seleccionar Referencia</title>
    ${chooseReferenceStyles(theme)}
  </head>
`;

const createBookButton = (book: any, theme: TTheme, isSelected: boolean = false, index: number = 0) => `
  <button 
    class="book-button ${isSelected ? 'selected' : ''}" 
    title="${book.longName}"
    onclick="selectBook('${book.longName}', '${book.bookColor}')"
    style="animation-delay: ${index * 0.02}s;"
  >
    ${abbr(book.longName)}
  </button>
`;

const createBooksSection = (books: any[], theme: TTheme, selectedBook?: string) => `
  <div class="section-header">
    <h3 class="section-title">${books[0]?.bookNumber < 400 ? 'Antiguo Pacto' : 'Nuevo Pacto'}</h3>
  </div>
  <div class="section-divider"></div>
  <div class="books-grid">
    ${books.map((book, index) => createBookButton(book, theme, book.longName === selectedBook, index)).join('')}
  </div>
`;

const createHtmlBody = (
    theme: TTheme,
    initialBook?: string,
    initialChapter?: number,
    initialVerse?: number
) => {
    const oldTestamentBooks = DB_BOOK_NAMES.slice(0, 39);
    const newTestamentBooks = DB_BOOK_NAMES.slice(39);

    // Always start at book selection step (step 0)
    const currentStep = 0;

    return `
    <body>
      <div class="container">
        <div class="max-width-container">
          <div class="header">
            <button id="backButton" class="back-button ${currentStep === 0 ? 'hidden' : ''}" onclick="goBack()">
              Atrás
            </button>
          </div>

          <!-- Book Selection Step -->
          <div id="bookStep" class="section ${currentStep !== 0 ? 'hidden' : ''}">
            ${createBooksSection(oldTestamentBooks, theme, initialBook)}
            ${createBooksSection(newTestamentBooks, theme, initialBook)}
          </div>

          <!-- Chapter Selection Step -->
          <div id="chapterStep" class="section hidden">
            <!-- Chapters will be populated when a book is selected -->
          </div>

          <!-- Verse Selection Step -->
          <div id="verseStep" class="section hidden">
            <!-- Verses will be populated when a chapter is selected -->
          </div>
        </div>
      </div>

      <script>
        // State management
        let currentStep = 0; // Always start at book selection
        let selectedBook = null;
        let selectedChapter = null;
        let selectedVerse = null;
        
        // Store initial values for potential use
        const initialValues = {
          book: ${initialBook ? `'${initialBook}'` : 'null'},
          chapter: ${initialChapter || 'null'},
          verse: ${initialVerse || 'null'}
        };

        // Book data
        const DB_BOOK_NAMES = ${JSON.stringify(DB_BOOK_NAMES)};
        const DB_BOOK_CHAPTER_NUMBER = ${JSON.stringify(DB_BOOK_CHAPTER_NUMBER)};
        const DB_BOOK_CHAPTER_VERSES = ${JSON.stringify(DB_BOOK_CHAPTER_VERSES)};

        function selectBook(bookName, bookColor) {
          selectedBook = bookName;
          selectedChapter = null;
          selectedVerse = null;
          
          // Update UI - remove selected class from all buttons
          document.querySelectorAll('.book-button').forEach(btn => {
            btn.classList.remove('selected');
          });
          
          // Add selected class to clicked button
          event.target.classList.add('selected');
          
          // Setup chapters first, then move to chapter selection
          setupChapters();
          goToStep(1);
        }

        function selectChapter(chapter) {
          selectedChapter = chapter;
          selectedVerse = null;
          
          // Update UI
          document.querySelectorAll('.chapter-button').forEach(btn => {
            btn.classList.remove('selected');
          });
          
          event.target.classList.add('selected');
          
          // Auto-confirm chapter selection and move to verse selection
          goToStep(2);
          
          // Notify parent (if in webview)
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'chapterSelected',
              data: {
                book: selectedBook,
                chapter: chapter,
                verse: 1,
                goHome: false
              }
            }));
          }
        }

        function selectVerse(verse) {
          selectedVerse = verse;
          
          // Update UI
          document.querySelectorAll('.verse-button').forEach(btn => {
            btn.classList.remove('selected');
          });
          
          event.target.classList.add('selected');
          
          // Notify parent (if in webview)
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'verseSelected',
              data: {
                book: selectedBook,
                chapter: selectedChapter,
                verse: verse,
                goHome: true
              }
            }));
          }
        }

        function goToStep(step) {
          currentStep = step;
          
          // Hide all steps
          document.getElementById('bookStep').classList.toggle('hidden', step !== 0);
          document.getElementById('chapterStep').classList.toggle('hidden', step !== 1);
          document.getElementById('verseStep').classList.toggle('hidden', step !== 2);
          
          // Show/hide back button
          document.getElementById('backButton').classList.toggle('hidden', step === 0);
          
          if (step === 1) {
            setupChapters();
          } else if (step === 2) {
            setupVerses();
          }
        }

        function setupChapters() {
          if (!selectedBook) return;
          
          const chapterCount = DB_BOOK_CHAPTER_NUMBER[selectedBook];
          if (!chapterCount) {
            console.error('No chapter count found for book:', selectedBook);
            return;
          }
          
          // Create the chapter section HTML
          const chapterSection = document.getElementById('chapterStep');
          if (!chapterSection) return;
          
          chapterSection.innerHTML = \`
            <div class="section-header">
              <span class="icon icon-hash"></span>
              <h3 class="section-title">Capítulo</h3>
            </div>
            <div class="section-divider"></div>
            <div class="chapters-grid">
              \${Array.from({ length: chapterCount }, (_, i) => \`
                <button class="chapter-button" onclick="selectChapter(\${i + 1})" style="animation-delay: \${i * 0.02}s;">
                  \${i + 1}
                </button>
              \`).join('')}
            </div>
          \`;
        }

        function setupVerses() {
          if (!selectedChapter || !selectedBook) return;
          
          // Get the actual verse count from DB_BOOK_CHAPTER_VERSES
          const bookData = DB_BOOK_NAMES.find(book => book.longName === selectedBook);
          if (!bookData) return;
          
          const verseData = DB_BOOK_CHAPTER_VERSES.find(
            verse => verse.bookNumber === bookData.bookNumber && verse.chapterNumber === selectedChapter
          );
          
          const verseCount = verseData ? verseData.verseCount : 30; // fallback to 30 if not found
          
          // Create the verse section HTML
          const verseSection = document.getElementById('verseStep');
          if (!verseSection) return;
          
          verseSection.innerHTML = \`
            <div class="section-header">
              <span class="icon icon-hash"></span>
              <h3 class="section-title">Versículo</h3>
            </div>
            <div class="section-divider"></div>
            <div class="verses-grid">
              \${Array.from({ length: verseCount }, (_, i) => \`
                <button class="verse-button" onclick="selectVerse(\${i + 1})" style="animation-delay: \${i * 0.02}s;">
                  \${i + 1}
                </button>
              \`).join('')}
            </div>
          \`;
        }

        function goBack() {
          if (currentStep > 0) {
            goToStep(currentStep - 1);
          }
        }

        // Listen for messages from React Native (if in webview)
        if (window.ReactNativeWebView) {
          window.addEventListener('message', (event) => {
            try {
              const data = JSON.parse(event.data);
              handleMessage(data);
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          });
        }

        function handleMessage(data) {
          switch (data.type) {
            case 'setTheme':
              // Handle theme changes if needed
              break;
            case 'setInitialValues':
              // Store initial values but don't change current step
              // User still needs to go through the flow: book -> chapter -> verse
              if (data.book) initialValues.book = data.book;
              if (data.chapter) initialValues.chapter = data.chapter;
              if (data.verse) initialValues.verse = data.verse;
              break;
            case 'resetToBookSelection':
              // Reset to book selection step
              currentStep = 0;
              selectedBook = null;
              selectedChapter = null;
              selectedVerse = null;
              goToStep(0);
              break;
          }
        }
      </script>
    </body>
  `;
};

// Main template function
type TChooseReferenceTemplateProps = {
    theme: TTheme;
    initialBook?: string;
    initialChapter?: number;
    initialVerse?: number;
};

export const chooseReferenceHtmlTemplate = ({
    theme,
    initialBook,
    initialChapter,
    initialVerse,
}: TChooseReferenceTemplateProps) => {
    return `
    <!DOCTYPE html>
    <html lang="es">
      ${createHtmlHead(theme)}
      ${createHtmlBody(theme, initialBook, initialChapter, initialVerse)}
    </html>
  `;
};
