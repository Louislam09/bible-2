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
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat&display=swap');

  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column; /* Stack quote box and button */
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1f4037, #99f2c8);
    font-family: 'Montserrat', sans-serif;
    color: #1a1a1a;
    padding: 1rem; /* Padding for content */
    box-sizing: border-box;
  }

  .quote-box {
    background: rgba(255, 255, 255, 0.85);
    border-radius: 25px;
    padding: 3rem 4rem;
    max-width: 650px;
    width: 100%; /* Responsive width */
    box-shadow: 0 25px 40px rgba(0,0,0,0.25);
    position: relative;
    text-align: center;
    margin-bottom: 2rem; /* Space for the button */
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

  #downloadBtn {
    background-color: #1f4037;
    color: #f0f0f0;
    border: none;
    padding: 12px 25px;
    border-radius: 15px;
    font-family: 'Montserrat', sans-serif;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }

  #downloadBtn:hover {
    background-color: #2a5a4a;
    transform: translateY(-2px);
  }
  #downloadBtn:active {
    transform: translateY(0px);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .quote-box {
      padding: 2rem 2.5rem;
    }
    .quote-text {
      font-size: 2.2rem;
    }
    .verse {
      font-size: 1.1rem;
    }
    .quote-box::before, .quote-box::after {
      font-size: 4rem;
    }
     .quote-box::before { top: 10px; left: 15px; }
     .quote-box::after { bottom: 10px; right: 15px; }
  }
   @media (max-width: 480px) {
    .quote-box {
      padding: 1.5rem 2rem;
    }
    .quote-text {
      font-size: 1.8rem;
    }
    .verse {
      font-size: 1rem;
    }
     #downloadBtn {
        padding: 10px 20px;
        font-size: 0.9rem;
     }
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
  <button id="downloadBtn">Descargar Cita</button>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const downloadButton = document.getElementById('downloadBtn');
      if (downloadButton) {
        downloadButton.addEventListener('click', function() {
          const quoteBoxToCapture = document.querySelector('.quote-box');
          if (quoteBoxToCapture) {
            html2canvas(quoteBoxToCapture, {
              backgroundColor: null, // Use element's existing background
              useCORS: true,      // For external resources like fonts
              scale: 2            // Increase scale for better resolution
            }).then(canvas => {
              const image = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = image;
              link.download = 'cita_inspiradora.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }).catch(err => {
              console.error("Error al generar la imagen:", err);
              alert("Hubo un error al generar la imagen. Por favor, inténtelo de nuevo.");
            });
          } else {
            console.error("Elemento .quote-box no encontrado.");
            alert("Error: No se pudo encontrar el contenido de la cita para descargar.");
          }
        });
      } else {
         console.error("Botón de descarga #downloadBtn no encontrado.");
      }
    });
  </script>
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
];
