// export const quoteTemplates = [
//   {
//     id: 1,
//     name: "Inspiración Verde Elegante",
//     description: "Un diseño elegante con tonos verdes y tipografía sofisticada para inspirar paz y reflexión.",
//     template: `<!DOCTYPE html>
// <html lang="es">
// <head>
// <meta charset="UTF-8" />
// <meta name="viewport" content="width=device-width, initial-scale=0.5" />
// <title>Proverbio Inspirador</title>
// <style>
//   @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat&display=swap');

//   body {
//     margin: 0;
//     height: 100vh;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     background: linear-gradient(135deg, #1f4037, #99f2c8);
//     font-family: 'Montserrat', sans-serif;
//     color: #1a1a1a;
//     margin: 0 1rem;
//       margin: 0 1rem;
//   }

//   .quote-box {
//     background: rgba(255, 255, 255, 0.85);
//     border-radius: 25px;
//     padding: 3rem 4rem;
//     max-width: 650px;
//     box-shadow: 0 25px 40px rgba(0,0,0,0.25);
//     position: relative;
//     text-align: center;
//   }

//   .quote-box::before, .quote-box::after {
//     font-family: 'Playfair Display', serif;
//     font-size: 6rem;
//     position: absolute;
//     color: rgba(31, 64, 55, 0.15);
//     user-select: none;
//   }

//   .quote-box::before {
//     content: '“';
//     top: 15px;
//     left: 20px;
//   }

//   .quote-box::after {
//     content: '”';
//     bottom: 15px;
//     right: 20px;
//   }

//   .quote-text {
//     font-family: 'Playfair Display', serif;
//     font-size: 2.8rem;
//     font-weight: 700;
//     line-height: 1.35;
//     margin-bottom: 1.5rem;
//   }

//   .verse {
//     font-size: 1.3rem;
//     font-style: italic;
//     color: #555;
//   }
// </style>
// </head>
// <body>
//   <div class="quote-box">
//     <p class="quote-text">
//       "{{text}}"
//     </p>
//     <p class="verse">
//      {{ref}}
//     </p>
//   </div>
// </body>
// </html>
// `,
//   },
//   {
//     id: 2,
//     name: "Reflexión Azul Real",
//     description: "Fondo azul real y detalles modernos que evocan profundidad y serenidad en cada cita.",
//     template: `<!DOCTYPE html>
// <html lang="es">
// <head>
// <meta charset="UTF-8" />
// <meta name="viewport" content="width=device-width, initial-scale=0.7" />
// <title>Proverbio Inspirador</title>
// <style>
//   @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat:wght@400;700&display=swap');
//   body {
//     margin: 0;
//     height: 100vh;
//     background: linear-gradient(135deg, #4b6cb7, #182848);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     font-family: 'Montserrat', sans-serif;
//     color: #e0e6f8;
//       margin: 0 1rem;
//         margin: 0 1rem;
//   }
//   .quote-box {
//     background: rgba(25, 32, 61, 0.85);
//     padding: 3rem 3.5rem;
//     max-width: 680px;
//     border-radius: 30px;
//     box-shadow: 0 20px 40px rgba(25, 32, 61, 0.8);
//     position: relative;
//     text-align: center;
//     user-select: none;
//   }
//   .quote-box::before,
//   .quote-box::after {
//     font-family: 'Playfair Display', serif;
//     font-size: 8rem;
//     color: rgba(224, 230, 248, 0.15);
//     position: absolute;
//     pointer-events: none;
//   }
//   .quote-box::before {
//     content: '“';
//     top: 10px;
//     left: 20px;
//   }
//   .quote-box::after {
//     content: '”';
//     bottom: 10px;
//     right: 20px;
//   }
//   .quote-text {
//     font-family: 'Playfair Display', serif;
//     font-size: 2.8rem;
//     font-weight: 700;
//     line-height: 1.3;
//     margin: 0 0 1.5rem 0;
//   }
//   .verse {
//     font-size: 1.4rem;
//     font-style: italic;
//     opacity: 0.75;
//   }
// </style>
// </head>
// <body>
//   <div class="quote-box">
//     <p class="quote-text">
//       "{{text}}"
//     </p>
//     <p class="verse">
//      {{ref}}
//     </p>
//   </div>
// </body>
// </html>
//     `,
//   },
//   {
//     id: 3,
//     name: "Sabiduría Violeta Clásica",
//     description: "Estilo clásico en violeta, ideal para transmitir sabiduría y solemnidad bíblica.",
//     template: `<!DOCTYPE html>
// <html lang="es">
// <head>
// <meta charset="UTF-8" />
// <meta name="viewport" content="width=device-width, initial-scale=0.7" />
// <title>Proverbio Inspirador</title>
// <style>
//   @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Lora&display=swap');
//   body {
//     margin: 0;
//     height: 100vh;
//     background: linear-gradient(135deg, #453a94, #6e85b7);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     font-family: 'Lora', serif;
//     color: #f0e9f4;
//       margin: 0 1rem;
//         margin: 0 1rem;
//   }
//   .quote-container {
//     background: rgba(20, 16, 60, 0.85);
//     max-width: 680px;
//     padding: 3.5rem 4rem;
//     border-radius: 28px;
//     box-shadow: 0 15px 40px rgba(15, 12, 45, 0.7);
//     position: relative;
//     text-align: center;
//     user-select: none;
//   }
//   .quote-container::before,
//   .quote-container::after {
//     content: "“";
//     font-family: 'Playfair Display', serif;
//     font-size: 8rem;
//     position: absolute;
//     color: rgba(240, 233, 244, 0.15);
//     pointer-events: none;
//   }
//   .quote-container::before {
//     top: 10px;
//     left: 20px;
//   }
//   .quote-container::after {
//     content: "”";
//     bottom: 10px;
//     right: 20px;
//   }
//   .quote {
//     font-family: 'Playfair Display', serif;
//     font-size: 2.8rem;
//     font-weight: 700;
//     line-height: 1.3;
//     margin: 0 0 1.8rem 0;
//   }
//   .reference {
//     font-size: 1.3rem;
//     font-style: italic;
//     opacity: 0.7;
//   }
// </style>
// </head>
// <body>
//   <div class="quote-container">
//     <p class="quote">
//        "{{text}}"
//     </p>
//     <p class="reference">
//      {{ref}}
//     </p>
//   </div>
// </body>
// </html>
// `,
//   },
//   {
//     id: 4,
//     name: "Serenidad Pastel Suave",
//     description: "Colores pastel suaves y ambiente sereno para una experiencia de lectura reconfortante.",
//     template: `<!DOCTYPE html>
// <html lang="es">
// <head>
// <meta charset="UTF-8" />
// <meta name="viewport" content="width=device-width, initial-scale=0.7" />
// <title>Proverbio Inspirador</title>
// <style>
//   @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto&display=swap');

//   body {
//     margin: 0;
//     height: 100vh;
//     background: linear-gradient(135deg, #f5cac3, #ede7f6);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     font-family: 'Roboto', sans-serif;
//       margin: 0 1rem;
//   }
//   .quote-container {
//     background: #ffffffdd;
//     border-radius: 20px;
//     box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
//     max-width: 600px;
//     padding: 40px 50px;
//     text-align: center;
//     position: relative;
//   }
//   .quote-container::before, .quote-container::after {
//     content: '“';
//     font-family: 'Montserrat', sans-serif;
//     font-weight: 700;
//     font-size: 6rem;
//     color: #7b448b;
//     position: absolute;
//   }
//   .quote-container::before {
//     top: -40px;
//     left: 25px;
//   }
//   .quote-container::after {
//     content: '”';
//     bottom: -50px;
//     right: 25px;
//   }
//   .quote-text {
//     font-size: 1.8rem;
//     color: #4a2c77;
//     line-height: 1.5;
//     margin-bottom: 20px;
//     font-style: italic;
//   }
//   .quote-ref {
//     font-size: 1.1rem;
//     color: #9e6fdb;
//     font-weight: 600;
//     font-family: 'Montserrat', sans-serif;
//   }
// </style>
// </head>
// <body>
//   <div class="quote-container" role="blockquote" aria-label="Proverbio bíblico">
//     <p class="quote-text">"{{text}}"</p>
//     <p class="quote-ref">{{ref}}</p>
//   </div>
// </body>
// </html>
// `,
//   },
//   {
//     id: 5,
//     name: "Gracia Lavanda",
//     description: "Diseño en tonos lavanda con elegancia y gracia, perfecto para citas inspiradoras.",
//     template: `<!DOCTYPE html>
// <html lang="es">
// <head>
// <meta charset="UTF-8" />
// <meta name="viewport" content="width=device-width, initial-scale=0.7" />
// <title>Proverbio Inspirador</title>
// <style>
//   @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto&display=swap');
//   body {
//     margin: 0;
//     height: 100vh;
//     background: linear-gradient(135deg, #85a3b2, #d8bfd8);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     font-family: 'Roboto', sans-serif;
//     color: #3e2c41;
//       margin: 0 1rem;
//   }
//   .quote-container {
//     background: #faf3ffdd;
//     border-radius: 30px;
//     box-shadow: 0 20px 50px rgba(121, 81, 145, 0.3);
//     max-width: 650px;
//     padding: 50px 60px;
//     text-align: center;
//     position: relative;
//   }
//   .quote-container::before,
//   .quote-container::after {
//     content: '“';
//     font-family: 'Montserrat', sans-serif;
//     font-weight: 700;
//     font-size: 7rem;
//     color: #9a5b99;
//     position: absolute;
//     opacity: 0.15;
//     user-select: none;
//   }
//   .quote-container::before {
//     top: -40px;
//     left: 25px;
//     transform: rotate(180deg);
//   }
//   .quote-container::after {
//     bottom: -60px;
//     right: 25px;
//   }
//   .quote-text {
//     font-size: 2rem;
//     line-height: 1.6;
//     font-style: italic;
//     margin-bottom: 30px;
//   }
//   .quote-ref {
//     font-family: 'Montserrat', sans-serif;
//     font-weight: 700;
//     font-size: 1.2rem;
//     color: #885ead;
//   }
// </style>
// </head>
// <body>
//   <div class="quote-container" role="blockquote" aria-label="Proverbio bíblico">
//     <p class="quote-text">{{text}}</p>
//     <p class="quote-ref">{{ref}}</p>
//   </div>
// </body>
// </html>`,
//   },
// ];

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
 <meta name="viewport" content="width=device-width, initial-scale=0.5" />
 <title>Proverbio Inspirador</title>
 <style>
   @import url('https:fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat&display=swap');

   body {
     margin: 0;
     height: 100vh;
     display: flex;
     justify-content: center;
     align-items: center;
     background: linear-gradient(135deg, #1f4037, #99f2c8);
     font-family: 'Montserrat', sans-serif;
     color: #1a1a1a;
     margin: 0 1rem;
       margin: 0 1rem;
   }

   .quote-box {
     background: rgba(255, 255, 255, 0.85);
     border-radius: 25px;
     padding: 3rem 4rem;
     max-width: 650px;
     box-shadow: 0 25px 40px rgba(0,0,0,0.25);
     position: relative;
     text-align: center;
   }

   .quote-box::before, .quote-box::after {
     font-family: 'Playfair Display', serif;
     font-size: 6rem;
     position: absolute;
     color: rgba(31, 64, 55, 0.15);
     user-select: none;
   }

   .quote-box::before {
     content: '“';
     top: 15px;
     left: 20px;
   }

   .quote-box::after {
     content: '”';
     bottom: 15px;
     right: 20px;
   }

   .quote-text {
     font-family: 'Playfair Display', serif;
     font-size: 2.8rem;
     font-weight: 700;
     line-height: 1.35;
     margin-bottom: 1.5rem;
   }

   .verse {
     font-size: 1.3rem;
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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat:wght@400;700&display=swap');
  body {
    margin: 0;
    min-height: 100vh;
    background: linear-gradient(135deg, #4b6cb7, #182848);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Montserrat', sans-serif;
    color: #e0e6f8;
    padding: 1rem;
    box-sizing: border-box;
  }
  .quote-box {
    background: rgba(25, 32, 61, 0.85);
    padding: 3rem 3.5rem;
    max-width: 680px;
    width: 100%;
    border-radius: 30px;
    box-shadow: 0 20px 40px rgba(25, 32, 61, 0.8);
    position: relative;
    text-align: center;
    user-select: none;
  }
  .quote-box::before,
  .quote-box::after {
    font-family: 'Playfair Display', serif;
    font-size: 8rem;
    color: rgba(224, 230, 248, 0.15);
    position: absolute;
    pointer-events: none;
  }
  .quote-box::before {
    content: '“';
    top: 10px;
    left: 20px;
  }
  .quote-box::after {
    content: '”';
    bottom: 10px;
    right: 20px;
  }
  .quote-text {
    font-family: 'Playfair Display', serif;
    font-size: 2.8rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0 0 1.5rem 0;
  }
  .verse {
    font-size: 1.4rem;
    font-style: italic;
    opacity: 0.75;
  }
  @media (max-width: 768px) {
    .quote-box { padding: 2rem 2.5rem; }
    .quote-text { font-size: 2.2rem; }
    .verse { font-size: 1.2rem; }
    .quote-box::before, .quote-box::after { font-size: 6rem; }
  }
  @media (max-width: 480px) {
    .quote-text { font-size: 1.8rem; }
    .verse { font-size: 1.1rem; }
     .quote-box::before, .quote-box::after { font-size: 4rem; }
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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Lora&display=swap');
  body {
    margin: 0;
    min-height: 100vh;
    background: linear-gradient(135deg, #453a94, #6e85b7);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Lora', serif;
    color: #f0e9f4;
    padding: 1rem;
    box-sizing: border-box;
  }
  .quote-container {
    background: rgba(20, 16, 60, 0.85);
    max-width: 680px;
    width: 100%;
    padding: 3.5rem 4rem;
    border-radius: 28px;
    box-shadow: 0 15px 40px rgba(15, 12, 45, 0.7);
    position: relative;
    text-align: center;
    user-select: none;
  }
  .quote-container::before,
  .quote-container::after {
    content: "“";
    font-family: 'Playfair Display', serif;
    font-size: 8rem;
    position: absolute;
    color: rgba(240, 233, 244, 0.15);
    pointer-events: none;
  }
  .quote-container::before {
    top: 10px;
    left: 20px;
  }
  .quote-container::after {
    content: "”";
    bottom: 10px;
    right: 20px;
  }
  .quote {
    font-family: 'Playfair Display', serif;
    font-size: 2.8rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0 0 1.8rem 0;
  }
  .reference {
    font-size: 1.3rem;
    font-style: italic;
    opacity: 0.7;
  }
  @media (max-width: 768px) {
    .quote-container { padding: 2.5rem 3rem; }
    .quote { font-size: 2.2rem; }
    .reference { font-size: 1.1rem; }
    .quote-container::before, .quote-container::after { font-size: 6rem; }
  }
   @media (max-width: 480px) {
    .quote { font-size: 1.8rem; }
    .reference { font-size: 1rem; }
    .quote-container::before, .quote-container::after { font-size: 4rem; }
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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Roboto:ital,wght@0,400;1,400&display=swap');

  body {
    margin: 0;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5cac3, #ede7f6);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Roboto', sans-serif;
    padding: 1rem;
    box-sizing: border-box;
  }
  .quote-container {
    background: #ffffffdd;
    border-radius: 20px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 100%;
    padding: 40px 50px;
    text-align: center;
    position: relative;
  }
  .quote-container::before, .quote-container::after {
    content: '“';
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 6rem;
    color: #7b448b; /* Adjusted from previous to a visible color from palette */
    position: absolute;
    opacity: 0.5; /* Make it a bit subtle */
    user-select: none;
  }
  .quote-container::before {
    top: -20px; /* Adjusted position */
    left: 15px;
  }
  .quote-container::after {
    content: '”';
    bottom: -30px; /* Adjusted position */
    right: 15px;
  }
  .quote-text {
    font-size: 1.8rem;
    color: #4a2c77;
    line-height: 1.5;
    margin-bottom: 20px;
    font-style: italic;
  }
  .quote-ref {
    font-size: 1.1rem;
    color: #9e6fdb;
    font-weight: 600;
    font-family: 'Montserrat', sans-serif;
  }
  @media (max-width: 600px) {
    .quote-container { padding: 30px 35px; }
    .quote-text { font-size: 1.5rem; }
    .quote-ref { font-size: 1rem; }
    .quote-container::before, .quote-container::after { font-size: 4rem; }
    .quote-container::before { top: -15px; left: 10px; }
    .quote-container::after { bottom: -20px; right: 10px; }
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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto:ital,wght@0,400;1,400&display=swap');
  body {
    margin: 0;
    min-height: 100vh;
    background: linear-gradient(135deg, #b0c2f2, #d8bfd8); /* Adjusted lavendar/blueish gradient */
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Roboto', sans-serif;
    color: #3e2c41;
    padding: 1rem;
    box-sizing: border-box;
  }
  .quote-container {
    background: #faf3ffdd;
    border-radius: 30px;
    box-shadow: 0 20px 50px rgba(121, 81, 145, 0.3);
    max-width: 650px;
    width: 100%;
    padding: 50px 60px;
    text-align: center;
    position: relative;
  }
  .quote-container::before,
  .quote-container::after {
    content: '“';
    font-family: 'Montserrat', sans-serif; /* Changed to a more standard quote font */
    font-weight: 700;
    font-size: 7rem;
    color: #9a5b99;
    position: absolute;
    opacity: 0.25; /* Slightly more visible */
    user-select: none;
  }
  .quote-container::before {
    top: 10px; /* Adjusted placement */
    left: 25px;
    /* transform: rotate(180deg); Removed, standard opening quote */
  }
  .quote-container::after {
    content: '”'; /* Closing quote */
    bottom: 5px;  /* Adjusted placement */
    right: 25px;
  }
  .quote-text {
    font-size: 2rem;
    line-height: 1.6;
    font-style: italic;
    margin-bottom: 30px;
    color: #3e2c41; /* Ensuring text color from body is inherited or set */
  }
  .quote-ref {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.2rem;
    color: #885ead;
  }
   @media (max-width: 768px) {
    .quote-container { padding: 35px 45px; }
    .quote-text { font-size: 1.7rem; }
    .quote-ref { font-size: 1.1rem; }
    .quote-container::before, .quote-container::after { font-size: 5rem; }
  }
   @media (max-width: 480px) {
    .quote-container { padding: 25px 30px; }
    .quote-text { font-size: 1.5rem; }
    .quote-ref { font-size: 1rem; }
     .quote-container::before, .quote-container::after { font-size: 4rem; }
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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Cita Inspiradora</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Lato:wght@400;700&display=swap');
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #780206, #061161); /* Deep red to dark blue */
    font-family: 'Lato', sans-serif;
    color: #FDEBD0; /* Creamy white text */
    padding: 1rem;
    box-sizing: border-box;
  }
  .quote-card {
    background: rgba(0, 0, 0, 0.55); /* Dark translucent background */
    border-radius: 20px;
    padding: 3rem 3.5rem;
    max-width: 700px;
    width: 100%;
    box-shadow: 0 15px 35px rgba(0,0,0,0.5);
    text-align: center;
    border-left: 5px solid #FFC300; /* Gold accent */
    position: relative;
  }
  .quote-text-content {
    font-family: 'Merriweather', serif;
    font-size: 2.6rem;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 2rem;
    position: relative;
  }
  .quote-text-content::before { /* Decorative quote mark */
    content: '“';
    font-size: 4rem;
    font-family: 'Merriweather', serif; /* Ensure font consistency */
    color: #FFC300;
    position: absolute;
    left: -1rem; /* Adjust position */
    top: -1.5rem;
    opacity: 0.7;
    user-select: none;
  }
  .quote-reference {
    font-size: 1.2rem;
    font-style: italic;
    color: #FFD700; /* Brighter gold for reference */
    font-weight: 400; /* Lato regular for ref */
  }
  @media (max-width: 600px) {
    .quote-card { padding: 2rem 2.5rem; border-left-width: 4px; }
    .quote-text-content { font-size: 2rem; }
    .quote-text-content::before { font-size: 3rem; left: -0.5rem; top: -1rem; }
    .quote-reference { font-size: 1.1rem; }
  }
   @media (max-width: 400px) {
    .quote-text-content { font-size: 1.7rem; }
    .quote-reference { font-size: 1rem; }
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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Cita Inspiradora</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&family=Raleway:wght@300;500&display=swap');
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to bottom right, #0F2027, #203A43, #2C5364); /* Dark blue/grey gradient */
    font-family: 'Open Sans', sans-serif;
    color: #EAEAEA;
    padding: 1rem;
    box-sizing: border-box;
  }
  .quote-wrapper {
    background: rgba(44, 82, 100, 0.4); /* Slightly lighter translucent dark blue, adjusted alpha */
    border-radius: 15px;
    padding: 2.5rem 3rem;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    text-align: left;
    border-top: 3px solid #92a1ac; /* Softer Silver accent */
  }
  .quote-main-text {
    font-family: 'Raleway', sans-serif;
    font-size: 2.2rem;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    color: #FFFFFF;
  }
  .quote-source {
    font-size: 1.1rem;
    font-weight: 300; /* Raleway light */
    color: #BDC3C7; /* Silver */
    text-align: right;
  }
  .quote-source::before {
    content: "— ";
  }
   @media (max-width: 600px) {
    .quote-wrapper { padding: 2rem; }
    .quote-main-text { font-size: 1.8rem; }
    .quote-source { font-size: 1rem; }
  }
  @media (max-width: 400px) {
    .quote-main-text { font-size: 1.6rem; }
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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Cita Inspiradora</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Crimson+Text:wght@400;700&display=swap');
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #F1E9D2; 
    background-image:
      radial-gradient(rgba(180, 160, 130, 0.15) 1px, transparent 1.2px),
      radial-gradient(rgba(180, 160, 130, 0.15) 1px, transparent 1.2px);
    background-size: 15px 15px; /* Subtle texture */
    background-position: 0 0, 7.5px 7.5px; /* Offset for dot pattern */
    font-family: 'Crimson Text', serif;
    color: #4A3B31; /* Dark Brown */
    padding: 1rem;
    box-sizing: border-box;
  }
  .scroll-container {
    background: #FAF0E6; 
    border: 1px solid #D2B48C; 
    border-radius: 5px;
    padding: 3rem 3.5rem;
    max-width: 650px;
    width: 100%;
    box-shadow: 3px 3px 10px rgba(74, 59, 49, 0.25),
                inset 0 0 15px rgba(222, 184, 135, 0.3); /* Softer shadow, inner glow */
    text-align: center;
    position: relative;
  }
  .scroll-container::before, .scroll-container::after {
    content: '';
    position: absolute;
    height: 1px; /* Thinner lines */
    background-color: #A0522D; /* Sienna, a bit softer */
    opacity: 0.5;
  }
  .scroll-container::before {
    top: 1.5rem; left: 2rem; right: 2rem;
  }
  .scroll-container::after {
    bottom: 1.5rem; left: 2rem; right: 2rem;
  }
  .quote-script {
    font-family: 'EB Garamond', serif;
    font-size: 2.3rem; 
    font-weight: 400; /* Regular Garamond */
    line-height: 1.6;
    margin: 1rem 0 2rem 0; /* Added top margin */
    color: #5D4037; 
  }
  .quote-attribution {
    font-family: 'EB Garamond', serif; /* Consistent font */
    font-size: 1.15rem; /* Slightly smaller */
    font-style: italic;
    color: #795548; /* Slightly lighter brown */
  }
   @media (max-width: 600px) {
    .scroll-container { padding: 2rem 2.5rem; }
    .quote-script { font-size: 1.9rem; }
    .scroll-container::before, .scroll-container::after { left: 1rem; right: 1rem;}
    .quote-attribution { font-size: 1.05rem; }
  }
  @media (max-width: 400px) {
    .quote-script { font-size: 1.6rem; }
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
    id: 9,
    name: "Frescura Acuarela",
    description:
      "Un toque artístico con fondos tipo acuarela y tipografía ligera y amigable.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Cita Inspiradora</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&family=Dancing+Script:wght@700&display=swap');
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(130deg, #e0c3fc 0%, #8ec5fc 100%); /* Lavender to light blue */
    font-family: 'Quicksand', sans-serif;
    color: #333;
    padding: 1rem;
    box-sizing: border-box;
  }
  .watercolor-card {
    background: rgba(255, 255, 255, 0.9); 
    border-radius: 18px; 
    padding: 2.5rem 3rem;
    max-width: 580px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(100,100,150,0.2);
    text-align: center;
    position: relative;
  }
  .watercolor-card::before, .watercolor-card::after {
    font-family: 'Dancing Script', cursive; /* More decorative font */
    font-size: 5rem;
    color: #a990dd; /* A color from the gradient spectrum */
    opacity: 0.6;
    position: absolute;
    user-select: none;
    line-height: 0.5; /* Adjust line height for better positioning */
  }
  .watercolor-card::before {
    content: '“';
    top: 1.2rem;
    left: 0.8rem;
  }
  .watercolor-card::after {
    content: '”';
    bottom: 2.8rem; /* Positioned to be above the reference if ref is short */
    right: 0.8rem;
  }
  .quote-text-art {
    font-size: 1.8rem; /* Quicksand regular */
    font-weight: 600; /* Quicksand semibold */
    line-height: 1.6;
    margin: 1rem 0 1.5rem 0;
    padding: 0 1.5rem; /* Padding so text doesn't overlap quotes */
    color: #4A4A4A;
    position: relative;
    z-index: 1;
  }
  .quote-ref-art {
    font-size: 1.05rem;
    font-weight: 400;
    color: #6a6a6a;
    margin-top: 1rem; /* Ensure space from quote text / closing quote mark */
  }
  @media (max-width: 600px) {
    .watercolor-card { padding: 2rem 2.5rem; }
    .watercolor-card::before, .watercolor-card::after { font-size: 4rem; }
    .watercolor-card::before { top: 1rem; left: 0.5rem; }
    .watercolor-card::after { bottom: 2.5rem; right: 0.5rem; }
    .quote-text-art { font-size: 1.5rem; padding: 0 1rem; }
    .quote-ref-art { font-size: 0.95rem; }
  }
   @media (max-width: 400px) {
    .quote-text-art { font-size: 1.3rem;}
  }
</style>
</head>
<body>
  <div class="watercolor-card">
    <p class="quote-text-art">{{text}}</p>
    <p class="quote-ref-art">{{ref}}</p>
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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Cita Inspiradora</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Oswald:wght@400;600&display=swap');
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f2f5; /* Very light neutral grey */
    font-family: 'Montserrat', sans-serif;
    color: #333;
    padding: 1rem;
    box-sizing: border-box;
  }
  .geo-quote-box {
    background: #FFFFFF;
    border-radius: 8px; /* Sharper radius */
    padding: 2.5rem 3rem; /* Adjusted padding */
    max-width: 620px;
    width: 100%;
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    text-align: left;
    position: relative;
    overflow: hidden; 
  }
  .geo-quote-box::before { /* Main accent bar */
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 12px; 
    height: 100%;
    background-color: #FF5733; /* Vibrant Coral/Orange */
  }
  .geo-quote-box::after { /* Subtle corner accent */
    content: '';
    position: absolute;
    bottom: 0px;
    right: 0px;
    width: 100px;
    height: 100px;
    background-color: #3498db; /* Modern Blue */
    opacity: 0.1;
    clip-path: polygon(100% 0, 0 100%, 100% 100%); /* Bottom-right triangle */
    z-index: 0;
  }
  .quote-content-main {
    font-family: 'Oswald', sans-serif;
    font-size: 2.5rem; /* Slightly reduced for balance */
    font-weight: 600;
    line-height: 1.35;
    margin-bottom: 1.8rem;
    color: #2c3e50; 
    position: relative;
    z-index: 1;
    padding-left: 1.8rem; /* Space from the left bar + a bit more */
  }
  .quote-ref-source {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.05rem;
    font-weight: 700; /* Bold Montserrat for ref */
    color: #FF5733; 
    text-align: right;
    font-style: normal; /* No italics for a cleaner look */
    position: relative;
    z-index: 1;
    padding-right: 1rem;
  }
   @media (max-width: 600px) {
    .geo-quote-box { padding: 2rem 2.5rem; }
    .geo-quote-box::before { width: 10px; }
    .geo-quote-box::after { width: 80px; height: 80px; }
    .quote-content-main { font-size: 2rem; padding-left: 1.5rem; }
    .quote-ref-source { font-size: 0.95rem; }
  }
  @media (max-width: 400px) {
    .quote-content-main { font-size: 1.7rem; }
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
    id: 11,
    name: "Aurora Mística",
    description:
      "Un fondo mágico con auroras y tipografía luminosa para una cita resplandeciente.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=0.7" />
  <title>Aurora Mística</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Open+Sans:wght@400;600&display=swap');
    body {
      margin: 0;
      height: 100vh;
      background: linear-gradient(120deg, #2b5876, #4e4376);
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-family: 'Open Sans', sans-serif;
    }
    .box {
      background: rgba(0,0,0,0.5);
      padding: 3rem 4rem;
      border-radius: 20px;
      text-align: center;
      max-width: 650px;
    }
    .box p {
      font-family: 'Great Vibes', cursive;
      font-size: 2.8rem;
      margin-bottom: 1rem;
    }
    .ref {
      font-size: 1.2rem;
      opacity: 0.8;
    }
  </style>
  </head>
  <body>
    <div class="box">
      <p>"{{text}}"</p>
      <div class="ref">{{ref}}</div>
    </div>
  </body>
  </html>`,
  },
  {
    id: 12,
    name: "Minimalismo Negro",
    description:
      "Estilo elegante minimalista en tonos oscuros y tipografía clara.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Minimalismo Negro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;700&display=swap');
    body {
      margin: 0;
      background: #0d0d0d;
      color: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: 'Raleway', sans-serif;
    }
    .quote {
      text-align: center;
      max-width: 700px;
      padding: 3rem;
      border: 1px solid #333;
    }
    .quote-text {
      font-size: 2rem;
      font-weight: 300;
      margin-bottom: 1rem;
    }
    .quote-ref {
      font-weight: 700;
      color: #999;
    }
  </style>
  </head>
  <body>
    <div class="quote">
      <div class="quote-text">"{{text}}"</div>
      <div class="quote-ref">{{ref}}</div>
    </div>
  </body>
  </html>`,
  },
  {
    id: 13,
    name: "Naturaleza Floral",
    description:
      "Un diseño floral con colores suaves para transmitir dulzura y armonía.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=0.7">
  <title>Floral</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');
    body {
      margin: 0;
      background: #ffeef2;
      font-family: 'Quicksand', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      background: white;
      border: 5px dashed #f9a1bc;
      padding: 2rem;
      border-radius: 15px;
      text-align: center;
      max-width: 600px;
    }
    .text {
      font-size: 1.8rem;
      color: #a04961;
      margin-bottom: 1rem;
    }
    .ref {
      font-size: 1.1rem;
      color: #7b3c51;
    }
  </style>
  </head>
  <body>
    <div class="container">
      <div class="text">"{{text}}"</div>
      <div class="ref">{{ref}}</div>
    </div>
  </body>
  </html>`,
  },
  {
    id: 14,
    name: "Cielo Amanecer",
    description:
      "Colores cálidos como un amanecer para un mensaje esperanzador.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=0.7">
  <title>Amanecer</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Kalam&display=swap');
    body {
      margin: 0;
      background: linear-gradient(to top right, #ffecd2 0%, #fcb69f 100%);
      font-family: 'Kalam', cursive;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .card {
      text-align: center;
      background: #fff7f0;
      padding: 3rem;
      border-radius: 25px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      max-width: 650px;
    }
    .text {
      font-size: 2.2rem;
      margin-bottom: 1rem;
      color: #844c3d;
    }
    .ref {
      font-size: 1.2rem;
      color: #d66a53;
    }
  </style>
  </head>
  <body>
    <div class="card">
      <div class="text">"{{text}}"</div>
      <div class="ref">{{ref}}</div>
    </div>
  </body>
  </html>`,
  },
  {
    id: 15,
    name: "Luz Dorada",
    description:
      "Fondo cálido con toques dorados que transmite esperanza y luz.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=0.7">
  <title>Luz Dorada</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
    body {
      margin: 0;
      height: 100vh;
      background: linear-gradient(135deg, #fff4e6, #fbc490);
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'DM Serif Display', serif;
      color: #5e3719;
    }
    .container {
      background: rgba(255, 255, 255, 0.9);
      padding: 3rem 4rem;
      border-radius: 20px;
      text-align: center;
      max-width: 600px;
      box-shadow: 0 20px 30px rgba(255, 200, 100, 0.4);
    }
    .text {
      font-size: 2.5rem;
      margin-bottom: 1.2rem;
    }
    .ref {
      font-size: 1.1rem;
      font-style: italic;
    }
  </style>
  </head>
  <body>
    <div class="container">
      <div class="text">"{{text}}"</div>
      <div class="ref">{{ref}}</div>
    </div>
  </body>
  </html>`,
  },
  {
    id: 16,
    name: "Elegancia Dorada",
    description:
      "Diseño lujoso con acentos dorados y tipografía elegante que transmite prestigio y sabiduría.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=0.7" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=Montserrat:wght@300;600&display=swap');
  
  body {
    margin: 0;
    height: 100vh;
    background: linear-gradient(135deg, #2c1810, #8b4513, #daa520);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Montserrat', sans-serif;
    margin: 0 1rem;
  }
  
  .quote-container {
    background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
    border: 2px solid #daa520;
    border-radius: 25px;
    box-shadow: 0 25px 60px rgba(218, 165, 32, 0.3);
    max-width: 700px;
    padding: 4rem 3.5rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  
  .quote-container::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(218,165,32,0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }
  
  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .quote-content {
    position: relative;
    z-index: 1;
  }
  
  .decorative-quotes::before,
  .decorative-quotes::after {
    font-family: 'Cormorant Garamond', serif;
    font-size: 8rem;
    color: #daa520;
    position: absolute;
    opacity: 0.3;
    user-select: none;
  }
  
  .decorative-quotes::before {
    content: '"';
    top: -20px;
    left: 20px;
  }
  
  .decorative-quotes::after {
    content: '"';
    bottom: -30px;
    right: 20px;
  }
  
  .quote-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.6rem;
    font-weight: 700;
    color: #f5f5f5;
    line-height: 1.4;
    margin-bottom: 2rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  .quote-ref {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.2rem;
    font-weight: 300;
    color: #daa520;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
</style>
</head>
<body>
  <div class="quote-container decorative-quotes">
    <div class="quote-content">
      <p class="quote-text">"{{text}}"</p>
      <p class="quote-ref">{{ref}}</p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 17,
    name: "Minimalismo Nórdico",
    description:
      "Diseño minimalista inspirado en el estilo nórdico con tipografía limpia y espacios amplios.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=0.7" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Crimson+Text:ital,wght@0,400;1,400&display=swap');
  
  body {
    margin: 0;
    height: 100vh;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Inter', sans-serif;
    margin: 0 1rem;
  }
  
  .quote-container {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    max-width: 650px;
    padding: 4rem 3rem;
    text-align: left;
    position: relative;
    border-left: 4px solid #6c757d;
  }
  
  .quote-mark {
    font-family: 'Crimson Text', serif;
    font-size: 6rem;
    color: #6c757d;
    position: absolute;
    top: 1rem;
    left: 2rem;
    opacity: 0.3;
    line-height: 1;
  }
  
  .quote-text {
    font-family: 'Crimson Text', serif;
    font-size: 2.2rem;
    font-style: italic;
    color: #212529;
    line-height: 1.5;
    margin: 2rem 0 2rem 0;
    padding-left: 3rem;
  }
  
  .quote-ref {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-left: 3rem;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
  }
</style>
</head>
<body>
  <div class="quote-container">
    <div class="quote-mark">"</div>
    <p class="quote-text">{{text}}</p>
    <p class="quote-ref">{{ref}}</p>
  </div>
</body>
</html>`,
  },
  {
    id: 18,
    name: "Atardecer Cálido",
    description:
      "Colores cálidos de atardecer que evocan tranquilidad y reflexión profunda.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=0.7" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Open+Sans:wght@400;600&display=swap');
  
  body {
    margin: 0;
    height: 100vh;
    background: linear-gradient(135deg, #ff7f50, #ff6347, #ffa07a, #ffd700);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Open Sans', sans-serif;
    margin: 0 1rem;
  }
  
  .quote-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    box-shadow: 0 20px 50px rgba(255, 99, 71, 0.4);
    max-width: 680px;
    padding: 3.5rem;
    text-align: center;
    position: relative;
    backdrop-filter: blur(10px);
  }
  
  .sun-decoration {
    position: absolute;
    top: -30px;
    right: -30px;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, #ffd700, #ff6347);
    border-radius: 50%;
    opacity: 0.7;
    animation: glow 3s ease-in-out infinite alternate;
  }
  
  @keyframes glow {
    from { box-shadow: 0 0 20px #ffd700; }
    to { box-shadow: 0 0 40px #ff6347; }
  }
  
  .quote-text {
    font-family: 'Merriweather', serif;
    font-size: 2.4rem;
    font-weight: 700;
    color: #8b4513;
    line-height: 1.4;
    margin-bottom: 2rem;
    position: relative;
  }
  
  .quote-text::before,
  .quote-text::after {
    content: '"';
    font-size: 3rem;
    color: #ff6347;
    font-weight: bold;
  }
  
  .quote-ref {
    font-family: 'Open Sans', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: #cd853f;
    font-style: italic;
  }
</style>
</head>
<body>
  <div class="quote-container">
    <div class="sun-decoration"></div>
    <p class="quote-text">{{text}}</p>
    <p class="quote-ref">{{ref}}</p>
  </div>
</body>
</html>`,
  },

  {
    id: 19,
    name: "Elegancia Monocromática Texturizada",
    description:
      "Un diseño sofisticado en escala de grises con textura sutil y acentos metálicos para un impacto moderno.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&family=Playfair+Display:wght@700&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #222; /* Dark background */
      /* Subtle texture */
      background-image: linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
                        linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
                        linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
      font-family: 'Roboto Condensed', sans-serif;
      color: #e0e0e0;
      padding: 1rem;
      box-sizing: border-box;
    }
    .quote-container-mono {
      background: rgba(50, 50, 50, 0.9); /* Slightly lighter, translucent box */
      border-radius: 10px;
      padding: 2.5rem 3rem;
      max-width: 650px;
      width: 100%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border-left: 6px solid #c0c0c0; /* Silver accent */
      text-align: left;
    }
    .quote-text-main {
      font-family: 'Playfair Display', serif;
      font-size: 2.4rem;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 1.5rem;
      color: #f5f5f5;
    }
    .quote-text-main::before {
      content: "“";
      color: #b0b0b0; /* Lighter silver for quote mark */
      font-size: 3rem;
      margin-right: 0.5rem;
      vertical-align: sub; /* Aligns quote mark nicely */
    }
    .quote-ref-sub {
      font-size: 1.1rem;
      font-weight: 300; /* Lighter weight */
      color: #a0a0a0;
      text-align: right;
      font-style: italic;
    }
    @media (max-width: 600px) {
      .quote-container-mono { padding: 2rem; border-left-width: 5px;}
      .quote-text-main { font-size: 2rem; }
      .quote-text-main::before { font-size: 2.5rem; }
      .quote-ref-sub { font-size: 1rem; }
    }
  </style>
  </head>
  <body>
    <div class="quote-container-mono">
      <p class="quote-text-main">{{text}}”</p> <!-- Closing quote mark inside text for better flow -->
      <p class="quote-ref-sub">— {{ref}}</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 20,
    name: "Explosión de Color Neón",
    description:
      "Fondo oscuro con vibrantes acentos de neón y tipografía moderna para una cita que resalta.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@500;700&display=swap');
    :root {
      --neon-pink: #ff00ff;
      --neon-cyan: #00ffff;
      --neon-green: #39ff14;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #121212; /* Very dark background */
      font-family: 'Rajdhani', sans-serif;
      color: #f0f0f0;
      padding: 1rem;
      box-sizing: border-box;
    }
    .neon-quote-wrapper {
      background: rgba(20, 20, 20, 0.7);
      border-radius: 15px;
      padding: 3rem;
      max-width: 700px;
      width: 100%;
      box-shadow: 0 0 15px var(--neon-cyan), 0 0 30px var(--neon-pink), inset 0 0 10px var(--neon-green);
      border: 2px solid var(--neon-cyan);
      text-align: center;
      position: relative;
    }
    .neon-quote-wrapper::before, .neon-quote-wrapper::after { /* Corner accents */
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
    }
    .neon-quote-wrapper::before {
      top: -10px; left: -10px;
      border-top: 3px solid var(--neon-pink);
      border-left: 3px solid var(--neon-pink);
    }
    .neon-quote-wrapper::after {
      bottom: -10px; right: -10px;
      border-bottom: 3px solid var(--neon-green);
      border-right: 3px solid var(--neon-green);
    }
    .quote-text-neon {
      font-family: 'Orbitron', sans-serif;
      font-size: 2.6rem;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 2rem;
      color: #fff;
      text-shadow: 0 0 5px #fff, 0 0 10px var(--neon-pink), 0 0 15px var(--neon-pink);
    }
    .quote-ref-neon {
      font-size: 1.3rem;
      font-weight: 500;
      color: var(--neon-cyan);
      text-transform: uppercase;
      letter-spacing: 1px;
      text-shadow: 0 0 5px var(--neon-cyan);
    }
    @media (max-width: 600px) {
      .neon-quote-wrapper { padding: 2rem; }
      .quote-text-neon { font-size: 2rem; }
      .quote-ref-neon { font-size: 1.1rem; }
    }
  </style>
  </head>
  <body>
    <div class="neon-quote-wrapper">
      <p class="quote-text-neon">"{{text}}"</p>
      <p class="quote-ref-neon">{{ref}}</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 21,
    name: "Naturaleza Serena Acuática",
    description:
      "Tonos azules y verdes con elementos fluidos para una sensación de calma y reflexión.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Poppins:wght@300;500&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%); /* Light blue gradient */
      font-family: 'Poppins', sans-serif;
      color: #1f3a5f; /* Darker blue for text */
      padding: 1rem;
      box-sizing: border-box;
    }
    .aquatic-quote-card {
      background: rgba(255, 255, 255, 0.85);
      border-radius: 50px 15px 50px 15px; /* Wavy border */
      padding: 3rem 3.5rem;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 12px 28px rgba(70, 130, 180, 0.3); /* Steel blue shadow */
      text-align: center;
      position: relative;
    }
    .aquatic-quote-card::before { /* Water drop / ripple */
      content: '';
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 30px;
      background: #a7d7f9;
      border-radius: 50% 50% 50% 0; /* Teardrop shape */
      transform: rotate(45deg) translateX(-50%);
      opacity: 0.7;
    }
    .quote-text-flow {
      font-family: 'Caveat', cursive;
      font-size: 3rem;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 1.5rem;
      color: #005073; /* Deep teal */
    }
    .quote-ref-stream {
      font-size: 1.1rem;
      font-weight: 300;
      color: #4682b4; /* Steel Blue */
      font-style: italic;
    }
    @media (max-width: 600px) {
      .aquatic-quote-card { padding: 2.5rem 2rem; border-radius: 40px 10px 40px 10px; }
      .quote-text-flow { font-size: 2.4rem; }
      .quote-ref-stream { font-size: 1rem; }
      .aquatic-quote-card::before { width: 25px; height: 25px; top: -12px;}
    }
  </style>
  </head>
  <body>
    <div class="aquatic-quote-card">
      <p class="quote-text-flow">"{{text}}"</p>
      <p class="quote-ref-stream">{{ref}}</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 22,
    name: "Vintage Industrial Grunge",
    description:
      "Texturas desgastadas, colores industriales y tipografía robusta para un look retro-urbano.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #4a4a4a; /* Dark grey */
      background-image: url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23303030' fill-opacity='0.4'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); /* Subtle grunge pattern */
      font-family: 'Special Elite', cursive; /* Typewriter font */
      color: #dcdcdc; /* Light grey text */
      padding: 1rem;
      box-sizing: border-box;
    }
    .industrial-plate {
      background: #708090cc; /* Slate gray, semi-transparent */
      border: 2px solid #333;
      border-radius: 4px;
      padding: 2rem 2.5rem;
      max-width: 600px;
      width: 100%;
      box-shadow: 5px 5px 0px #222; /* Hard shadow */
      text-align: left;
    }
    .stamp-text { /* Simulating a stamped look */
      font-family: 'Bebas Neue', cursive; /* Bold, tall font */
      font-size: 3rem;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      color: #212121; /* Very dark grey, almost black */
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 3px dotted #c0392b; /* Rusty red dotted line */
      padding-bottom: 1rem;
    }
    .ref-tag {
      font-size: 1.2rem;
      color: #b2bec3; /* Lighter grey for reference */
      text-align: right;
      display: block; /* To allow text-align right */
    }
    @media (max-width: 600px) {
      .industrial-plate { padding: 1.5rem 2rem; }
      .stamp-text { font-size: 2.2rem; }
      .ref-tag { font-size: 1rem; }
    }
  </style>
  </head>
  <body>
    <div class="industrial-plate">
      <p class="stamp-text">"{{text}}"</p>
      <p class="ref-tag">- {{ref}} -</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 23,
    name: "Papiro Histórico Realzado",
    description:
      "Aspecto de papiro antiguo con tipografía clásica y detalles ornamentales sutiles para solemnidad.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Old+Standard+TT:ital,wght@0,400;1,400&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e4d8b4; /* Papyrus color */
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAAFVJRREFUeNrcwQAQAAACCENDreqdrjDawQYAAAAAAMCSZA4/Q7AKGAAAAAElFTkSuQmCC"); /* Subtle texture */
      font-family: 'Old Standard TT', serif;
      color: #5a3e2b; /* Dark brown */
      padding: 1rem;
      box-sizing: border-box;
    }
    .papyrus-scroll {
      background: #fdf5e6; /* Lighter parchment */
      border-radius: 2px;
      padding: 3rem 4rem;
      max-width: 700px;
      width: 100%;
      box-shadow: 0 0 0 10px #fdf5e6, 0 0 0 12px #c8bca4, 0 5px 15px 12px rgba(0,0,0,0.2); /* Layered border for scroll effect */
      text-align: center;
      position: relative;
    }
    .ornament { /* Simple top/bottom ornament */
      font-family: 'Cinzel', serif;
      font-size: 1.8rem;
      color: #8b4513; /* Saddle Brown */
      margin-bottom: 1rem;
      display: block;
    }
    .ornament.top { margin-bottom: 1.5rem; }
    .ornament.bottom { margin-top: 1.5rem; }
    .quote-text-ancient {
      font-family: 'Cinzel', serif;
      font-size: 2.5rem;
      font-weight: 700; /* Cinzel Bold for impact */
      line-height: 1.5;
      margin: 0.5rem 0;
      color: #4a2c2a; /* Darker, reddish brown */
    }
    .quote-ref-script {
      font-size: 1.2rem;
      font-style: italic;
      color: #704214; /* Medium brown */
      margin-top: 1rem;
    }
    @media (max-width: 600px) {
      .papyrus-scroll { padding: 2rem 2.5rem; box-shadow: 0 0 0 6px #fdf5e6, 0 0 0 8px #c8bca4, 0 3px 10px 8px rgba(0,0,0,0.2);}
      .quote-text-ancient { font-size: 2rem; }
      .ornament { font-size: 1.5rem; }
      .quote-ref-script { font-size: 1rem; }
    }
  </style>
  </head>
  <body>
    <div class="papyrus-scroll">
      <span class="ornament top">⚜</span>
      <p class="quote-text-ancient">"{{text}}"</p>
      <p class="quote-ref-script">{{ref}}</p>
      <span class="ornament bottom">⚜</span>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #eef1f5; /* Light neutral background */
      font-family: 'Inter', sans-serif;
      padding: 1rem;
      box-sizing: border-box;
    }
    .abstract-art-quote {
      background: #ffffff;
      border-radius: 12px;
      padding: 3rem;
      max-width: 650px;
      width: 100%;
      box-shadow: 0 15px 30px rgba(0,0,0,0.1);
      text-align: left;
      position: relative;
      overflow: hidden; /* To contain pseudo-elements */
    }
    .abstract-art-quote::before { /* Abstract shape 1 */
      content: '';
      position: absolute;
      top: -50px;
      left: -50px;
      width: 150px;
      height: 150px;
      background: #ff6b6b; /* Coral red */
      border-radius: 50%;
      opacity: 0.8;
      z-index: 0;
    }
    .abstract-art-quote::after { /* Abstract shape 2 */
      content: '';
      position: absolute;
      bottom: -60px;
      right: -40px;
      width: 200px;
      height: 120px;
      background: #4ecdc4; /* Teal */
      transform: rotate(30deg);
      border-radius: 10px;
      opacity: 0.7;
      z-index: 0;
    }
    .quote-content {
      position: relative; /* To be above pseudo-elements */
      z-index: 1;
    }
    .quote-text-bold {
      font-family: 'Archivo Black', sans-serif;
      font-size: 2.8rem;
      line-height: 1.25;
      margin-bottom: 1.8rem;
      color: #2c3e50; /* Dark blue-grey */
    }
    .quote-ref-clean {
      font-size: 1.1rem;
      font-weight: 600;
      color: #555;
      text-align: right;
    }
    .quote-ref-clean::before {
      content: "— ";
    }
    @media (max-width: 600px) {
      .abstract-art-quote { padding: 2.5rem; }
      .quote-text-bold { font-size: 2.2rem; }
      .quote-ref-clean { font-size: 1rem; }
      .abstract-art-quote::before { width: 120px; height: 120px; top: -40px; left: -40px;}
      .abstract-art-quote::after { width: 160px; height: 100px; bottom: -50px; right: -30px;}
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
    id: 25,
    name: "Aurora Boreal Mística",
    description:
      "Tonos profundos y degradados suaves que evocan la aurora boreal, con tipografía etérea.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,700&family=Satisfy&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(45deg, #0f0c29, #302b63, #24243e); /* Deep blues and purples */
      animation: aurora-bg 15s ease infinite alternate;
      background-size: 400% 400%;
      font-family: 'Philosopher', sans-serif;
      color: #e0e6f8;
      padding: 1rem;
      box-sizing: border-box;
    }
    @keyframes aurora-bg {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .aurora-quote-box {
      background: rgba(30, 30, 50, 0.75); /* Translucent dark purple */
      border-radius: 20px;
      padding: 3rem;
      max-width: 680px;
      width: 100%;
      box-shadow: 0 0 25px rgba(128, 128, 255, 0.3), 0 0 40px rgba(50, 205, 50, 0.2); /* Blue and green glow */
      text-align: center;
      position: relative;
      border: 1px solid rgba(173, 216, 230, 0.3); /* Light blue, subtle border */
    }
    .quote-text-ethereal {
      font-family: 'Satisfy', cursive; /* Flowing script font */
      font-size: 3.2rem;
      font-weight: 400; /* Satisfy is typically one weight */
      line-height: 1.5;
      margin-bottom: 2rem;
      color: #fafaff;
      text-shadow: 0 0 8px rgba(200, 200, 255, 0.6); /* Soft white glow */
    }
    .quote-ref-mystic {
      font-size: 1.3rem;
      font-weight: 700; /* Philosopher bold */
      font-style: italic;
      color: #b0c4de; /* Light steel blue */
      opacity: 0.85;
    }
    @media (max-width: 600px) {
      .aurora-quote-box { padding: 2.5rem; }
      .quote-text-ethereal { font-size: 2.5rem; }
      .quote-ref-mystic { font-size: 1.1rem; }
    }
  </style>
  </head>
  <body>
    <div class="aurora-quote-box">
      <p class="quote-text-ethereal">"{{text}}"</p>
      <p class="quote-ref-mystic">{{ref}}</p>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;500&family=Shippori+Mincho:wght@500&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f4f1ea; /* Off-white, slightly warm */
      font-family: 'Noto Sans JP', sans-serif;
      color: #3c3c3c; /* Dark grey */
      padding: 1rem;
      box-sizing: border-box;
    }
    .zen-quote-panel {
      background: #ffffff;
      border-radius: 8px;
      padding: 3rem 3.5rem;
      max-width: 550px;
      width: 100%;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
      text-align: left;
      position: relative;
      border-top: 4px solid #8c7b70; /* Muted brown-grey, like aged wood */
    }
    .zen-quote-panel::after { /* Subtle bamboo-like divider */
      content: '';
      position: absolute;
      bottom: 2rem;
      left: 3.5rem;
      right: 3.5rem;
      height: 1px;
      background-color: #d3c7b7; /* Light tan */
    }
    .quote-text-haiku {
      font-family: 'Shippori Mincho', serif; /* Japanese serif */
      font-size: 1.9rem;
      font-weight: 500;
      line-height: 1.8; /* More spacing */
      margin-bottom: 2.5rem; /* Space above divider */
      color: #4a4a4a;
    }
    .quote-ref-shodo {
      font-size: 1rem;
      font-weight: 300; /* Noto Sans Light */
      color: #707070;
      text-align: right;
      padding-top: 1rem; /* Space from divider */
    }
    @media (max-width: 600px) {
      .zen-quote-panel { padding: 2.5rem 2rem; }
      .zen-quote-panel::after { left: 2rem; right: 2rem; bottom: 1.5rem;}
      .quote-text-haiku { font-size: 1.6rem; margin-bottom: 2rem;}
      .quote-ref-shodo { font-size: 0.9rem; }
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
    id: 27,
    name: "Futurista Holo-Tech",
    description:
      "Efectos de brillo holográfico simulados sobre un fondo oscuro, con tipografía tecnológica.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Share+Tech+Mono&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #0a0f1f; /* Very dark blue */
      font-family: 'Share Tech Mono', monospace;
      color: #a0d8ef; /* Light cyan */
      padding: 1rem;
      box-sizing: border-box;
      overflow: hidden; /* Hide pseudo-element overflow */
    }
    .holo-display-quote {
      background: rgba(10, 20, 40, 0.6); /* Dark translucent blue */
      border: 1px solid rgba(0, 255, 255, 0.3); /* Cyan border */
      border-radius: 10px;
      padding: 2.5rem;
      max-width: 680px;
      width: 100%;
      box-shadow: 0 0 15px rgba(0, 200, 255, 0.4), 0 0 30px rgba(150, 50, 255, 0.3); /* Cyan and purple glow */
      text-align: left;
      position: relative;
    }
    /* Animated glitchy line effect */
    .holo-display-quote::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -10%;
      width: 120%;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(0,255,255,0.5), transparent);
      opacity: 0.7;
      animation: scanline 4s linear infinite;
    }
    @keyframes scanline {
      0% { transform: translateY(-20px) scaleY(1); opacity: 0.7; }
      50% { transform: translateY(0px) scaleY(0.6); opacity: 0.3; }
      100% { transform: translateY(20px) scaleY(1); opacity: 0.7; }
    }
    .quote-text-data {
      font-family: 'Exo 2', sans-serif;
      font-size: 2.3rem;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 1.5rem;
      color: #f0f8ff; /* Alice blue (very light) */
      text-shadow: 0 0 3px #61dafb, 0 0 5px #61dafb;
    }
    .quote-ref-sourcecode {
      font-size: 1rem;
      color: #88ddff; /* Brighter cyan */
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: right;
    }
    .quote-ref-sourcecode::before{ content: "/// REF: "; }
  
    @media (max-width: 600px) {
      .holo-display-quote { padding: 2rem; }
      .quote-text-data { font-size: 1.9rem; }
      .quote-ref-sourcecode { font-size: 0.9rem; }
    }
  </style>
  </head>
  <body>
    <div class="holo-display-quote">
      <p class="quote-text-data">"{{text}}"</p>
      <p class="quote-ref-sourcecode">{{ref}}</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 28,
    name: "Bohemio Terroso Chic",
    description:
      "Tonos tierra cálidos, texturas naturales y elementos de estilo bohemio para una cita acogedora.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amatic+SC:wght@700&family=Assistant:wght@300;600&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f7f0e3; /* Warm cream */
      font-family: 'Assistant', sans-serif;
      color: #5d4037; /* Brown */
      padding: 1rem;
      box-sizing: border-box;
    }
    .boho-quote-frame {
      background: #fffaf0cc; /* Floral white, semi-transparent */
      border-radius: 15px;
      padding: 2.5rem 3rem;
      max-width: 580px;
      width: 100%;
      box-shadow: 0 8px 20px rgba(139, 69, 19, 0.15); /* SaddleBrown shadow */
      text-align: center;
      position: relative;
      border: 2px dashed #cdaa7d; /* Light tan dashed border */
    }
    .boho-quote-frame::before { /* Macrame-like tassel (simple version) */
      content: ' tassels '; /* Placeholder, better with SVG or image */
      font-family: 'Amatic SC', cursive;
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      color: #b08d57;
      font-size: 1.2rem;
      opacity: 0.6;
      padding: 0 10px;
      background: #f7f0e3;
    }
    .quote-text-handmade {
      font-family: 'Amatic SC', cursive; /* Hand-drawn style */
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.3;
      margin: 1rem 0 1.5rem 0;
      color: #8b4513; /* Saddle Brown */
    }
    .quote-ref-earthy {
      font-size: 1.1rem;
      font-weight: 300; /* Assistant Light */
      color: #a0522d; /* Sienna */
      font-style: italic;
    }
    @media (max-width: 600px) {
      .boho-quote-frame { padding: 2rem 2.5rem; }
      .quote-text-handmade { font-size: 2.8rem; }
      .quote-ref-earthy { font-size: 1rem; }
    }
  </style>
  </head>
  <body>
    <div class="boho-quote-frame">
      <p class="quote-text-handmade">"{{text}}"</p>
      <p class="quote-ref-earthy">~ {{ref}} ~</p>
    </div>
  </body>
  </html>
  `,
  },

  {
    id: 29,
    name: "Manuscrito Iluminado Moderno",
    description:
      "Inspiración en manuscritos antiguos con un toque moderno, usando dorados y tipografía elegante sobre fondo oscuro.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=IM+Fell+English+SC&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #1a1a1a; /* Very dark grey/black */
      font-family: 'Cormorant Garamond', serif;
      color: #e0cda8; /* Pale gold/parchment text */
      padding: 1rem;
      box-sizing: border-box;
    }
    .illuminated-quote {
      background: rgba(30, 25, 20, 0.8); /* Dark brown, slightly transparent */
      border-radius: 8px;
      padding: 2.5rem 3rem;
      max-width: 650px;
      width: 100%;
      box-shadow: 0 0 15px rgba(218, 165, 32, 0.3), 0 0 5px rgba(218, 165, 32, 0.5); /* Golden glow */
      border: 1px solid #b8860b; /* DarkGoldenrod */
      text-align: center;
      position: relative;
    }
    .illuminated-quote::before, .illuminated-quote::after { /* Decorative corners */
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border-color: #daa520; /* Goldenrod */
      border-style: solid;
    }
    .illuminated-quote::before {
      top: 10px; left: 10px;
      border-width: 2px 0 0 2px;
    }
    .illuminated-quote::after {
      bottom: 10px; right: 10px;
      border-width: 0 2px 2px 0;
    }
    .quote-text-scriptorium {
      font-family: 'IM Fell English SC', serif; /* Old style English font */
      font-size: 2.8rem;
      line-height: 1.4;
      margin-bottom: 1.8rem;
      color: #f5e6c4; /* Lighter parchment */
    }
    .drop-cap { /* First letter of the quote */
      font-size: 4rem;
      float: left;
      line-height: 0.8;
      margin-right: 0.3em;
      color: #daa520; /* Goldenrod */
      font-weight: 700;
    }
    .quote-ref-scribe {
      font-size: 1.1rem;
      font-weight: 400;
      color: #b08d57; /* Muted gold */
      font-style: italic;
    }
    @media (max-width: 600px) {
      .illuminated-quote { padding: 2rem 2.5rem; }
      .quote-text-scriptorium { font-size: 2.2rem; }
      .drop-cap { font-size: 3rem; }
      .quote-ref-scribe { font-size: 1rem; }
    }
  </style>
  </head>
  <body>
    <div class="illuminated-quote">
      <p class="quote-text-scriptorium"><span class="drop-cap">{{text}}</span></p>
      <p class="quote-ref-scribe">{{ref}}</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 30,
    name: "Estilo Comic Pop Art Vibrante",
    description:
      "Colores brillantes, patrones de puntos y tipografía dinámica para un efecto de cómic audaz.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@700&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #ffd700; /* Bright Yellow */
      font-family: 'Comic Neue', cursive;
      padding: 1rem;
      box-sizing: border-box;
    }
    .comic-bubble {
      background: #fff;
      border: 4px solid #000;
      border-radius: 30px; /* Rounded bubble shape */
      padding: 2rem 2.5rem;
      max-width: 550px;
      width: 100%;
      box-shadow: 8px 8px 0px #ff1493; /* Hot Pink offset shadow */
      text-align: center;
      position: relative;
    }
    .comic-bubble::after { /* Speech bubble tail */
      content: '';
      position: absolute;
      bottom: -20px;
      left: 50px;
      width: 0;
      height: 0;
      border: 20px solid transparent;
      border-top-color: #000;
      border-bottom: 0;
      border-left:0;
      margin-left: -10px;
      margin-bottom: -18px; /* Adjust for border */
    }
    .halftone-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: inherit; /* Match parent's border-radius */
      background-image: radial-gradient(#00aeef 15%, transparent 16%),
                        radial-gradient(#00aeef 15%, transparent 16%); /* Cyan dots */
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
      opacity: 0.2;
      z-index: 0;
      overflow: hidden; /* Ensure dots stay within bubble */
    }
    .quote-text-popart {
      font-family: 'Bangers', cursive;
      font-size: 3rem;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      color: #000;
      position: relative;
      z-index: 1;
      text-shadow: 2px 2px 0 #fff, 4px 4px 0 #00aeef; /* White and Cyan text shadow for depth */
    }
    .quote-ref-onomatopeia {
      font-size: 1.2rem;
      font-weight: 700;
      color: #ff1493; /* Hot Pink */
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }
    @media (max-width: 600px) {
      .comic-bubble { padding: 1.5rem 2rem; }
      .quote-text-popart { font-size: 2.2rem; }
      .quote-ref-onomatopeia { font-size: 1rem; }
    }
  </style>
  </head>
  <body>
    <div class="comic-bubble">
      <div class="halftone-bg"></div>
      <p class="quote-text-popart">"{{text}}"</p>
      <p class="quote-ref-onomatopeia">¡{{ref}}!</p>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Aldrich&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #003366; /* Blueprint Blue */
      background-image:
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      font-family: 'Roboto Mono', monospace;
      color: #ffffff;
      padding: 1rem;
      box-sizing: border-box;
    }
    .blueprint-sheet {
      background: rgba(0, 51, 102, 0.7); /* Slightly darker, translucent */
      border: 1px solid #66aaff; /* Light blue border */
      border-radius: 4px;
      padding: 2.5rem;
      max-width: 700px;
      width: 100%;
      box-shadow: 0 0 10px rgba(102, 170, 255, 0.3);
      text-align: left;
    }
    .title-block {
      border-bottom: 2px solid #99ccff;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title-block-main {
      font-family: 'Aldrich', sans-serif; /* Technical font */
      font-size: 1.5rem;
      color: #e6f2ff;
    }
    .title-block-rev {
      font-size: 0.9rem;
      color: #b3daff;
    }
    .quote-text-specs {
      font-size: 1.8rem; /* Main text */
      line-height: 1.6;
      margin-bottom: 1.5rem;
      color: #f0f8ff; /* Alice Blue */
    }
    .quote-ref-drawingno {
      font-size: 1rem;
      color: #cce6ff;
      text-align: right;
      border-top: 1px dashed #99ccff;
      padding-top: 0.8rem;
    }
    @media (max-width: 600px) {
      .blueprint-sheet { padding: 2rem; }
      .title-block-main { font-size: 1.2rem; }
      .quote-text-specs { font-size: 1.5rem; }
      .quote-ref-drawingno { font-size: 0.9rem; }
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
    id: 32,
    name: "Rústico Chic de Granja Acogedor",
    description:
      "Texturas de madera, elementos naturales y tipografía cálida para un ambiente de granja.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Homemade+Apple&family=Patrick+Hand&family=Source+Serif+Pro:wght@400;600&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #d2b48c; /* Tan / Light wood */
      background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill-rule="evenodd"><g fill="%23a0522d" fill-opacity="0.1"><path opacity=".5" d="M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9z" /><path d="M6 5V0H5v5H0v1h5v94h1V6h94V5H6z" /></g></g></svg>'); /* Subtle wood grain */
      font-family: 'Source Serif Pro', serif;
      color: #5D4037; /* Dark Brown */
      padding: 1rem;
      box-sizing: border-box;
    }
    .farmhouse-sign {
      background: #fff8e1; /* Creamy white */
      border: 8px solid #8B4513; /* SaddleBrown, like a thick wood frame */
      border-radius: 10px;
      padding: 2.5rem;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 10px 20px rgba(70, 50, 20, 0.3);
      text-align: center;
    }
    .quote-text-country {
      font-family: 'Patrick Hand', cursive; /* Friendly handwritten */
      font-size: 2.8rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
      color: #4E342E; /* Darker brown */
    }
    .quote-ref-homespun {
      font-family: 'Homemade Apple', cursive; /* More scripty handwritten */
      font-size: 1.5rem;
      color: #A1887F; /* Brownish grey */
    }
    .farmhouse-sign::before { /* Burlap patch accent */
      content: '';
      position: absolute;
      top: 20px; right: 20px;
      width: 50px; height: 30px;
      background-color: #D2B48C; /* Tan */
      opacity: 0.5;
      clip-path: polygon(0 0, 100% 0, 80% 100%, 20% 100%); /* Trapezoid shape */
    }
    @media (max-width: 600px) {
      .farmhouse-sign { padding: 2rem; border-width: 6px;}
      .quote-text-country { font-size: 2.2rem; }
      .quote-ref-homespun { font-size: 1.2rem; }
    }
  </style>
  </head>
  <body>
    <div class="farmhouse-sign">
      <p class="quote-text-country">"{{text}}"</p>
      <p class="quote-ref-homespun">- {{ref}} -</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 33,
    name: "Galaxia Cósmica Ensoñadora",
    description:
      "Fondo de nebulosa, estrellas brillantes y tipografía elegante para una cita celestial.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Spectral:wght@300;600&family=Great+Vibes&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
      overflow: hidden; /* For starfield */
      font-family: 'Spectral', serif;
      color: #e8e8f8; /* Light lavender white */
      padding: 1rem;
      box-sizing: border-box;
    }
    #starfield {
      position: fixed;
      top:0; left:0; width:100%; height:100%;
      z-index: -1;
    }
    .cosmic-portal {
      background: rgba(20, 20, 50, 0.6); /* Deep space blue, translucent */
      border-radius: 50%; /* Circular portal */
      padding: 4rem;
      max-width: 600px;
      max-height: 600px;
      width: 90vw;
      height: 90vw; /* Maintain aspect ratio */
      box-shadow: 0 0 20px rgba(173, 216, 230, 0.4), 0 0 40px rgba(221, 160, 221, 0.3); /* LightBlue and Plum glow */
      border: 2px solid rgba(100, 149, 237, 0.5); /* CornflowerBlue */
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .quote-text-nebula {
      font-family: 'Great Vibes', cursive; /* Elegant script */
      font-size: 3.5rem;
      line-height: 1.4;
      margin-bottom: 1.5rem;
      color: #fff;
      text-shadow: 0 0 10px #fff, 0 0 15px #add8e6; /* White and light blue glow */
    }
    .quote-ref-stardust {
      font-size: 1.2rem;
      font-weight: 300; /* Spectral Light */
      color: #c0d8f0; /* Lighter blue */
      font-style: italic;
    }
    @media (max-width: 700px) {
      .cosmic-portal { padding: 3rem; }
      .quote-text-nebula { font-size: 2.5rem; }
      .quote-ref-stardust { font-size: 1rem; }
    }
    @media (max-width: 450px) {
      .cosmic-portal { padding: 2rem; }
      .quote-text-nebula { font-size: 2rem; }
    }
  </style>
  </head>
  <body>
    <canvas id="starfield"></canvas>
    <div class="cosmic-portal">
      <p class="quote-text-nebula">"{{text}}"</p>
      <p class="quote-ref-stardust">{{ref}}</p>
    </div>
    <script>
      const canvas = document.getElementById('starfield');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let stars = [];
        const numStars = 200;
  
        for (let i = 0; i < numStars; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5, // Star size
            alpha: Math.random() * 0.5 + 0.5, // Star opacity
            vx: (Math.random() - 0.5) * 0.1, // Slower horizontal velocity
            vy: (Math.random() - 0.5) * 0.1  // Slower vertical velocity
          });
        }
  
        function drawStars() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'rgba(255, 255, 255, star.alpha)';
          stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(220, 220, 255, ' + star.alpha + ')'; // Faint blueish white
            ctx.fill();
  
            star.x += star.vx;
            star.y += star.vy;
  
            if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
            if (star.y < 0 || star.y > canvas.height) star.vy *= -1;
          });
          requestAnimationFrame(drawStars);
        }
        drawStars();
        window.addEventListener('resize', () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          stars = []; // Reinitialize stars on resize to prevent clumping
           for (let i = 0; i < numStars; i++) {
              stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1
              });
           }
        });
      }
    </script>
  </body>
  </html>
  `,
  },
  {
    id: 34,
    name: "Tarjeta Postal Vintage Viajera",
    description:
      "Aspecto de postal antigua con colores desvaídos, sellos y tipografía evocadora.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;700&family=Gentium+Book+Plus:ital,wght@0,400;1,400&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e8dfc_a; /* Aged paper */
      font-family: 'Gentium Book Plus', serif;
      color: #4a4a4a;
      padding: 1rem;
      box-sizing: border-box;
    }
    .postcard {
      background: #fff9e6; /* Creamy postcard color */
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 1.5rem;
      max-width: 600px;
      width: 100%;
      box-shadow: 3px 3px 10px rgba(0,0,0,0.15);
      display: grid;
      grid-template-columns: 2fr 1fr; /* Main content and "stamp" area */
      grid-template-rows: auto auto;
      gap: 1rem;
      position: relative;
    }
    .postcard::before { /* Sepia overlay for aged look */
      content: '';
      position: absolute;
      top:0; left:0; right:0; bottom:0;
      background-color: #c9ad8f;
      opacity: 0.08;
      pointer-events: none;
      border-radius: inherit;
    }
    .postcard-content {
      grid-column: 1 / 2;
      grid-row: 1 / 3;
      padding-right: 1rem;
      border-right: 1px dashed #aaa; /* Divider line */
    }
    .stamp-area {
      grid-column: 2 / 3;
      grid-row: 1 / 2;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2px solid #800000; /* Maroon for stamp border */
      padding: 0.5rem;
      box-sizing: border-box;
      background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(128,0,0,0.1) 5px, rgba(128,0,0,0.1) 10px);
    }
    .stamp-area span {
      font-family: 'Kalam', cursive;
      font-weight: 700;
      font-size: 1.5rem;
      color: #500000;
      transform: rotate(-10deg);
    }
    .postmark-area {
      grid-column: 2 / 3;
      grid-row: 2 / 3;
      text-align: center;
      padding-top: 0.5rem;
    }
    .postmark-text {
      font-family: monospace;
      font-size: 0.7rem;
      color: #555;
      border: 1px solid #777;
      border-radius: 50%;
      padding: 0.3rem 0.5rem;
      display: inline-block;
      transform: rotate(5deg);
    }
    .quote-text-letter {
      font-family: 'Kalam', cursive;
      font-size: 1.8rem;
      font-weight: 300; /* Lighter Kalam */
      line-height: 1.6;
      margin-bottom: 1rem;
      color: #333;
    }
    .quote-ref-signed {
      font-size: 1rem;
      font-style: italic;
      text-align: right;
      color: #555;
    }
    @media (max-width: 500px) {
      .postcard { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
      .postcard-content { grid-row: 1 / 2; border-right: none; border-bottom: 1px dashed #aaa; padding-right: 0; padding-bottom: 1rem; }
      .stamp-area { grid-row: 2 / 3; margin-top: 0.5rem;}
      .postmark-area { grid-row: 3 / 4; }
      .quote-text-letter { font-size: 1.5rem; }
    }
  </style>
  </head>
  <body>
    <div class="postcard">
      <div class="postcard-content">
        <p class="quote-text-letter">"{{text}}"</p>
        <p class="quote-ref-signed">{{ref}}</p>
      </div>
      <div class="stamp-area">
        <span>AIR MAIL</span>
      </div>
      <div class="postmark-area">
        <span class="postmark-text">VIA AEREA<br>INSPIRA-EXPRESS</span>
      </div>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 35,
    name: "Bloques de Color Bauhaus Minimalista",
    description:
      "Diseño geométrico con colores primarios, líneas limpias y tipografía sans-serif funcional.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;700&family=Staatliches&display=swap');
    :root {
      --bauhaus-red: #d7292c;
      --bauhaus-yellow: #f8d82a;
      --bauhaus-blue: #005aa0;
      --bauhaus-black: #231f20;
      --bauhaus-offwhite: #f2f0eb;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--bauhaus-offwhite);
      font-family: 'Barlow', sans-serif;
      padding: 1rem;
      box-sizing: border-box;
    }
    .bauhaus-composition {
      background: var(--bauhaus-offwhite);
      padding: 0; /* Padding handled by inner elements */
      max-width: 600px;
      width: 100%;
      box-shadow: 5px 5px 0px var(--bauhaus-black);
      border: 2px solid var(--bauhaus-black);
      display: grid;
      grid-template-columns: 1fr 2fr;
      grid-template-rows: auto 1fr auto; /* Header, Content, Footer */
      min-height: 300px; /* Ensure some height */
    }
    .color-block-1 { /* Vertical bar */
      grid-row: 1 / 4;
      grid-column: 1 / 2;
      background-color: var(--bauhaus-yellow);
      padding: 1.5rem;
      display: flex;
      align-items: flex-end; /* Ref at bottom */
    }
    .header-block {
      grid-row: 1 / 2;
      grid-column: 2 / 3;
      background-color: var(--bauhaus-red);
      padding: 1rem 1.5rem;
      text-align: right;
    }
    .header-block span {
      font-family: 'Staatliches', cursive;
      font-size: 1.5rem;
      color: var(--bauhaus-offwhite);
    }
    .content-block {
      grid-row: 2 / 3;
      grid-column: 2 / 3;
      background-color: var(--bauhaus-offwhite);
      padding: 2rem 1.5rem;
      display: flex;
      align-items: center; /* Vertically center text */
    }
    .footer-block { /* Horizontal bar */
      grid-row: 3 / 4;
      grid-column: 2 / 3;
      background-color: var(--bauhaus-blue);
      height: 30px; /* Simple color bar */
    }
    .quote-text-construct {
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 1.3;
      color: var(--bauhaus-black);
    }
    .quote-ref-form {
      font-size: 1rem;
      color: var(--bauhaus-black);
      font-weight: 700;
      writing-mode: vertical-rl; /* Vertical text for ref */
      transform: rotate(180deg); /* Orient correctly */
    }
    @media (max-width: 600px) {
      .bauhaus-composition {
        grid-template-columns: 80px 1fr; /* Adjust column width */
      }
      .quote-text-construct { font-size: 1.8rem; }
      .header-block span { font-size: 1.2rem; }
      .color-block-1 { padding: 1rem; }
    }
    @media (max-width: 400px) {
      .bauhaus-composition {
          display: flex; flex-direction: column;
      }
      .color-block-1 { order: 3; writing-mode: horizontal-tb; transform: none; min-height: 50px; align-items: center;}
      .quote-ref-form { writing-mode: horizontal-tb; transform: none;}
      .header-block { order: 1;}
      .content-block { order: 2;}
      .footer-block { order: 4;}
    }
  </style>
  </head>
  <body>
    <div class="bauhaus-composition">
      <div class="color-block-1">
        <p class="quote-ref-form">{{ref}}</p>
      </div>
      <div class="header-block">
        <span>INSPIRATION</span>
      </div>
      <div class="content-block">
        <p class="quote-text-construct">"{{text}}"</p>
      </div>
      <div class="footer-block"></div>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 36,
    name: "Naturaleza Otoñal Cálida",
    description:
      "Tonos cálidos de otoño, motivos de hojas sutiles y tipografía acogedora.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,500&family=Cabin:wght@400;600&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #a25f2a, #f5d0a0); /* Burnt orange to light peach */
      font-family: 'Cabin', sans-serif;
      color: #4f260c; /* Dark brown */
      padding: 1rem;
      box-sizing: border-box;
    }
    .autumn-leaf-quote {
      background: rgba(255, 245, 230, 0.9); /* Creamy, almost opaque */
      border-radius: 15px;
      padding: 3rem;
      max-width: 620px;
      width: 100%;
      box-shadow: 0 10px 25px rgba(80, 40, 10, 0.3);
      text-align: center;
      position: relative;
      border: 2px solid #c87a3b; /* Mid-tone orange border */
    }
    .autumn-leaf-quote::before, .autumn-leaf-quote::after { /* Leaf accents */
      font-family: initial; /* Using unicode character for leaf */
      position: absolute;
      font-size: 3rem;
      opacity: 0.4;
      user-select: none;
    }
    .autumn-leaf-quote::before {
      content: '🍂'; /* Maple Leaf emoji */
      top: 15px;
      left: 20px;
      color: #cb6d29; /* Orange leaf */
      transform: rotate(-15deg);
    }
    .autumn-leaf-quote::after {
      content: '🍁'; /* Different Leaf emoji */
      bottom: 15px;
      right: 20px;
      color: #a7480a; /* Reddish-brown leaf */
      transform: rotate(10deg);
    }
    .quote-text-harvest {
      font-family: 'Playfair Display', serif;
      font-size: 2.6rem;
      font-weight: 500;
      line-height: 1.4;
      margin: 1rem 0 1.8rem 0;
      color: #6b3512; /* Richer brown */
    }
    .quote-ref-embers {
      font-size: 1.15rem;
      font-weight: 600; /* Cabin semibold */
      font-style: italic;
      color: #8c5a32; /* Lighter, warm brown */
    }
    @media (max-width: 600px) {
      .autumn-leaf-quote { padding: 2.5rem; }
      .quote-text-harvest { font-size: 2.1rem; }
      .autumn-leaf-quote::before, .autumn-leaf-quote::after { font-size: 2.5rem; }
      .quote-ref-embers { font-size: 1rem; }
    }
  </style>
  </head>
  <body>
    <div class="autumn-leaf-quote">
      <p class="quote-text-harvest">"{{text}}"</p>
      <p class="quote-ref-embers">{{ref}}</p>
    </div>
  </body>
  </html>
  `,
  },
  {
    id: 37,
    name: "Elegancia Art Decó Opulenta",
    description:
      "Oro, negro y crema con patrones geométricos y tipografía estilizada de la era Art Decó.",
    template: `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;600&family=Rozha+One&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #1f1d1a; /* Dark, almost black */
      font-family: 'Poppins', sans-serif;
      padding: 1rem;
      box-sizing: border-box;
    }
    .artdeco-frame {
      background-color: #f5e8d7; /* Cream */
      padding: 0.5rem; /* Outer frame padding */
      max-width: 650px;
      width: 100%;
      box-shadow: 0 0 20px rgba(218,165,32,0.4); /* Gold shadow */
      position: relative;
    }
    .artdeco-inner {
      border: 3px solid #b08d57; /* Muted Gold */
      padding: 2.5rem 3rem;
      text-align: center;
      background-image: /* Subtle sunburst pattern */
        repeating-radial-gradient(circle at center, rgba(176,141,87,0.05) 0, rgba(176,141,87,0.05) 5px, transparent 5px, transparent 20px);
      background-size: 100px 100px; /* Adjust size of pattern */
    }
    .artdeco-frame::before, .artdeco-frame::after { /* Corner details */
      content: '';
      position: absolute;
      width: 25px;
      height: 25px;
      background-color: #b08d57;
      z-index: 1;
    }
    .artdeco-frame::before {
      top: 0.5rem; left: 0.5rem;
      clip-path: polygon(0 0, 100% 0, 0 100%); /* Top-left triangle */
    }
    .artdeco-frame::after {
      bottom: 0.5rem; right: 0.5rem;
      clip-path: polygon(100% 100%, 0 100%, 100% 0); /* Bottom-right triangle */
    }
    .quote-text-gatsby {
      font-family: 'Rozha One', serif; /* Art Deco style font */
      font-size: 2.7rem;
      line-height: 1.35;
      margin-bottom: 1.8rem;
      color: #3b3021; /* Dark Brown */
      text-transform: capitalize;
    }
    .quote-ref-ritz {
      font-size: 1.1rem;
      font-weight: 600; /* Poppins semibold */
      letter-spacing: 1px;
      color: #8c6f44; /* Darker gold */
      text-transform: uppercase;
    }
    @media (max-width: 600px) {
      .artdeco-inner { padding: 2rem 2.5rem; }
      .quote-text-gatsby { font-size: 2.2rem; }
      .quote-ref-ritz { font-size: 1rem; }
    }
  </style>
  </head>
  <body>
    <div class="artdeco-frame">
      <div class="artdeco-inner">
        <p class="quote-text-gatsby">"{{text}}"</p>
        <p class="quote-ref-ritz">{{ref}}</p>
      </div>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita Inspiradora</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Turret+Road:wght@300;700&display=swap');
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #08080c; /* Very dark, almost black */
      font-family: 'Turret Road', cursive;
      color: #e0e0ff; /* Pale lavender */
      padding: 1rem;
      box-sizing: border-box;
      overflow: hidden; /* Hide shard overflow */
    }
    .shattered-glass-quote {
      background: rgba(10, 10, 20, 0.5); /* Dark blue-ish, translucent */
      padding: 3rem;
      max-width: 680px;
      width: 100%;
      box-shadow: 0 0 20px rgba(255,0,255,0.3), 0 0 35px rgba(0,255,255,0.3); /* Magenta and Cyan glow */
      text-align: center;
      position: relative;
      /* Clip-path for jagged edges - can be complex. Using simple border for broader compatibility here. */
      border: 1px solid rgba(120,120,180,0.3);
    }
    /* Simulating shards with pseudo-elements - can be expanded */
    .shard {
      position: absolute;
      background: linear-gradient(45deg, rgba(255,0,255,0.5), rgba(0,255,255,0.5));
      opacity: 0.2;
      box-shadow: 0 0 10px rgba(255,0,255,0.4), 0 0 10px rgba(0,255,255,0.4);
    }
    .shard1 { top: -20px; left: 10%; width: 80px; height: 100px; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); transform: rotate(15deg); }
    .shard2 { bottom: -30px; right: 5%; width: 100px; height: 70px; clip-path: polygon(0 0, 100% 0, 50% 100%); transform: rotate(-10deg); }
    .shard3 { top: 20%; right: -25px; width: 60px; height: 120px; clip-path: polygon(100% 0, 100% 100%, 0 50%); transform: rotate(5deg); }
    .shard4 { bottom: 15%; left: -30px; width: 70px; height: 90px; clip-path: polygon(0 0, 0 100%, 100% 50%); transform: rotate(-5deg); }
  
    .quote-text-glitch {
      font-family: 'Audiowide', cursive; /* Tech/display font */
      font-size: 2.5rem;
      line-height: 1.4;
      margin-bottom: 1.8rem;
      color: #fff;
      text-shadow: 0 0 5px #f0f, 0 0 8px #0ff; /* Magenta and Cyan text glow */
      position: relative; z-index: 1; /* Above shards */
    }
    .quote-ref-matrix {
      font-size: 1.2rem;
      font-weight: 700; /* Turret Road bold */
      color: #8aff8a; /* Neon green */
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative; z-index: 1;
    }
    @media (max-width: 600px) {
      .shattered-glass-quote { padding: 2.5rem; }
      .quote-text-glitch { font-size: 2rem; }
      .quote-ref-matrix { font-size: 1rem; }
      .shard1, .shard2, .shard3, .shard4 { display: none; } /* Hide shards on small screens for simplicity */
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
