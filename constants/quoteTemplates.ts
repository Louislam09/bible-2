import { TQuoteDataItem } from "./quotesData";

export const quoteTemplates = [
  {
    id: 1,
    name: "Inspiración Verde Elegante",
    description:
      "Un diseño elegante con tonos verdes y tipografía sofisticada para inspirar paz y reflexión. Incluye botón de descarga.",
    template: `<!DOCTYPE html>
 <html lang="es">
 <head>
 <meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1f4037, #99f2c8);
    font-family: 'Montserrat', sans-serif;
    color: #1a1a1a;
    padding: 3vmin;
  }

  .quote-box {
    background: rgba(255, 255, 255, 0.85);
    border-radius: 5vmin;
    padding: 6vmin 7vmin;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    box-shadow: 0 2vmin 4vmin rgba(0,0,0,0.25);
    position: relative;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .quote-box::before, .quote-box::after {
    font-family: 'Playfair Display', serif;
    font-size: 10vmin;
    position: absolute;
    color: rgba(31, 64, 55, 0.15);
    user-select: none;
  }

  .quote-box::before {
    content: '"';
    top: 2vmin;
    left: 3vmin;
  }

  .quote-box::after {
    content: '"';
    bottom: 2vmin;
    right: 3vmin;
  }

  .quote-text {
    font-family: 'Playfair Display', serif;
    font-size: 5.5vmin;
    font-weight: 700;
    line-height: 1.35;
    margin-bottom: 3vmin;
  }

  .verse {
    font-size: 3vmin;
    font-style: italic;
    color: #555;
  }
 </style>
 </head>
 <body>
   <div class="quote-box">
     <p class="quote-text">
       "{{text}}"
     </p>
     <p class="verse">
      {{ref}}
     </p>
   </div>
 </body>
 </html>
 `,
  },
  {
    id: 2,
    name: "Reflexión Azul Real",
    description:
      "Fondo azul real y detalles modernos que evocan profundidad y serenidad en cada cita.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat:wght@400;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #4b6cb7, #182848);
    font-family: 'Montserrat', sans-serif;
    color: #e0e6f8;
    padding: 3vmin;
  }
  .quote-box {
    background: rgba(25, 32, 61, 0.85);
    padding: 6vmin 7vmin;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    border-radius: 5vmin;
    box-shadow: 0 2vmin 4vmin rgba(25, 32, 61, 0.8);
    position: relative;
    text-align: center;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .quote-box::before,
  .quote-box::after {
    font-family: 'Playfair Display', serif;
    font-size: 10vmin;
    color: rgba(224, 230, 248, 0.15);
    position: absolute;
    pointer-events: none;
  }
  .quote-box::before {
    content: '"';
    top: 2vmin;
    left: 3vmin;
  }
  .quote-box::after {
    content: '"';
    bottom: 2vmin;
    right: 3vmin;
  }
  .quote-text {
    font-family: 'Playfair Display', serif;
    font-size: 5.5vmin;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 3vmin;
  }
  .verse {
    font-size: 3vmin;
    font-style: italic;
    opacity: 0.75;
  }
</style>
</head>
<body>
  <div class="quote-box">
    <p class="quote-text">
      "{{text}}"
    </p>
    <p class="verse">
     {{ref}}
    </p>
  </div>
</body>
</html>
    `,
  },
  {
    id: 3,
    name: "Sabiduría Violeta Clásica",
    description:
      "Estilo clásico en violeta, ideal para transmitir sabiduría y solemnidad bíblica.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Lora&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #453a94, #6e85b7);
    font-family: 'Lora', serif;
    color: #f0e9f4;
    padding: 3vmin;
  }
  .quote-container {
    background: rgba(20, 16, 60, 0.85);
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    padding: 6vmin 7vmin;
    border-radius: 5vmin;
    box-shadow: 0 2vmin 4vmin rgba(15, 12, 45, 0.7);
    position: relative;
    text-align: center;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .quote-container::before,
  .quote-container::after {
    content: """;
    font-family: 'Playfair Display', serif;
    font-size: 10vmin;
    position: absolute;
    color: rgba(240, 233, 244, 0.15);
    pointer-events: none;
  }
  .quote-container::before {
    top: 2vmin;
    left: 3vmin;
  }
  .quote-container::after {
    content: """;
    bottom: 2vmin;
    right: 3vmin;
  }
  .quote {
    font-family: 'Playfair Display', serif;
    font-size: 5.5vmin;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 3vmin;
  }
  .reference {
    font-size: 3vmin;
    font-style: italic;
    opacity: 0.7;
  }
</style>
</head>
<body>
  <div class="quote-container">
    <p class="quote">
       "{{text}}"
    </p>
    <p class="reference">
     {{ref}}
    </p>
  </div>
</body>
</html>
`,
  },
  {
    id: 4,
    name: "Serenidad Pastel Suave",
    description:
      "Colores pastel suaves y ambiente sereno para una experiencia de lectura reconfortante.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Roboto:ital,wght@0,400;1,400&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #f5cac3, #ede7f6);
    font-family: 'Roboto', sans-serif;
    padding: 3vmin;
  }
  .quote-container {
    background: #ffffffdd;
    border-radius: 5vmin;
    box-shadow: 0 2vmin 4vmin rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    padding: 6vmin 7vmin;
    text-align: center;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .quote-container::before, .quote-container::after {
    content: '"';
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 10vmin;
    color: #7b448b;
    position: absolute;
    opacity: 0.5;
    user-select: none;
  }
  .quote-container::before {
    top: 2vmin;
    left: 3vmin;
  }
  .quote-container::after {
    content: '"';
    bottom: 2vmin;
    right: 3vmin;
  }
  .quote-text {
    font-size: 5vmin;
    color: #4a2c77;
    line-height: 1.5;
    margin-bottom: 3vmin;
    font-style: italic;
  }
  .quote-ref {
    font-size: 3vmin;
    color: #9e6fdb;
    font-weight: 600;
    font-family: 'Montserrat', sans-serif;
  }
</style>
</head>
<body>
  <div class="quote-container" role="blockquote" aria-label="Proverbio bíblico">
    <p class="quote-text">"{{text}}"</p>
    <p class="quote-ref">{{ref}}</p>
  </div>
</body>
</html>
`,
  },
  {
    id: 5,
    name: "Gracia Lavanda",
    description:
      "Diseño en tonos lavanda con elegancia y gracia, perfecto para citas inspiradoras.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto:ital,wght@0,400;1,400&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #b0c2f2, #d8bfd8);
    font-family: 'Roboto', sans-serif;
    color: #3e2c41;
    padding: 3vmin;
  }
  .quote-container {
    background: #faf3ffdd;
    border-radius: 5vmin;
    box-shadow: 0 2vmin 4vmin rgba(121, 81, 145, 0.3);
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    padding: 6vmin 7vmin;
    text-align: center;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .quote-container::before,
  .quote-container::after {
    content: '"';
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 10vmin;
    color: #9a5b99;
    position: absolute;
    opacity: 0.25;
    user-select: none;
  }
  .quote-container::before {
    top: 2vmin;
    left: 3vmin;
  }
  .quote-container::after {
    content: '"';
    bottom: 2vmin;
    right: 3vmin;
  }
  .quote-text {
    font-size: 5vmin;
    line-height: 1.6;
    font-style: italic;
    margin-bottom: 3vmin;
    color: #3e2c41;
  }
  .quote-ref {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 3vmin;
    color: #885ead;
  }
</style>
</head>
<body>
  <div class="quote-container" role="blockquote" aria-label="Proverbio bíblico">
    <p class="quote-text">{{text}}</p> <!-- No explicit quotes here, rely on ::before/::after or style -->
    <p class="quote-ref">{{ref}}</p>
  </div>
</body>
</html>`,
  },
  // --- NEW TEMPLATES START HERE ---
  {
    id: 6,
    name: "Atardecer Dorado Profundo",
    description:
      "Un diseño cálido con tonos de atardecer y tipografía serif elegante para citas memorables.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Cita Inspiradora</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Lato:wght@400;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #780206, #061161);
    font-family: 'Lato', sans-serif;
    color: #FDEBD0;
    padding: 3vmin;
  }
  .quote-card {
    background: rgba(0, 0, 0, 0.55);
    border-radius: 5vmin;
    padding: 6vmin 7vmin;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    box-shadow: 0 2vmin 4vmin rgba(0,0,0,0.5);
    text-align: center;
    border-left: 1vmin solid #FFC300;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .quote-text-content {
    font-family: 'Merriweather', serif;
    font-size: 5.5vmin;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 3vmin;
    position: relative;
  }
  .quote-text-content::before {
    content: '"';
    font-size: 8vmin;
    font-family: 'Merriweather', serif;
    color: #FFC300;
    position: absolute;
    left: -2vmin;
    top: -3vmin;
    opacity: 0.7;
    user-select: none;
  }
  .quote-reference {
    font-size: 3vmin;
    font-style: italic;
    color: #FFD700;
    font-weight: 400;
  }
</style>
</head>
<body>
  <div class="quote-card">
    <p class="quote-text-content">"{{text}}"</p>
    <p class="quote-reference">{{ref}}</p>
  </div>
</body>
</html>
`,
  },
  {
    id: 7,
    name: "Minimalista Noche Estrellada",
    description:
      "Un diseño oscuro y minimalista con sutiles toques celestiales y tipografía clara.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Cita Inspiradora</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&family=Raleway:wght@300;500&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to bottom right, #0F2027, #203A43, #2C5364);
    font-family: 'Open Sans', sans-serif;
    color: #EAEAEA;
    padding: 3vmin;
  }
  .quote-wrapper {
    background: rgba(44, 82, 100, 0.4);
    border-radius: 5vmin;
    padding: 6vmin 7vmin;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    box-shadow: 0 2vmin 4vmin rgba(0,0,0,0.4);
    text-align: left;
    border-top: 0.6vmin solid #92a1ac;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .quote-main-text {
    font-family: 'Raleway', sans-serif;
    font-size: 5vmin;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 3vmin;
    color: #FFFFFF;
  }
  .quote-source {
    font-size: 3vmin;
    font-weight: 300;
    color: #BDC3C7;
    text-align: right;
  }
  .quote-source::before {
    content: "— ";
  }
</style>
</head>
<body>
  <div class="quote-wrapper">
    <p class="quote-main-text">"{{text}}"</p>
    <p class="quote-source">{{ref}}</p>
  </div>
</body>
</html>
`,
  },
  {
    id: 8,
    name: "Pergamino Antiguo",
    description:
      "Evoca la solemnidad de los textos antiguos con texturas de pergamino y tipografía clásica.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Cita Inspiradora</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Crimson+Text:wght@400;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #F1E9D2; 
    background-image:
      radial-gradient(rgba(180, 160, 130, 0.15) 1px, transparent 1.2px),
      radial-gradient(rgba(180, 160, 130, 0.15) 1px, transparent 1.2px);
    background-size: 3vmin 3vmin;
    background-position: 0 0, 1.5vmin 1.5vmin;
    font-family: 'Crimson Text', serif;
    color: #4A3B31;
    padding: 3vmin;
  }
  .scroll-container {
    background: #FAF0E6; 
    border: 0.2vmin solid #D2B48C; 
    border-radius: 1vmin;
    padding: 6vmin 7vmin;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    box-shadow: 0.6vmin 0.6vmin 2vmin rgba(74, 59, 49, 0.25),
                inset 0 0 3vmin rgba(222, 184, 135, 0.3);
    text-align: center;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .scroll-container::before, .scroll-container::after {
    content: '';
    position: absolute;
    height: 0.2vmin;
    background-color: #A0522D;
    opacity: 0.5;
  }
  .scroll-container::before {
    top: 3vmin; left: 4vmin; right: 4vmin;
  }
  .scroll-container::after {
    bottom: 3vmin; left: 4vmin; right: 4vmin;
  }
  .quote-script {
    font-family: 'EB Garamond', serif;
    font-size: 5vmin; 
    font-weight: 400;
    line-height: 1.6;
    margin-bottom: 3vmin;
    color: #5D4037; 
  }
  .quote-attribution {
    font-family: 'EB Garamond', serif;
    font-size: 3vmin;
    font-style: italic;
    color: #795548;
  }
</style>
</head>
<body>
  <div class="scroll-container">
    <p class="quote-script">"{{text}}"</p>
    <p class="quote-attribution">{{ref}}</p>
  </div>
</body>
</html>
`,
  },
  {
    id: 10,
    name: "Moderno Geométrico Impacto",
    description:
      "Líneas limpias y acentos geométricos audaces para una presentación contemporánea y memorable de la cita.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Cita Inspiradora</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Oswald:wght@400;600&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f2f5;
    font-family: 'Montserrat', sans-serif;
    color: #333;
    padding: 3vmin;
  }
  .geo-quote-box {
    background: #FFFFFF;
    border-radius: 2vmin;
    padding: 6vmin 7vmin;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    box-shadow: 0 2vmin 4vmin rgba(0,0,0,0.08);
    text-align: left;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .geo-quote-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 2vmin; 
    height: 100%;
    background-color: #FF5733;
  }
  .geo-quote-box::after {
    content: '';
    position: absolute;
    bottom: 0px;
    right: 0px;
    width: 20vmin;
    height: 20vmin;
    background-color: #3498db;
    opacity: 0.1;
    clip-path: polygon(100% 0, 0 100%, 100% 100%);
    z-index: 0;
  }
  .quote-content-main {
    font-family: 'Oswald', sans-serif;
    font-size: 5.5vmin;
    font-weight: 600;
    line-height: 1.35;
    margin-bottom: 3vmin;
    color: #2c3e50; 
    position: relative;
    z-index: 1;
    padding-left: 3vmin;
  }
  .quote-ref-source {
    font-family: 'Montserrat', sans-serif;
    font-size: 3vmin;
    font-weight: 700;
    color: #FF5733; 
    text-align: right;
    font-style: normal;
    position: relative;
    z-index: 1;
    padding-right: 2vmin;
  }
</style>
</head>
<body>
  <div class="geo-quote-box">
    <p class="quote-content-main">"{{text}}"</p>
    <p class="quote-ref-source">{{ref}}</p>
  </div>
</body>
</html>
`,
  },
  {
    id: 24,
    name: "Arte Abstracto Vibrante",
    description:
      "Formas audaces, colores contrastantes y un diseño moderno para una cita con energía artística.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #eef1f5;
      font-family: 'Inter', sans-serif;
      padding: 3vmin;
    }
    .abstract-art-quote {
      background: #ffffff;
      border-radius: 3vmin;
      padding: 6vmin 7vmin;
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      box-shadow: 0 2vmin 4vmin rgba(0,0,0,0.1);
      text-align: left;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .abstract-art-quote::before {
      content: '';
      position: absolute;
      top: -10vmin;
      left: -10vmin;
      width: 30vmin;
      height: 30vmin;
      background: #ff6b6b;
      border-radius: 50%;
      opacity: 0.8;
      z-index: 0;
    }
    .abstract-art-quote::after {
      content: '';
      position: absolute;
      bottom: -12vmin;
      right: -8vmin;
      width: 40vmin;
      height: 24vmin;
      background: #4ecdc4;
      transform: rotate(30deg);
      border-radius: 2vmin;
      opacity: 0.7;
      z-index: 0;
    }
    .quote-content {
      position: relative;
      z-index: 1;
    }
    .quote-text-bold {
      font-family: 'Archivo Black', sans-serif;
      font-size: 5.5vmin;
      line-height: 1.25;
      margin-bottom: 3vmin;
      color: #2c3e50;
    }
    .quote-ref-clean {
      font-size: 3vmin;
      font-weight: 600;
      color: #555;
      text-align: right;
    }
    .quote-ref-clean::before {
      content: "— ";
    }
  </style>
  </head>
  <body>
    <div class="abstract-art-quote">
      <div class="quote-content">
        <p class="quote-text-bold">"{{text}}"</p>
        <p class="quote-ref-clean">{{ref}}</p>
      </div>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 26,
    name: "Minimalismo Japonés Zen",
    description:
      "Diseño limpio y aireado con inspiración japonesa, usando tonos naturales y tipografía simple.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;500&family=Shippori+Mincho:wght@500&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f4f1ea;
      font-family: 'Noto Sans JP', sans-serif;
      color: #3c3c3c;
      padding: 3vmin;
    }
    .zen-quote-panel {
      background: #ffffff;
      border-radius: 2vmin;
      padding: 6vmin 7vmin;
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      box-shadow: 0 1vmin 3vmin rgba(0,0,0,0.05);
      text-align: left;
      position: relative;
      border-top: 0.8vmin solid #8c7b70;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .zen-quote-panel::after {
      content: '';
      position: absolute;
      bottom: 4vmin;
      left: 7vmin;
      right: 7vmin;
      height: 0.2vmin;
      background-color: #d3c7b7;
    }
    .quote-text-haiku {
      font-family: 'Shippori Mincho', serif;
      font-size: 4.5vmin;
      font-weight: 500;
      line-height: 1.8;
      margin-bottom: 5vmin;
      color: #4a4a4a;
    }
    .quote-ref-shodo {
      font-size: 2.5vmin;
      font-weight: 300;
      color: #707070;
      text-align: right;
      padding-top: 2vmin;
    }
  </style>
  </head>
  <body>
    <div class="zen-quote-panel">
      <p class="quote-text-haiku">"{{text}}"</p>
      <p class="quote-ref-shodo">{{ref}}</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 31,
    name: "Blueprint Técnico Limpio",
    description:
      "Estilo de plano técnico con fondo azul, cuadrícula blanca y tipografía precisa.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Aldrich&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #003366;
      background-image:
        linear-gradient(rgba(255,255,255,0.1) 0.2vmin, transparent 0.2vmin),
        linear-gradient(90deg, rgba(255,255,255,0.1) 0.2vmin, transparent 0.2vmin);
      background-size: 4vmin 4vmin;
      font-family: 'Roboto Mono', monospace;
      color: #ffffff;
      padding: 3vmin;
    }
    .blueprint-sheet {
      background: rgba(0, 51, 102, 0.7);
      border: 0.2vmin solid #66aaff;
      border-radius: 1vmin;
      padding: 5vmin;
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      box-shadow: 0 0 2vmin rgba(102, 170, 255, 0.3);
      text-align: left;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .title-block {
      border-bottom: 0.4vmin solid #99ccff;
      padding-bottom: 2vmin;
      margin-bottom: 3vmin;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title-block-main {
      font-family: 'Aldrich', sans-serif;
      font-size: 3.5vmin;
      color: #e6f2ff;
    }
    .title-block-rev {
      font-size: 2.5vmin;
      color: #b3daff;
    }
    .quote-text-specs {
      font-size: 4.5vmin;
      line-height: 1.6;
      margin-bottom: 3vmin;
      color: #f0f8ff;
    }
    .quote-ref-drawingno {
      font-size: 2.5vmin;
      color: #cce6ff;
      text-align: right;
      border-top: 0.2vmin dashed #99ccff;
      padding-top: 2vmin;
    }
  </style>
  </head>
  <body>
    <div class="blueprint-sheet">
      <div class="title-block">
        <span class="title-block-main">PROYECTO: INSPIRACIÓN</span>
        <span class="title-block-rev">REV: 1.0</span>
      </div>
      <p class="quote-text-specs">"{{text}}"</p>
      <p class="quote-ref-drawingno">REF. #: {{ref}}</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 38,
    name: "Cristal Fracturado Neón",
    description:
      "Efecto de cristal roto con brillos de neón sobre un fondo oscuro para un look moderno y dinámico.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Turret+Road:wght@300;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #08080c;
      font-family: 'Turret Road', cursive;
      color: #e0e0ff;
      padding: 3vmin;
    }
    .shattered-glass-quote {
      background: rgba(10, 10, 20, 0.5);
      padding: 6vmin;
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      box-shadow: 0 0 4vmin rgba(255,0,255,0.3), 0 0 7vmin rgba(0,255,255,0.3);
      text-align: center;
      position: relative;
      border: 0.2vmin solid rgba(120,120,180,0.3);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .shard {
      position: absolute;
      background: linear-gradient(45deg, rgba(255,0,255,0.5), rgba(0,255,255,0.5));
      opacity: 0.2;
      box-shadow: 0 0 2vmin rgba(255,0,255,0.4), 0 0 2vmin rgba(0,255,255,0.4);
    }
    .shard1 { top: -4vmin; left: 10%; width: 16vmin; height: 20vmin; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); transform: rotate(15deg); }
    .shard2 { bottom: -6vmin; right: 5%; width: 20vmin; height: 14vmin; clip-path: polygon(0 0, 100% 0, 50% 100%); transform: rotate(-10deg); }
    .shard3 { top: 20%; right: -5vmin; width: 12vmin; height: 24vmin; clip-path: polygon(100% 0, 100% 100%, 0 50%); transform: rotate(5deg); }
    .shard4 { bottom: 15%; left: -6vmin; width: 14vmin; height: 18vmin; clip-path: polygon(0 0, 0 100%, 100% 50%); transform: rotate(-5deg); }
  
    .quote-text-glitch {
      font-family: 'Audiowide', cursive;
      font-size: 5vmin;
      line-height: 1.4;
      margin-bottom: 3vmin;
      color: #fff;
      text-shadow: 0 0 1vmin #f0f, 0 0 1.5vmin #0ff;
      position: relative;
      z-index: 1;
    }
    .quote-ref-matrix {
      font-size: 3vmin;
      font-weight: 700;
      color: #8aff8a;
      text-transform: uppercase;
      letter-spacing: 0.2vmin;
      position: relative;
      z-index: 1;
    }
  </style>
  </head>
  <body>
    <div class="shattered-glass-quote">
      <div class="shard shard1"></div>
      <div class="shard shard2"></div>
      <div class="shard shard3"></div>
      <div class="shard shard4"></div>
      <p class="quote-text-glitch">"{{text}}"</p>
      <p class="quote-ref-matrix">> {{ref}}</p>
    </div>
  </body>
  </html>
  `,
  },
];

export const quoteTemplatesMaker = (selectedTheme: TQuoteDataItem) => {
  return `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Proverbio Inspirador</title>
  <style>
    @import url('${selectedTheme.font.url}');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: '${selectedTheme.font.name}', sans-serif;
      color: #ffffff;
      background-color: transparent;
      padding: 3vmin;
    }
  
    .quote-box {
      position: relative;
      text-align: center;
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
    }
  
    .quote-text {
      font-family: '${selectedTheme.font.name}', sans-serif;
      font-size: 5.5vmin;
      font-weight: 500;
      line-height: 1.35;
      margin-bottom: 3vmin;
      text-transform: ${selectedTheme.textTransform};
    }
   
    .verse-container {
      text-align: center;
      position: relative;
      width: fit-content;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .verse {
      font-size: 3.5vmin;
      text-transform: ${selectedTheme.textTransform};
    }
    .verse-line {
      background-image: linear-gradient(90deg, #f8b04b 0, #e8465b 40.1%, #00a8c3 73.96%, #60bba2);
      height: 0.8vmin;
      width: 60%;
      border-radius: 16px;
      margin-top: -2vmin;
    }
 
    .watermark {
      position: absolute;
      bottom: 2vmin;
      right: 2vmin;
      font-size: 2vmin;
      color: #ffffff;
      font-family: sans-serif;
      width: 100%;
    }
    .watermark.none, .verse-line.none {
      display: none;
    }
   .verse-container:has(.verse-line.none) .verse {
      font-family: sans-serif;
    }
    .watermark-text {
      font-size: 2.5vmin;
      color: #ffffff;
      text-align: center;
    }
   
  </style>
  </head>
  <body>
    <div class="quote-box">
      <p class="quote-text">
        {{text}}
      </p>
      <div class="verse-container">
        <p class="verse">
        {{ref}}
        </p>
        <div class="verse-line {{verseLineClass}}"></div>
      </div>
    </div>
    <div class="watermark {{watermarkClass}}">
      <p class="watermark-text"><b>Descargar:</b> Santa Biblia RV60+Audio</p>
    </div>
  </body>
  </html>
  `
}

export const quoteMusicTemplatesMaker = (selectedTheme: TQuoteDataItem) => {
  return `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=0.6" />
  <title>Proverbio Inspirador</title>
  <style>
    @import url('${selectedTheme.font.url}');
  
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: '${selectedTheme.font.name}', sans-serif;
      color: #ffffff;
      margin: 0 1rem;
      background-color: transparent;
    }
  
    .quote-box {
      position: relative;
      text-align: center;
      display: grid;
      place-items: center;
    }
  
    .quote-text {
      font-family: '${selectedTheme.font.name}', sans-serif;
      font-size: 2.5rem;
      font-weight: 500;
      line-height: 1.35;
      margin-bottom: 1.5rem;
      text-transform: ${selectedTheme.textTransform};
    }
   
    .verse-container {
      text-align: center;
      position: relative;
      width: fit-content;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .verse {
      font-size: 1.8rem;
      text-transform: ${selectedTheme.textTransform};
    }
    .verse-line {
      background-image: linear-gradient(90deg, #f8b04b 0, #e8465b 40.1%, #00a8c3 73.96%, #60bba2);
      height: 4px;
      width: 60%;
      border-radius: 16px;
      margin-top: -1rem;
    }
 
    .watermark {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      font-size: 1rem;
      color: #ffffff;
      font-family: sans-serif;
      width: 100%;
    }
    .watermark.none, .verse-line.none {
      display: none;
    }
   .verse-container:has(.verse-line.none) .verse {
      font-family: sans-serif;
    }
    .watermark-text {
      font-size: 1.3rem;
      color: #ffffff;
      text-align: center;
    }
   
  </style>
  </head>
  <body>
    <div class="quote-box">
      <p class="quote-text">
        {{text}}
      </p>
      <div class="verse-container">
        <p class="verse">
        {{ref}}
        </p>
        <div class="verse-line {{verseLineClass}}"></div>
      </div>
    </div>
    <div class="watermark {{watermarkClass}}">
      <p class="watermark-text"><b>Descargar:</b> Santa Biblia RV60+Audio</p>
    </div>
  </body>
  </html>
  `
}

