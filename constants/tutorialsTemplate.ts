import { TTheme } from "@/types";
import { TUTORIAL_FEATURES, TUTORIAL_CATEGORIES, getDifficultyLabel, getDifficultyColor } from "@/constants/tutorialData";
import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { getFontCss } from "@/hooks/useLoadFonts";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";

// Styles for the tutorials page
const tutorialsStyles = (theme: TTheme, fontSize: number = 16, selectedFont?: string) => {
  return `
    ${getFontCss({ fontName: selectedFont || '' })}
    <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body, .header, .progress-card, .categories-container {
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background-color: ${theme.colors.background};
      color: ${theme.colors.text};
      overflow-x: hidden;
      padding: 16px;
      padding-bottom: 32px;
    }

    .header {
      margin-bottom: 16px;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .header-title {
      font-size: 28px;
      font-weight: 800;
      color: ${theme.colors.text};
      margin-bottom: 4px;
    }

    .header-subtitle {
      font-size: 15px;
      color: ${theme.colors.text}80;
    }

    .progress-card {
      background-color: ${theme.colors.card};
      padding: 16px;
      border-radius: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 16px;
    }

    .progress-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .progress-icon {
      width: 24px;
      height: 24px;
      margin-right: 12px;
    }

    .progress-info {
      flex: 1;
    }

    .progress-title {
      font-size: 16px;
      font-weight: 700;
      color: ${theme.colors.text};
      margin-bottom: 2px;
    }

    .progress-subtitle {
      font-size: 13px;
      color: ${theme.colors.text}80;
    }

    .progress-percentage {
      font-size: 24px;
      font-weight: 800;
      color: #4CAF50;
    }

    .progress-bar-container {
      height: 8px;
      background-color: ${theme.colors.background};
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background-color: #4CAF50;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .categories-container {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 16px 0;
      margin-bottom: 12px;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .categories-container::-webkit-scrollbar {
      display: none;
    }

    .category-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 20px;
      border: 1px solid ${theme.colors.border};
      background-color: ${theme.colors.card};
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .category-chip.selected {
      border-color: var(--category-color);
      background-color: var(--category-color-light);
    }

    .category-chip:active {
      transform: scale(0.95);
    }

    .category-icon {
      width: 18px;
      height: 18px;
    }

    .category-label {
      font-size: 14px;
      font-weight: 600;
      color: ${theme.colors.text}80;
    }

    .category-chip.selected .category-label {
      color: var(--category-color);
    }

    .tutorials-section {
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: ${theme.colors.text};
      margin-bottom: 4px;
    }

    .section-subtitle {
      font-size: 13px;
      color: ${theme.colors.text}80;
    }

    .featured-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      margin-bottom: 4px;
    }

    .featured-icon {
      width: 14px;
      height: 14px;
      color: #FFD700;
    }

    .featured-text {
      font-size: 12px;
      font-weight: 700;
      color: #FFD700;
    }

    .tutorial-card {
      background-color: ${theme.colors.card};
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), 
                  opacity 0.3s ease-out, 
                  box-shadow 0.3s ease-out,
                  filter 0.3s ease-out;
      position: relative;
      overflow: hidden;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      will-change: transform, opacity;
      transform-style: preserve-3d;
      perspective: 1000px;
    }

    .tutorial-card:active {
      transform: scale(0.96) !important;
      opacity: 0.75 !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12) !important;
      transition: transform 0.15s cubic-bezier(0.22, 1, 0.36, 1), 
                  opacity 0.15s ease-in, 
                  box-shadow 0.15s ease-in;
    }

    .tutorial-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .tutorial-icon-container {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .tutorial-icon {
      width: 24px;
      height: 24px;
    }

    .tutorial-info {
      flex: 1;
    }

    .tutorial-title {
      font-size: 17px;
      font-weight: 700;
      color: ${theme.colors.text};
      margin-bottom: 4px;
    }

    .tutorial-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tutorial-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }

    .difficulty-badge {
      background-color: var(--difficulty-color)20;
      color: var(--difficulty-color);
    }

    .duration-badge {
      background-color: ${theme.colors.text}10;
      color: ${theme.colors.text}80;
    }

    .tutorial-description {
      font-size: 14px;
      color: ${theme.colors.text}99;
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .tutorial-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tutorial-steps {
      font-size: 13px;
      color: ${theme.colors.text}80;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .completed-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 12px;
      background-color: #4CAF5020;
      color: #4CAF50;
      font-size: 12px;
      font-weight: 600;
    }

    .completed-icon {
      width: 14px;
      height: 14px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      color: ${theme.colors.text}40;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 16px;
      color: ${theme.colors.text}80;
    }

    .hidden {
      display: none !important;
    }

    /* Lazy load animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    .tutorial-card {
      opacity: 0;
      animation: fadeInUp 0.4s ease-out forwards;
    }

    .featured-badge {
      opacity: 0;
      animation: fadeIn 0.3s ease-out forwards;
    }

    .progress-card {
      opacity: 0;
      animation: fadeIn 0.3s ease-out 0.1s forwards;
    }

    .categories-container {
      opacity: 0;
      animation: fadeIn 0.3s ease-out 0.2s forwards;
    }

    .tutorials-section {
      opacity: 0;
      animation: fadeIn 0.3s ease-out 0.3s forwards;
    }
  </style>
`;
};

// HTML structure
const createHtmlHead = (theme: TTheme, fontSize: number = 16, selectedFont?: string) => `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Tutoriales</title>
    ${scriptDownloadHelpers.getTailwindScript()}
    ${getTailwindStyleTag({ theme, fontSize })}
    ${tutorialsStyles(theme, fontSize, selectedFont)}
  </head>
`;

const createHtmlBody = (theme: TTheme, completedTutorials: string[]) => {
  const total = TUTORIAL_FEATURES.length;
  const completed = completedTutorials.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return `
    <body class="p-0 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden">
      <!-- Header Section -->
      <div class="header">
        <div class="header-top">
          <div>
            <div class="header-title">Aprende a usar la app</div>
            <div class="header-subtitle !text-theme-text">Domina todas las funciones paso a paso</div>
          </div>
        </div>

        <!-- Progress Card -->
        <div class="progress-card">
          <div class="progress-header">
            <svg class="progress-icon" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
              <circle cx="12" cy="8" r="6"/>
              <path d="M8.5 14.5l-2.5 2.5-1.5-1.5"/>
              <path d="M12 14v7"/>
              <path d="M7 21h10"/>
            </svg>
            <div class="progress-info">
              <div class="progress-title">Tu Progreso</div>
              <div class="progress-subtitle !text-theme-text">${completed} de ${total} completados</div>
            </div>
            <div class="progress-percentage">${Math.round(percentage)}%</div>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" id="progressBar" style="width: ${percentage}%"></div>
          </div>
        </div>
      </div>

      <!-- Category Filters -->
      <div class="categories-container" id="categoriesContainer">
        <div class="category-chip selected" data-category="all" onclick="selectCategory('all', '${theme.colors.notification}')" style="--category-color: ${theme.colors.notification}; --category-color-light: ${theme.colors.notification}20;">
          <svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="${theme.colors.notification}" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span class="category-label">Todos</span>
        </div>
        ${Object.entries(TUTORIAL_CATEGORIES).map(([key, category]) => `
          <div class="category-chip" data-category="${key}" onclick="selectCategory('${key}', '${category.color}')" style="--category-color: ${category.color}; --category-color-light: ${category.color}20;">
            <span class="category-label">${category.name}</span>
          </div>
        `).join('')}
      </div>

      <!-- Tutorials Section Header -->
      <div class="tutorials-section">
        <div class="section-title" id="sectionTitle">Todos los tutoriales</div>
        <div class="section-subtitle !text-theme-texts" id="sectionSubtitle">${TUTORIAL_FEATURES.length} tutoriales</div>
      </div>

      <!-- Tutorials List -->
      <div id="tutorialsList">
        <!-- Tutorials will be loaded dynamically -->
      </div>
      
      <!-- Loading indicator -->
      <div id="loadingIndicator" style="display: none;">
        <div class="flex items-center justify-center py-6 px-4">
          <div class="flex items-center gap-2">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-theme-notification border-t-transparent"></div>
            <span class="text-theme-text/70 text-font-sm">Cargando más tutoriales...</span>
          </div>
        </div>
      </div>

      <!-- Empty State (hidden by default) -->
      <div class="empty-state hidden" id="emptyState">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <div class="empty-text">No hay tutoriales en esta categoría</div>
      </div>

      <script>
        let currentCategory = 'all';
        let completedTutorials = ${JSON.stringify(completedTutorials)};
        const tutorials = ${JSON.stringify(TUTORIAL_FEATURES)};
        const categories = ${JSON.stringify(TUTORIAL_CATEGORIES)};
        const difficultyColors = ${JSON.stringify(TUTORIAL_FEATURES.reduce((acc, t) => ({ ...acc, [t.difficulty]: getDifficultyColor(t.difficulty) }), {}))};
        const difficultyLabels = ${JSON.stringify(TUTORIAL_FEATURES.reduce((acc, t) => ({ ...acc, [t.difficulty]: getDifficultyLabel(t.difficulty) }), {}))};
        
        let loadedCount = 0;
        const INITIAL_LOAD = 3; // Reduced from 5 for faster initial render
        const BATCH_SIZE = 4; // Increased from 3 for faster subsequent loads
        let animationDelay = 0;
        
        // Function to create tutorial card HTML
        function createTutorialCard(tutorial, index) {
          const isFeatured = tutorial.id === "home-screen-tour";
          const isCompleted = completedTutorials.includes(tutorial.id);
          
          const featuredBadge = isFeatured ? \`
            <div class="featured-badge" style="animation-delay: \${animationDelay}s;">
              <svg class="featured-icon !text-theme-notification" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span class="featured-text !text-theme-notification">Recomendado</span>
            </div>
          \` : '';
          
          const completedBadge = isCompleted ? \`
            <div class="completed-badge">
              <svg class="completed-icon" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Completado</span>
            </div>
          \` : '';
          
          // Stagger animation for each card
          const cardDelay = animationDelay;
          animationDelay += 0.08; // Increment delay for next card
          
          return \`
            \${featuredBadge}
            <div class="tutorial-card border-2 border-[\${tutorial.color}30] !my-3 bg-linear-to-r from-[\${tutorial.color}10] via-[\${tutorial.color}20] to-[\${tutorial.color}30]" 
                 data-tutorial-id="\${tutorial.id}" 
                 data-category="\${tutorial.category}" 
                 style="animation-delay: \${cardDelay}s;">
              <div class="tutorial-card-header">
                <div class="tutorial-icon-container" style="background-color: \${tutorial.color}20;">
                  <svg class="tutorial-icon" viewBox="0 0 24 24" fill="none" stroke="\${tutorial.color}" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <div class="tutorial-info">
                  <div class="tutorial-title">\${tutorial.title}</div>
                  <div class="tutorial-meta">
                    <span class="tutorial-badge difficulty-badge" style="--difficulty-color: \${difficultyColors[tutorial.difficulty]}">
                      \${difficultyLabels[tutorial.difficulty]}
                    </span>
                    <span class="tutorial-badge duration-badge">
                      ⏱️ \${tutorial.duration}
                    </span>
                  </div>
                </div>
              </div>
              <div class="tutorial-description !text-theme-text">\${tutorial.description}</div>
              <div class="tutorial-footer">
                <div class="tutorial-steps !text-theme-text">
                  <span>📖 \${tutorial.steps.length} pasos</span>
                </div>
                \${completedBadge}
              </div>
            </div>
          \`;
        }
        
        // Load tutorials progressively with requestAnimationFrame for better performance
        function loadTutorials(count) {
          const tutorialsList = document.getElementById('tutorialsList');
          const loadingIndicator = document.getElementById('loadingIndicator');
          const endIndex = Math.min(loadedCount + count, tutorials.length);
          
          // Use document fragment for better performance
          const fragment = document.createDocumentFragment();
          const tempDiv = document.createElement('div');
          
          for (let i = loadedCount; i < endIndex; i++) {
            const cardHTML = createTutorialCard(tutorials[i], i);
            tempDiv.innerHTML = cardHTML;
            while (tempDiv.firstChild) {
              fragment.appendChild(tempDiv.firstChild);
            }
          }
          
          tutorialsList.appendChild(fragment);
          loadedCount = endIndex;
          
          // Add touch event listeners to newly loaded cards
          addTouchListeners();
          
          // Load more if not all loaded, using requestAnimationFrame for smooth rendering
          if (loadedCount < tutorials.length) {
            loadingIndicator.style.display = 'block';
            requestAnimationFrame(() => {
              setTimeout(() => loadTutorials(BATCH_SIZE), 50);
            });
          } else {
            loadingIndicator.style.display = 'none';
          }
        }
        
        // Add touch and click listeners to cards with enhanced animations
        function addTouchListeners() {
          const cards = document.querySelectorAll('.tutorial-card');
          cards.forEach(card => {
            // Click handler
            card.onclick = function() {
              const tutorialId = this.getAttribute('data-tutorial-id');
              selectTutorial(tutorialId);
            };
            
            // Touch start - apply pressed state with enhanced effects
            card.addEventListener('touchstart', function(e) {
              const touch = e.touches[0];
              const rect = this.getBoundingClientRect();
              const x = touch.clientX - rect.left - rect.width / 2;
              const y = touch.clientY - rect.top - rect.height / 2;
              const tiltX = (y / rect.height) * 3; // Subtle tilt
              const tiltY = -(x / rect.width) * 3;
              
              this.style.transform = \`scale(0.96) rotateX(\${tiltX}deg) rotateY(\${tiltY}deg)\`;
              this.style.opacity = '0.8';
              this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
              this.style.filter = 'brightness(0.95)';
              this.style.transition = 'all 0.15s cubic-bezier(0.22, 1, 0.36, 1)';
            }, { passive: true });
            
            // Touch move - update tilt based on finger position
            card.addEventListener('touchmove', function(e) {
              const touch = e.touches[0];
              const rect = this.getBoundingClientRect();
              const x = touch.clientX - rect.left - rect.width / 2;
              const y = touch.clientY - rect.top - rect.height / 2;
              const tiltX = (y / rect.height) * 3;
              const tiltY = -(x / rect.width) * 3;
              
              this.style.transform = \`scale(0.96) rotateX(\${tiltX}deg) rotateY(\${tiltY}deg)\`;
            }, { passive: true });
            
            // Touch end - remove pressed state with spring animation
            card.addEventListener('touchend', function(e) {
              this.style.transform = 'scale(1.02)'; // Slight overshoot
              this.style.opacity = '1';
              this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              this.style.filter = 'brightness(1)';
              this.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
              
              // Return to normal after overshoot
              setTimeout(() => {
                this.style.transform = '';
                this.style.transition = 'all 0.3s ease-out';
              }, 100);
            }, { passive: true });
            
            // Touch cancel - remove pressed state
            card.addEventListener('touchcancel', function(e) {
              this.style.transform = '';
              this.style.opacity = '';
              this.style.boxShadow = '';
              this.style.filter = '';
              this.style.transition = 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }, { passive: true });
          });
        }
        
        // Initialize: Load first batch immediately when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            requestAnimationFrame(() => loadTutorials(INITIAL_LOAD));
          });
        } else {
          // DOM already loaded, start immediately with requestAnimationFrame
          requestAnimationFrame(() => loadTutorials(INITIAL_LOAD));
        }

        function selectCategory(category, color) {
          currentCategory = category;
          
          // Update category chips
          document.querySelectorAll('.category-chip').forEach(chip => {
            chip.classList.remove('selected');
          });
          document.querySelector(\`[data-category="\${category}"]\`).classList.add('selected');

          // Filter tutorials
          filterTutorials();

          // Update section title
          const sectionTitle = document.getElementById('sectionTitle');
          if (category === 'all') {
            sectionTitle.textContent = 'Todos los tutoriales';
          } else {
            sectionTitle.textContent = categories[category]?.name || 'Tutoriales';
          }
        }

        function filterTutorials() {
          const tutorialCards = document.querySelectorAll('.tutorial-card');
          const featuredBadges = document.querySelectorAll('.featured-badge');
          let visibleCount = 0;

          tutorialCards.forEach((card, index) => {
            const cardCategory = card.getAttribute('data-category');
            const shouldShow = currentCategory === 'all' || cardCategory === currentCategory;
            
            if (shouldShow) {
              card.classList.remove('hidden');
              visibleCount++;
              
              // Show featured badge only for "all" category
              if (featuredBadges[index] && currentCategory === 'all') {
                featuredBadges[index].classList.remove('hidden');
              } else if (featuredBadges[index]) {
                featuredBadges[index].classList.add('hidden');
              }
            } else {
              card.classList.add('hidden');
              if (featuredBadges[index]) {
                featuredBadges[index].classList.add('hidden');
              }
            }
          });

          // Update subtitle
          document.getElementById('sectionSubtitle').textContent = 
            \`\${visibleCount} tutorial\${visibleCount !== 1 ? 'es' : ''}\`;

          // Show/hide empty state
          const emptyState = document.getElementById('emptyState');
          if (visibleCount === 0) {
            emptyState.classList.remove('hidden');
          } else {
            emptyState.classList.add('hidden');
          }
        }

        function selectTutorial(tutorialId) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'tutorialSelected',
              data: { tutorialId }
            }));
          }
        }

        // Listen for messages from React Native
        window.addEventListener('message', function(event) {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'updateProgress') {
              completedTutorials = message.data.completedTutorials || [];
              updateProgress();
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });

        function updateProgress() {
          const total = tutorials.length;
          const completed = completedTutorials.length;
          const percentage = total > 0 ? (completed / total) * 100 : 0;

          // Update progress bar
          document.getElementById('progressBar').style.width = percentage + '%';
          
          // Update progress text
          document.querySelector('.progress-subtitle').textContent = 
            \`\${completed} de \${total} completados\`;
          document.querySelector('.progress-percentage').textContent = 
            Math.round(percentage) + '%';

          // Update completed badges
          document.querySelectorAll('.tutorial-card').forEach(card => {
            const tutorialId = card.getAttribute('data-tutorial-id');
            const isCompleted = completedTutorials.includes(tutorialId);
            const footer = card.querySelector('.tutorial-footer');
            
            const existingBadge = footer.querySelector('.completed-badge');
            if (isCompleted && !existingBadge) {
              const badge = document.createElement('div');
              badge.className = 'completed-badge';
              badge.innerHTML = \`
                <svg class="completed-icon" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Completado</span>
              \`;
              footer.appendChild(badge);
            } else if (!isCompleted && existingBadge) {
              existingBadge.remove();
            }
          });
        }
      </script>
    </body>
  `;
};

// Main template function
type TTutorialsTemplateProps = {
  theme: TTheme;
  completedTutorials: string[];
  fontSize?: number;
  selectedFont?: string;
};

export const tutorialsHtmlTemplate = ({
  theme,
  completedTutorials = [],
  fontSize = 16,
  selectedFont,
}: TTutorialsTemplateProps) => {
  const themeSchema = theme.dark ? 'dark' : 'light';

  return `
    <!DOCTYPE html>
    <html lang="es" data-theme="${themeSchema}">
      ${createHtmlHead(theme, fontSize, selectedFont)}
      ${createHtmlBody(theme, completedTutorials)}
    </html>
  `;
};

