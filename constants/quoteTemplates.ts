export const quoteTemplates = [
  {
    id: 1,
    name: "Inspiración Verde Elegante",
    description:
      "Un diseño elegante con tonos verdes y tipografía sofisticada para inspirar paz y reflexión.",
    template: `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=0.5" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat&display=swap');

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
<meta name="viewport" content="width=device-width, initial-scale=0.7" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat:wght@400;700&display=swap');
  body {
    margin: 0;
    height: 100vh;
    background: linear-gradient(135deg, #4b6cb7, #182848);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Montserrat', sans-serif;
    color: #e0e6f8;
      margin: 0 1rem;
        margin: 0 1rem;
  }
  .quote-box {
    background: rgba(25, 32, 61, 0.85);
    padding: 3rem 3.5rem;
    max-width: 680px;
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
<meta name="viewport" content="width=device-width, initial-scale=0.7" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&family=Lora&display=swap');
  body {
    margin: 0;
    height: 100vh;
    background: linear-gradient(135deg, #453a94, #6e85b7);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Lora', serif;
    color: #f0e9f4;
      margin: 0 1rem;
        margin: 0 1rem;
  }
  .quote-container {
    background: rgba(20, 16, 60, 0.85);
    max-width: 680px;
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
<meta name="viewport" content="width=device-width, initial-scale=0.7" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto&display=swap');

  body {
    margin: 0;
    height: 100vh;
    background: linear-gradient(135deg, #f5cac3, #ede7f6);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Roboto', sans-serif;
      margin: 0 1rem;
  }
  .quote-container {
    background: #ffffffdd;
    border-radius: 20px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    padding: 40px 50px;
    text-align: center;
    position: relative;
  }
  .quote-container::before, .quote-container::after {
    content: '“';
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 6rem;
    color: #7b448b;
    position: absolute;
  }
  .quote-container::before {
    top: -40px;
    left: 25px;
  }
  .quote-container::after {
    content: '”';
    bottom: -50px;
    right: 25px;
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
<meta name="viewport" content="width=device-width, initial-scale=0.7" />
<title>Proverbio Inspirador</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto&display=swap');
  body {
    margin: 0;
    height: 100vh;
    background: linear-gradient(135deg, #85a3b2, #d8bfd8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Roboto', sans-serif;
    color: #3e2c41;
      margin: 0 1rem;
  }
  .quote-container {
    background: #faf3ffdd;
    border-radius: 30px;
    box-shadow: 0 20px 50px rgba(121, 81, 145, 0.3);
    max-width: 650px;
    padding: 50px 60px;
    text-align: center;
    position: relative;
  }
  .quote-container::before,
  .quote-container::after {
    content: '“';
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 7rem;
    color: #9a5b99;
    position: absolute;
    opacity: 0.15;
    user-select: none;
  }
  .quote-container::before {
    top: -40px;
    left: 25px;
    transform: rotate(180deg);
  }
  .quote-container::after {
    bottom: -60px;
    right: 25px;
  }
  .quote-text {
    font-size: 2rem;
    line-height: 1.6;
    font-style: italic;
    margin-bottom: 30px;
  }
  .quote-ref {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.2rem;
    color: #885ead;
  }
</style>
</head>
<body>
  <div class="quote-container" role="blockquote" aria-label="Proverbio bíblico">
    <p class="quote-text">{{text}}</p>
    <p class="quote-ref">{{ref}}</p>
  </div>
</body>
</html>`,
  },
];
