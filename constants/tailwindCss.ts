// Function to generate utility classes for different properties
const generateUtilityClasses = (property: string, colors: Record<string, any[]>) => {
  let css = '';

  // Generate standard color classes
  Object.entries(colors).forEach(([colorName, shades]) => {
    shades.forEach(([shade, rgb]) => {
      if (property === 'border') {
        css += `.${property}-${colorName}-${shade} { --tw-${property}-opacity: 1; ${property}-color: rgb(${rgb} / var(--tw-${property}-opacity, 1)); }\n`;
      } else if (property === 'bg') {
        css += `.${property}-${colorName}-${shade} { --tw-${property}-opacity: 1; background-color: rgb(${rgb} / var(--tw-${property}-opacity, 1)); }\n`;
      } else if (property === 'text') {
        css += `.${property}-${colorName}-${shade} { --tw-${property}-opacity: 1; color: rgb(${rgb} / var(--tw-${property}-opacity, 1)); }\n`;
      }
    });
  });

  return css;
};

// Color definitions
const colorDefinitions = {
  red: [
    [100, '254 226 226'], [200, '254 202 202'], [300, '252 165 165'], [400, '248 113 113'],
    [500, '239 68 68'], [600, '220 38 38'], [700, '185 28 28'], [800, '153 27 27'], [900, '127 29 29']
  ],
  blue: [
    [100, '219 234 254'], [200, '191 219 254'], [300, '147 197 253'], [400, '96 165 250'],
    [500, '59 130 246'], [600, '37 99 235'], [700, '29 78 216'], [800, '30 64 175'], [900, '30 58 138']
  ],
  green: [
    [100, '220 252 231'], [200, '187 247 208'], [300, '134 239 172'], [400, '74 222 128'],
    [500, '34 197 94'], [600, '22 163 74'], [700, '21 128 61'], [800, '22 101 52'], [900, '20 83 45']
  ],
  yellow: [
    [100, '254 249 195'], [200, '254 240 138'], [300, '253 224 71'], [400, '250 204 21'],
    [500, '234 179 8'], [600, '202 138 4'], [700, '161 98 7'], [800, '133 77 14'], [900, '113 63 18']
  ],
  purple: [
    [100, '243 232 255'], [200, '221 214 254'], [300, '196 181 253'], [400, '196 181 253'],
    [500, '168 85 247'], [600, '147 51 234'], [700, '126 34 206'], [800, '107 33 168'], [900, '88 28 135']
  ],
  pink: [
    [100, '252 231 243'], [200, '251 207 232'], [300, '249 168 212'], [400, '244 114 182'],
    [500, '236 72 153'], [600, '219 39 119'], [700, '190 24 93'], [800, '157 23 77'], [900, '131 24 67']
  ],
  indigo: [
    [100, '224 231 255'], [200, '199 210 254'], [300, '165 180 252'], [400, '129 140 248'],
    [500, '99 102 241'], [600, '79 70 229'], [700, '67 56 202'], [800, '55 48 163'], [900, '49 46 129']
  ],
  orange: [
    [100, '255 237 213'], [200, '254 215 170'], [300, '253 186 116'], [400, '251 146 60'],
    [500, '249 115 22'], [600, '234 88 12'], [700, '194 65 12'], [800, '154 52 18'], [900, '124 45 18']
  ],
  gray: [
    [100, '243 244 246'], [200, '229 231 235'], [300, '209 213 219'], [400, '156 163 175'],
    [500, '107 114 128'], [600, '75 85 99'], [700, '55 65 81'], [800, '31 41 55'], [900, '17 24 39']
  ],
  slate: [
    [100, '241 245 249'], [200, '226 232 240'], [300, '203 213 225'], [400, '148 163 184'],
    [500, '100 116 139'], [600, '71 85 105'], [700, '51 65 85'], [800, '30 41 59'], [900, '15 23 42']
  ],
  zinc: [
    [100, '244 244 245'], [200, '228 228 231'], [300, '212 212 216'], [400, '161 161 170'],
    [500, '113 113 122'], [600, '82 82 91'], [700, '63 63 70'], [800, '39 39 42'], [900, '24 24 27']
  ],
  neutral: [
    [100, '245 245 245'], [200, '229 229 229'], [300, '212 212 212'], [400, '163 163 163'],
    [500, '115 115 115'], [600, '82 82 82'], [700, '64 64 64'], [800, '38 38 38'], [900, '23 23 23']
  ],
  stone: [
    [100, '245 245 244'], [200, '231 229 228'], [300, '214 211 209'], [400, '168 162 158'],
    [500, '120 113 108'], [600, '87 83 78'], [700, '68 64 60'], [800, '41 37 36'], [900, '28 25 23']
  ],
  cyan: [
    [100, '207 250 254'], [200, '165 243 252'], [300, '103 232 249'], [400, '34 211 238'],
    [500, '6 182 212'], [600, '8 145 178'], [700, '14 116 144'], [800, '21 94 117'], [900, '22 78 99']
  ],
  teal: [
    [100, '204 251 241'], [200, '153 246 228'], [300, '94 234 212'], [400, '45 212 191'],
    [500, '20 184 166'], [600, '13 148 136'], [700, '15 118 110'], [800, '17 94 89'], [900, '19 78 74']
  ],
  lime: [
    [100, '236 252 203'], [200, '217 249 157'], [300, '190 242 100'], [400, '163 230 53'],
    [500, '132 204 22'], [600, '101 163 13'], [700, '77 124 15'], [800, '63 98 18'], [900, '54 83 20']
  ],
  amber: [
    [100, '254 243 199'], [200, '253 230 138'], [300, '252 211 77'], [400, '251 191 36'],
    [500, '245 158 11'], [600, '217 119 6'], [700, '180 83 9'], [800, '146 64 14'], [900, '120 53 15']
  ],
  violet: [
    [100, '237 233 254'], [200, '221 214 254'], [300, '196 181 253'], [400, '167 139 250'],
    [500, '139 92 246'], [600, '124 58 237'], [700, '109 40 217'], [800, '91 33 182'], [900, '76 29 149']
  ],
  fuchsia: [
    [100, '253 244 255'], [200, '250 232 255'], [300, '240 171 252'], [400, '232 121 249'],
    [500, '217 70 239'], [600, '192 38 211'], [700, '162 28 175'], [800, '134 25 143'], [900, '112 26 117']
  ],
  rose: [
    [100, '255 228 230'], [200, '254 205 211'], [300, '253 164 175'], [400, '251 113 133'],
    [500, '244 63 94'], [600, '225 29 72'], [700, '190 18 60'], [800, '159 18 57'], [900, '136 19 55']
  ],
  sky: [
    [100, '224 242 254'], [200, '186 230 253'], [300, '125 211 252'], [400, '56 189 248'],
    [500, '14 165 233'], [600, '2 132 199'], [700, '3 105 161'], [800, '7 89 133'], [900, '12 74 110']
  ],
  emerald: [
    [100, '209 250 229'], [200, '167 243 208'], [300, '110 231 183'], [400, '52 211 153'],
    [500, '16 185 129'], [600, '5 150 105'], [700, '4 120 87'], [800, '6 95 70'], [900, '6 78 59']
  ]
};


// Function to generate border color classes
const generateBorderColorClasses = () => {
  return generateUtilityClasses('border', colorDefinitions);
};

// Function to generate background color classes
const generateBackgroundColorClasses = () => {
  return generateUtilityClasses('bg', colorDefinitions);
};

// Function to generate text color classes
const generateTextColorClasses = () => {
  return generateUtilityClasses('text', colorDefinitions);
};

// Compiled Tailwind CSS for offline WebView usage
export const tailwindCss = `
/* Complete Tailwind CSS v3.4.17 - Base Styles */
*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}

/* Base styles */
*,
::before,
::after {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: #e5e7eb;
}

::before,
::after {
  --tw-content: '';
}

html,
:host {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-feature-settings: normal;
  font-variation-settings: normal;
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
  line-height: inherit;
}

hr {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
}

h1, h2, h3, h4, h5, h6 {
  font-size: inherit;
  font-weight: inherit;
}

a {
  color: inherit;
  text-decoration: inherit;
}

b, strong {
  font-weight: bolder;
}

code, kbd, samp, pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-feature-settings: normal;
  font-variation-settings: normal;
  font-size: 1em;
}

small {
  font-size: 80%;
}

sub, sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

table {
  text-indent: 0;
  border-color: inherit;
  border-collapse: collapse;
}

button, input, optgroup, select, textarea {
  font-family: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  font-size: 100%;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  color: inherit;
  margin: 0;
  padding: 0;
}

button, select {
  text-transform: none;
}

button, input:where([type='button']), input:where([type='reset']), input:where([type='submit']) {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
}

:-moz-focusring {
  outline: auto;
}

:-moz-ui-invalid {
  box-shadow: none;
}

progress {
  vertical-align: baseline;
}

::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
  height: auto;
}

[type='search'] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}

::-webkit-search-decoration {
  -webkit-appearance: none;
}

::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}

summary {
  display: list-item;
}

blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol, ul, menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

dialog {
  padding: 0;
}

textarea {
  resize: vertical;
}

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  color: #9ca3af;
}

input::placeholder, textarea::placeholder {
  opacity: 1;
  color: #9ca3af;
}

button, [role="button"] {
  cursor: pointer;
}

:disabled {
  cursor: default;
}

img, svg, video, canvas, audio, iframe, embed, object {
  display: block;
  vertical-align: middle;
}

img, video {
  max-width: 100%;
  height: auto;
}

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

/* Container */
.container {
  width: 100%;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}

/* Utility Classes */
.pointer-events-none { pointer-events: none; }
.visible { visibility: visible; }
.static { position: static; }
.fixed { position: fixed; }
.absolute { position: absolute; }
.relative { position: relative; }
.sticky { position: sticky; }
.block { display: block; }
.inline { display: inline; }
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.table { display: table; }
.grid { display: grid; }
.contents { display: contents; }
.hidden { display: none; }

/* Positioning */
.left-0 { left: 0px; }
.left-2 { left: 0.5rem; }
.right-0 { right: 0px; }
.top-0 { top: 0px; }
.top-16 { top: 4rem; }
.bottom-0 { bottom: 0px; }
.z-10 { z-index: 10; }

/* Spacing */
.mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
.my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }

/* Sizing */
.h-1 { height: 0.25rem; }
.h-4 { height: 1rem; }
.h-12 { height: 3rem; }
.h-full { height: 100%; }
.w-4 { width: 1rem; }
.w-6 { width: 1.5rem; }
.w-24 { width: 6rem; }
.w-fit { width: -moz-fit-content; width: fit-content; }
.w-full { width: 100%; }
.min-h-\[200px\] { min-height: 200px; }
.max-w-screen-lg { max-width: 1024px; }

/* Flexbox */
.flex-1 { flex: 1 1 0%; }
.flex-shrink { flex-shrink: 1; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.place-items-center { place-items: center; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }

/* Grid */
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }

/* Overflow */
.overflow-hidden { overflow: hidden; }
.overflow-x-auto { overflow-x: auto; }
.overflow-y-auto { overflow-y: auto; }
.scroll-smooth { scroll-behavior: smooth; }

/* Text */
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }

/* Typography */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-7xl { font-size: 4.5rem; line-height: 1; }
.font-normal { font-weight: 400; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }
.italic { font-style: italic; }
.underline { text-decoration-line: underline; }
.line-through { text-decoration-line: line-through; }
.antialiased { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

/* Colors */
.text-black { --tw-text-opacity: 1; color: rgb(0 0 0 / var(--tw-text-opacity, 1)); }
.text-white { --tw-text-opacity: 1; color: rgb(255 255 255 / var(--tw-text-opacity, 1)); }
.text-gray-400 { --tw-text-opacity: 1; color: rgb(156 163 175 / var(--tw-text-opacity, 1)); }
.text-gray-900 { --tw-text-opacity: 1; color: rgb(17 24 39 / var(--tw-text-opacity, 1)); }
.text-emerald-500 { --tw-text-opacity: 1; color: rgb(16 185 129 / var(--tw-text-opacity, 1)); }
.bg-white { --tw-bg-opacity: 1; background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1)); }
.bg-transparent { background-color: transparent; }
.bg-gray-200\/30 { background-color: rgb(229 231 235 / 0.3); }
.bg-emerald-400\/20 { background-color: rgb(52 211 153 / 0.2); }
.bg-white\/10 { background-color: rgb(255 255 255 / 0.1); }

/* Borders */
.border { border-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-b-2 { border-bottom-width: 2px; }
.border-none { border-style: none; }
.border-gray-200 { --tw-border-opacity: 1; border-color: rgb(229 231 235 / var(--tw-border-opacity, 1)); }
.border-emerald-700 { --tw-border-opacity: 1; border-color: rgb(4 120 87 / var(--tw-border-opacity, 1)); }
.border-white\/10 { border-color: rgb(255 255 255 / 0.1); }

/* Generated Border Colors */
${generateBorderColorClasses()}

/* Generated Background Colors */
${generateBackgroundColorClasses()}

/* Generated Text Colors */
${generateTextColorClasses()}


/* Border Radius */
.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-full { border-radius: 9999px; }
.rounded-t { border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem; }

/* Padding */
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-12 { padding: 3rem; }
.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-1\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-2\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-8 { padding-left: 2rem; padding-right: 2rem; }
.py-0\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.pr-4 { padding-right: 1rem; }
.pt-4 { padding-top: 1rem; }
.pt-10 { padding-top: 2.5rem; }

/* Effects */
.shadow { --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color); box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow); }
.outline-none { outline: 2px solid transparent; outline-offset: 2px; }
.outline-0 { outline-width: 0px; }
.opacity-50 { opacity: 0.5; }
.opacity-60 { opacity: 0.6; }

/* Transforms */
.transform { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

/* Animations */
@keyframes pulse {
  50% {
    opacity: .5;
  }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

/* Filters */
.blur { --tw-blur: blur(8px); filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow); }
.grayscale { --tw-grayscale: grayscale(100%); filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow); }
.filter { filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow); }
.backdrop-filter { backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia); }

/* Transitions */
.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

/* Interactive */
.cursor-pointer { cursor: pointer; }
.select-none { -webkit-user-select: none; -moz-user-select: none; user-select: none; }
.resize-none { resize: none; }
.resize { resize: both; }

/* Placeholders */
.placeholder-gray-400::-moz-placeholder { --tw-placeholder-opacity: 1; color: rgb(156 163 175 / var(--tw-placeholder-opacity, 1)); }
.placeholder-gray-400::placeholder { --tw-placeholder-opacity: 1; color: rgb(156 163 175 / var(--tw-placeholder-opacity, 1)); }

/* Caret */
.caret-black { caret-color: #000; }

/* Responsive Design */
@media (min-width: 640px) {
  .sm\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .sm\\:grid-cols-8 { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  .sm\\:grid-cols-10 { grid-template-columns: repeat(10, minmax(0, 1fr)); }
}

@media (min-width: 768px) {
  .md\\:grid-cols-8 { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  .md\\:grid-cols-10 { grid-template-columns: repeat(10, minmax(0, 1fr)); }
  .md\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .dark\\:text-white { --tw-text-opacity: 1; color: rgb(255 255 255 / var(--tw-text-opacity, 1)); }
  .dark\\:text-gray-400 { --tw-text-opacity: 1; color: rgb(156 163 175 / var(--tw-text-opacity, 1)); }
  .dark\\:caret-white { caret-color: #fff; }
  .dark\\:placeholder\\:text-gray-400::-moz-placeholder { --tw-text-opacity: 1; color: rgb(156 163 175 / var(--tw-text-opacity, 1)); }
  .dark\\:placeholder\\:text-gray-400::placeholder { --tw-text-opacity: 1; color: rgb(156 163 175 / var(--tw-text-opacity, 1)); }
}

/* Hover States */
.hover\\:border-theme-primary:hover { border-color: var(--color-primary); }

/* Additional Color Classes */

/* Additional Spacing */
.m-0 { margin: 0px; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 0.75rem; }
.m-4 { margin: 1rem; }
.m-5 { margin: 1.25rem; }
.m-6 { margin: 1.5rem; }
.m-8 { margin: 2rem; }
.m-10 { margin: 2.5rem; }
.m-12 { margin: 3rem; }
.m-16 { margin: 4rem; }
.m-20 { margin: 5rem; }
.m-24 { margin: 6rem; }
.m-32 { margin: 8rem; }

.mx-0 { margin-left: 0px; margin-right: 0px; }
.mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
.mx-3 { margin-left: 0.75rem; margin-right: 0.75rem; }
.mx-4 { margin-left: 1rem; margin-right: 1rem; }
.mx-5 { margin-left: 1.25rem; margin-right: 1.25rem; }
.mx-6 { margin-left: 1.5rem; margin-right: 1.5rem; }
.mx-8 { margin-left: 2rem; margin-right: 2rem; }
.mx-10 { margin-left: 2.5rem; margin-right: 2.5rem; }
.mx-12 { margin-left: 3rem; margin-right: 3rem; }

.my-0 { margin-top: 0px; margin-bottom: 0px; }
.my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
.my-5 { margin-top: 1.25rem; margin-bottom: 1.25rem; }
.my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
.my-8 { margin-top: 2rem; margin-bottom: 2rem; }
.my-10 { margin-top: 2.5rem; margin-bottom: 2.5rem; }
.my-12 { margin-top: 3rem; margin-bottom: 3rem; }

.mt-0 { margin-top: 0px; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-5 { margin-top: 1.25rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mt-10 { margin-top: 2.5rem; }
.mt-12 { margin-top: 3rem; }
.mt-16 { margin-top: 4rem; }
.mt-20 { margin-top: 5rem; }

.mb-0 { margin-bottom: 0px; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-5 { margin-bottom: 1.25rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mb-12 { margin-bottom: 3rem; }
.mb-16 { margin-bottom: 4rem; }
.mb-20 { margin-bottom: 5rem; }

.ml-0 { margin-left: 0px; }
.ml-1 { margin-left: 0.25rem; }
.ml-2 { margin-left: 0.5rem; }
.ml-3 { margin-left: 0.75rem; }
.ml-4 { margin-left: 1rem; }
.ml-5 { margin-left: 1.25rem; }
.ml-6 { margin-left: 1.5rem; }
.ml-8 { margin-left: 2rem; }
.ml-10 { margin-left: 2.5rem; }
.ml-12 { margin-left: 3rem; }

.mr-0 { margin-right: 0px; }
.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.mr-3 { margin-right: 0.75rem; }
.mr-4 { margin-right: 1rem; }
.mr-5 { margin-right: 1.25rem; }
.mr-6 { margin-right: 1.5rem; }
.mr-8 { margin-right: 2rem; }
.mr-10 { margin-right: 2.5rem; }
.mr-12 { margin-right: 3rem; }

/* Additional Padding */
.p-0 { padding: 0px; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.p-10 { padding: 2.5rem; }
.p-12 { padding: 3rem; }
.p-16 { padding: 4rem; }
.p-20 { padding: 5rem; }

.px-0 { padding-left: 0px; padding-right: 0px; }
.px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
.px-12 { padding-left: 3rem; padding-right: 3rem; }
.px-16 { padding-left: 4rem; padding-right: 4rem; }
.px-20 { padding-left: 5rem; padding-right: 5rem; }

.py-0 { padding-top: 0px; padding-bottom: 0px; }
.py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }

.pt-0 { padding-top: 0px; }
.pt-1 { padding-top: 0.25rem; }
.pt-2 { padding-top: 0.5rem; }
.pt-3 { padding-top: 0.75rem; }
.pt-5 { padding-top: 1.25rem; }
.pt-6 { padding-top: 1.5rem; }
.pt-8 { padding-top: 2rem; }
.pt-10 { padding-top: 2.5rem; }
.pt-12 { padding-top: 3rem; }
.pt-16 { padding-top: 4rem; }
.pt-20 { padding-top: 5rem; }

.pb-0 { padding-bottom: 0px; }
.pb-1 { padding-bottom: 0.25rem; }
.pb-2 { padding-bottom: 0.5rem; }
.pb-3 { padding-bottom: 0.75rem; }
.pb-4 { padding-bottom: 1rem; }
.pb-5 { padding-bottom: 1.25rem; }
.pb-6 { padding-bottom: 1.5rem; }
.pb-8 { padding-bottom: 2rem; }
.pb-10 { padding-bottom: 2.5rem; }
.pb-12 { padding-bottom: 3rem; }
.pb-16 { padding-bottom: 4rem; }
.pb-20 { padding-bottom: 5rem; }

.pl-0 { padding-left: 0px; }
.pl-1 { padding-left: 0.25rem; }
.pl-2 { padding-left: 0.5rem; }
.pl-3 { padding-left: 0.75rem; }
.pl-4 { padding-left: 1rem; }
.pl-5 { padding-left: 1.25rem; }
.pl-6 { padding-left: 1.5rem; }
.pl-8 { padding-left: 2rem; }
.pl-10 { padding-left: 2.5rem; }
.pl-12 { padding-left: 3rem; }
.pl-16 { padding-left: 4rem; }
.pl-20 { padding-left: 5rem; }

.pr-0 { padding-right: 0px; }
.pr-1 { padding-right: 0.25rem; }
.pr-2 { padding-right: 0.5rem; }
.pr-3 { padding-right: 0.75rem; }
.pr-5 { padding-right: 1.25rem; }
.pr-6 { padding-right: 1.5rem; }
.pr-8 { padding-right: 2rem; }
.pr-10 { padding-right: 2.5rem; }
.pr-12 { padding-right: 3rem; }
.pr-16 { padding-right: 4rem; }
.pr-20 { padding-right: 5rem; }

/* Additional Width & Height */
.w-0 { width: 0px; }
.w-1 { width: 0.25rem; }
.w-2 { width: 0.5rem; }
.w-3 { width: 0.75rem; }
.w-5 { width: 1.25rem; }
.w-8 { width: 2rem; }
.w-10 { width: 2.5rem; }
.w-12 { width: 3rem; }
.w-16 { width: 4rem; }
.w-20 { width: 5rem; }
.w-32 { width: 8rem; }
.w-40 { width: 10rem; }
.w-48 { width: 12rem; }
.w-56 { width: 14rem; }
.w-64 { width: 16rem; }
.w-72 { width: 18rem; }
.w-80 { width: 20rem; }
.w-96 { width: 24rem; }

.h-0 { height: 0px; }
.h-2 { height: 0.5rem; }
.h-3 { height: 0.75rem; }
.h-5 { height: 1.25rem; }
.h-6 { height: 1.5rem; }
.h-8 { height: 2rem; }
.h-10 { height: 2.5rem; }
.h-16 { height: 4rem; }
.h-20 { height: 5rem; }
.h-24 { height: 6rem; }
.h-32 { height: 8rem; }
.h-40 { height: 10rem; }
.h-48 { height: 12rem; }
.h-56 { height: 14rem; }
.h-64 { height: 16rem; }
.h-72 { height: 18rem; }
.h-80 { height: 20rem; }
.h-96 { height: 24rem; }

/* Additional Text Sizes */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.text-6xl { font-size: 3.75rem; line-height: 1; }
.text-8xl { font-size: 6rem; line-height: 1; }
.text-9xl { font-size: 8rem; line-height: 1; }

/* Additional Font Weights */
.font-thin { font-weight: 100; }
.font-extralight { font-weight: 200; }
.font-light { font-weight: 300; }
.font-medium { font-weight: 500; }
.font-extrabold { font-weight: 800; }
.font-black { font-weight: 900; }

/* Additional Border Radius */
.rounded-none { border-radius: 0px; }
.rounded-sm { border-radius: 0.125rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-3xl { border-radius: 1.5rem; }
.rounded-b { border-bottom-left-radius: 0.25rem; border-bottom-right-radius: 0.25rem; }
.rounded-l { border-top-left-radius: 0.25rem; border-bottom-left-radius: 0.25rem; }
.rounded-r { border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem; }
.rounded-br { border-bottom-right-radius: 0.25rem; }
.rounded-bl { border-bottom-left-radius: 0.25rem; }
.rounded-tr { border-top-right-radius: 0.25rem; }
.rounded-tl { border-top-left-radius: 0.25rem; }

/* Additional Shadows */
.shadow-none { box-shadow: 0 0 #0000; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
.shadow-inner { box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05); }

/* Additional Opacity */
.opacity-0 { opacity: 0; }
.opacity-5 { opacity: 0.05; }
.opacity-10 { opacity: 0.1; }
.opacity-20 { opacity: 0.2; }
.opacity-25 { opacity: 0.25; }
.opacity-30 { opacity: 0.3; }
.opacity-40 { opacity: 0.4; }
.opacity-75 { opacity: 0.75; }
.opacity-80 { opacity: 0.8; }
.opacity-90 { opacity: 0.9; }
.opacity-95 { opacity: 0.95; }
.opacity-100 { opacity: 1; }

/* Theme color utilities */
.bg-theme-primary { background-color: var(--color-primary); }
.bg-theme-background { background-color: var(--color-background); }
.bg-theme-card { background-color: var(--color-card); }
.bg-theme-text { background-color: var(--color-text); }
.bg-theme-border { background-color: var(--color-border); }
.bg-theme-notification { background-color: var(--color-notification); }
.bg-theme-chip { background-color: var(--color-chip); border-color: var(--color-chip-border); }


.text-theme-primary { color: var(--color-primary); }
.text-theme-background { color: var(--color-background); }
.text-theme-card { color: var(--color-card); }
.text-theme-text { color: var(--color-text); }
.text-theme-border { color: var(--color-border); }
.text-theme-notification { color: var(--color-notification); }
.text-theme-chip { color: var(--color-chip); }

.border-theme-primary { border-color: var(--color-primary); }
.border-theme-background { border-color: var(--color-background); }
.border-theme-card { border-color: var(--color-card); }
.border-theme-text { border-color: var(--color-text); }
.border-theme-border { border-color: var(--color-border); }
.border-theme-notification { border-color: var(--color-notification); }/* This file adds the requisite utility classes for Tailwind to work. */

*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/* ! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com */

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.container {
  width: 100%;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}

.pointer-events-none {
  pointer-events: none;
}

.visible {
  visibility: visible;
}

.static {
  position: static;
}

.fixed {
  position: fixed;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.sticky {
  position: sticky;
}

.\\!left-0 {
  left: 0px !important;
}

.\\!right-0 {
  right: 0px !important;
}

.\\!top-0 {
  top: 0px !important;
}

.bottom-0 {
  bottom: 0px;
}

.left-0 {
  left: 0px;
}

.left-2 {
  left: 0.5rem;
}

.right-0 {
  right: 0px;
}

.top-0 {
  top: 0px;
}

.top-16 {
  top: 4rem;
}

.z-10 {
  z-index: 10;
}

.-mx-8 {
  margin-left: -2rem;
  margin-right: -2rem;
}

.mx-1 {
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.my-1 {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.my-2 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.block {
  display: block;
}

.inline {
  display: inline;
}

.flex {
  display: flex;
}

.inline-flex {
  display: inline-flex;
}

.table {
  display: table;
}

.grid {
  display: grid;
}

.contents {
  display: contents;
}

.hidden {
  display: none;
}

.h-1 {
  height: 0.25rem;
}

.h-12 {
  height: 3rem;
}

.h-4 {
  height: 1rem;
}

.h-\\[2px\\] {
  height: 2px;
}

.h-full {
  height: 100%;
}

.min-h-\\[200px\\] {
  min-height: 200px;
}

.w-24 {
  width: 6rem;
}

.w-4 {
  width: 1rem;
}

.w-6 {
  width: 1.5rem;
}

.w-fit {
  width: -moz-fit-content;
  width: fit-content;
}

.w-full {
  width: 100%;
}

.max-w-screen-lg {
  max-width: 1024px;
}

.flex-1 {
  flex: 1 1 0%;
}

.flex-shrink {
  flex-shrink: 1;
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-pointer {
  cursor: pointer;
}

.select-none {
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}

.resize-none {
  resize: none;
}

.resize {
  resize: both;
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.grid-cols-6 {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.flex-row {
  flex-direction: row;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.place-items-center {
  place-items: center;
}

.items-center {
  align-items: center;
}

.justify-start {
  justify-content: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-x-auto {
  overflow-x: auto;
}

.overflow-y-auto {
  overflow-y: auto;
}

.scroll-smooth {
  scroll-behavior: smooth;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.rounded-t {
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.border {
  border-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.border-none {
  border-style: none;
}

.\\!border-black {
  --tw-border-opacity: 1 !important;
  border-color: rgb(0 0 0 / var(--tw-border-opacity, 1)) !important;
}

.\\!border-gray-300 {
  --tw-border-opacity: 1 !important;
  border-color: rgb(209 213 219 / var(--tw-border-opacity, 1)) !important;
}

.border-emerald-700 {
  --tw-border-opacity: 1;
  border-color: rgb(4 120 87 / var(--tw-border-opacity, 1));
}

.border-gray-200 {
  --tw-border-opacity: 1;
  border-color: rgb(229 231 235 / var(--tw-border-opacity, 1));
}

.border-theme-notification {
  border-color: var(--color-notification);
}

.border-theme-text {
  border-color: var(--color-text);
}

.border-white\\/10 {
  border-color: rgb(255 255 255 / 0.1);
}

.border-b-theme-text {
  border-bottom-color: var(--color-text);
}

.\\!bg-gray-300 {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(209 213 219 / var(--tw-bg-opacity, 1)) !important;
}

.\\!bg-theme-background {
  background-color: var(--color-background) !important;
}

.\\!bg-theme-notification {
  background-color: var(--color-notification) !important;
}

.\\!bg-white {
  --tw-bg-opacity: 1 !important;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1)) !important;
}

.bg-emerald-400\\/20 {
  background-color: rgb(52 211 153 / 0.2);
}

.bg-gray-200\\/30 {
  background-color: rgb(229 231 235 / 0.3);
}

.bg-theme-background {
  background-color: var(--color-background);
}

.bg-theme-notification {
  background-color: var(--color-notification);
}

.bg-transparent {
  background-color: transparent;
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}

.bg-white\\/10 {
  background-color: rgb(255 255 255 / 0.1);
}

.\\!p-0 {
  padding: 0px !important;
}

.p-1 {
  padding: 0.25rem;
}

.p-12 {
  padding: 3rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.\\!py-1 {
  padding-top: 0.25rem !important;
  padding-bottom: 0.25rem !important;
}

.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.px-1\\.5 {
  padding-left: 0.375rem;
  padding-right: 0.375rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-2\\.5 {
  padding-left: 0.625rem;
  padding-right: 0.625rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-8 {
  padding-left: 2rem;
  padding-right: 2rem;
}

.py-0\\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.\\!pb-\\[70px\\] {
  padding-bottom: 70px !important;
}

.pr-4 {
  padding-right: 1rem;
}

.pt-10 {
  padding-top: 2.5rem;
}

.pt-4 {
  padding-top: 1rem;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-justify {
  text-align: justify;
}

.font-\\[Montserrat\\] {
  font-family: Montserrat;
}

.\\!text-base {
  font-size: 1rem !important;
  line-height: 1.5rem !important;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-7xl {
  font-size: 4.5rem;
  line-height: 1;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.\\!font-semibold {
  font-weight: 600 !important;
}

.font-bold {
  font-weight: 700;
}

.font-normal {
  font-weight: 400;
}

.font-semibold {
  font-weight: 600;
}

.uppercase {
  text-transform: uppercase;
}

.lowercase {
  text-transform: lowercase;
}

.capitalize {
  text-transform: capitalize;
}

.italic {
  font-style: italic;
}

.\\!text-black {
  --tw-text-opacity: 1 !important;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1)) !important;
}

.\\!text-white {
  --tw-text-opacity: 1 !important;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1)) !important;
}

.text-black {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1));
}

.text-emerald-500 {
  --tw-text-opacity: 1;
  color: rgb(16 185 129 / var(--tw-text-opacity, 1));
}

.text-gray-400 {
  --tw-text-opacity: 1;
  color: rgb(156 163 175 / var(--tw-text-opacity, 1));
}

.text-gray-900 {
  --tw-text-opacity: 1;
  color: rgb(17 24 39 / var(--tw-text-opacity, 1));
}

.text-theme-text {
  color: var(--color-text);
}

.underline {
  text-decoration-line: underline;
}

.line-through {
  text-decoration-line: line-through;
}

.antialiased {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.placeholder-gray-400::-moz-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgb(156 163 175 / var(--tw-placeholder-opacity, 1));
}

.placeholder-gray-400::placeholder {
  --tw-placeholder-opacity: 1;
  color: rgb(156 163 175 / var(--tw-placeholder-opacity, 1));
}

.\\!caret-white {
  caret-color: #fff !important;
}

.caret-black {
  caret-color: #000;
}

.opacity-50 {
  opacity: 0.5;
}

.opacity-60 {
  opacity: 0.6;
}

.shadow {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.outline-0 {
  outline-width: 0px;
}

.blur {
  --tw-blur: blur(8px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.grayscale {
  --tw-grayscale: grayscale(100%);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.backdrop-filter {
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.placeholder\\:text-3xl::-moz-placeholder {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.placeholder\\:text-3xl::placeholder {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.placeholder\\:font-semibold::-moz-placeholder {
  font-weight: 600;
}

.placeholder\\:font-semibold::placeholder {
  font-weight: 600;
}

.hover\\:border-theme-primary:hover {
  border-color: var(--color-primary);
}

@media (min-width: 640px) {
  .sm\\:grid-cols-10 {
    grid-template-columns: repeat(10, minmax(0, 1fr));
  }

  .sm\\:grid-cols-6 {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .sm\\:grid-cols-8 {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\\:grid-cols-10 {
    grid-template-columns: repeat(10, minmax(0, 1fr));
  }

  .md\\:grid-cols-12 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .md\\:grid-cols-8 {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}

@media (prefers-color-scheme: dark) {
  .dark\\:\\!bg-black {
    --tw-bg-opacity: 1 !important;
    background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1)) !important;
  }

  .dark\\:\\!text-green-300 {
    --tw-text-opacity: 1 !important;
    color: rgb(134 239 172 / var(--tw-text-opacity, 1)) !important;
  }

  .dark\\:\\!text-white {
    --tw-text-opacity: 1 !important;
    color: rgb(255 255 255 / var(--tw-text-opacity, 1)) !important;
  }

  .dark\\:text-gray-400 {
    --tw-text-opacity: 1;
    color: rgb(156 163 175 / var(--tw-text-opacity, 1));
  }

  .dark\\:text-white {
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity, 1));
  }

  .dark\\:caret-white {
    caret-color: #fff;
  }

  .dark\\:placeholder\\:text-gray-400::-moz-placeholder {
    --tw-text-opacity: 1;
    color: rgb(156 163 175 / var(--tw-text-opacity, 1));
  }

  .dark\\:placeholder\\:text-gray-400::placeholder {
    --tw-text-opacity: 1;
    color: rgb(156 163 175 / var(--tw-text-opacity, 1));
  }
}

.\\[\\&\\>button\\.toolbar-item\\]\\:cursor-pointer>button.toolbar-item {
  cursor: pointer;
}

.\\[\\&\\>button\\.toolbar-item\\]\\:rounded-\\[10px\\]>button.toolbar-item {
  border-radius: 10px;
}

.\\[\\&\\>button\\.toolbar-item\\]\\:border-0>button.toolbar-item {
  border-width: 0px;
}

.\\[\\&\\>button\\.toolbar-item\\]\\:p-\\[8px\\]>button.toolbar-item {
  padding: 8px;
}

/* Spacing utilities */
.space-x-2 > :not([hidden]) ~ :not([hidden]) {
  margin-left: 0.5rem;
}

.space-y-2 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.5rem;
}

.space-x-4 > :not([hidden]) ~ :not([hidden]) {
  margin-left: 1rem;
}

.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1rem;
}

/* Additional margin utilities */
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 0.75rem; }
.m-4 { margin: 1rem; }
.m-6 { margin: 1.5rem; }
.m-8 { margin: 2rem; }

.ml-1 { margin-left: 0.25rem; }
.ml-2 { margin-left: 0.5rem; }
.ml-3 { margin-left: 0.75rem; }
.ml-4 { margin-left: 1rem; }

.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.mr-3 { margin-right: 0.75rem; }
.mr-4 { margin-right: 1rem; }

.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }

.mb-2 { margin-bottom: 0.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }

/* Additional padding utilities */
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }

.pl-1 { padding-left: 0.25rem; }
.pl-2 { padding-left: 0.5rem; }
.pl-3 { padding-left: 0.75rem; }
.pl-4 { padding-left: 1rem; }

.pr-1 { padding-right: 0.25rem; }
.pr-2 { padding-right: 0.5rem; }
.pr-3 { padding-right: 0.75rem; }

.pt-1 { padding-top: 0.25rem; }
.pt-2 { padding-top: 0.5rem; }
.pt-3 { padding-top: 0.75rem; }
.pt-6 { padding-top: 1.5rem; }
.pt-8 { padding-top: 2rem; }

.pb-1 { padding-bottom: 0.25rem; }
.pb-2 { padding-bottom: 0.5rem; }
.pb-3 { padding-bottom: 0.75rem; }
.pb-6 { padding-bottom: 1.5rem; }
.pb-8 { padding-bottom: 2rem; }

/* Additional width utilities */
.w-1 { width: 0.25rem; }
.w-2 { width: 0.5rem; }
.w-3 { width: 0.75rem; }
.w-5 { width: 1.25rem; }
.w-8 { width: 2rem; }
.w-10 { width: 2.5rem; }
.w-12 { width: 3rem; }
.w-16 { width: 4rem; }
.w-20 { width: 5rem; }
.w-32 { width: 8rem; }
.w-48 { width: 12rem; }
.w-64 { width: 16rem; }

/* Additional height utilities */
.h-2 { height: 0.5rem; }
.h-3 { height: 0.75rem; }
.h-5 { height: 1.25rem; }
.h-6 { height: 1.5rem; }
.h-8 { height: 2rem; }
.h-10 { height: 2.5rem; }
.h-16 { height: 4rem; }
.h-20 { height: 5rem; }
.h-32 { height: 8rem; }
.h-48 { height: 12rem; }
.h-64 { height: 16rem; }

/* Additional text size utilities */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.text-6xl { font-size: 3.75rem; line-height: 1; }

/* Additional font weight utilities */
.font-thin { font-weight: 100; }
.font-extralight { font-weight: 200; }
.font-light { font-weight: 300; }
.font-medium { font-weight: 500; }
.font-extrabold { font-weight: 800; }
.font-black { font-weight: 900; }

/* Additional border radius utilities */
.rounded-sm { border-radius: 0.125rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-3xl { border-radius: 1.5rem; }

/* Additional shadow utilities */
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }

/* Additional opacity utilities */
.opacity-0 { opacity: 0; }
.opacity-25 { opacity: 0.25; }
.opacity-75 { opacity: 0.75; }
.opacity-100 { opacity: 1; }`;
