import { DictionaryData, TFont } from "@/types";

export const htmlTemplate = (
    content: DictionaryData[] | any,
    colors: any,
    fontSize: any,
    isPrint: boolean = false
) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Santa Escritura</title>
            <style>
                body{
                    color: ${colors.text};
                    background: ${colors.background}99;
                    font-size: ${isPrint ? "3rem" : fontSize + "px"};
                    user-select: none;
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 0;
                    font-family: serif;
                }

                b{
                    color: ${colors.notification};
                }
                a {
                    // text-decoration: none;
                    color: ${colors.notification};
                }
                a:after{
                    // content: '🔎'
                }
                p:last-child{
                    color: green;
                }
                h4 {
                    display: ${content?.[1]?.topic ? "block" : "none"};
                }
            </style>
        </head>
        <body>
            <h4>
                ${content?.[0]?.topic || ""} > <a href='S:${content?.[1]?.topic || ""
        }'>${content?.[1]?.topic || ""}</a> 🔍</h4>

        ${(
            content?.[0]?.definition || "No hay resultado para esta palabra"
        )?.replaceAll("font", "p")}
            <script>
                window.ReactNativeWebView.postMessage(document.body.scrollHeight)
            </script>
        </body>
        </html>
`;
};

export const aiHtmlTemplate = (
    explanation: string,
    colors: any,
    fontSize: any,
    isPrint: boolean = false
) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Explicación Bíblica - IA</title>
        <style>
            body {
                font-family: 'Georgia', 'Times New Roman', serif;
                padding: 30px;
                line-height: 1.8;
                color: ${colors.text};
                    // font-size: ${isPrint ? "3rem" : fontSize + "px"};
                max-width: 100%;
                margin: 0 auto;
                background: transparent;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid ${colors.border};
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                color: ${colors.text};
                margin-bottom: 10px;
            }
            .subtitle {
                font-size: 14px;
                color: ${colors.text};
                font-style: italic;
            }
            .content {
                background: transparent;
                padding: 0;
                border-radius: 0;
                box-shadow: none;
                width: 100%;
                box-sizing: border-box;
            }
            h1, h2, h3 {
                color: ${colors.text};
                margin-top: 30px;
                margin-bottom: 15px;
            }
            p {
                margin-bottom: 15px;
                text-align: justify;
            }
            strong {
                color: ${colors.notification};
            }
            em {
                color: ${colors.text};
            }
            blockquote {
                border-left: 4px solid ${colors.notification};
                padding-left: 20px;
                margin: 20px 0;
                font-style: italic;
                padding: 15px 20px;
                border-radius: 0;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid ${colors.border};
                font-size: 12px;
                color: ${colors.text};
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">📖 Explicación Bíblica</div>
            <div class="subtitle">Generado por Inteligencia Artificial • ${new Date().toLocaleDateString(
        "es-ES"
    )}</div>
        </div>
        <div class="content">
            ${explanation
            ?.replace(/\n\n/g, "</p><p>")
            .replace(/\n/g, "<br/>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/^(.+)$/gm, "<p>$1</p>") || ""
        }
        </div>
        <div class="footer">
            Esta explicación fue generada por IA y puede contener interpretaciones subjetivas.<br/>
            Siempre consulte con líderes espirituales calificados para un estudio más profundo.
        </div>
        <script>
            window.ReactNativeWebView.postMessage(document.body.scrollHeight);
        </script>
    </body>
    </html>
  `;
};
export const aiHtmlTemplatePrint = (explanation: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Explicación Bíblica - IA</title>
        <style>
            body {
                font-family: 'Georgia', 'Times New Roman', serif;
                padding: 30px;
                line-height: 1.8;
                color: #000000;
                max-width: 100%;
                margin: 0 auto;
                background: #FFFFFF;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #000000;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                color: #000000;
                margin-bottom: 10px;
            }
            .subtitle {
                font-size: 14px;
                color: #000000;
                font-style: italic;
            }
            .content {
                background: #FFFFFF;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                width: 100%;
                box-sizing: border-box;
            }
            h1, h2, h3 {
                color: #000000;
                margin-top: 30px;
                margin-bottom: 15px;
            }
            p {
                margin-bottom: 15px;
                text-align: justify;
                color: #000000;
            }
            strong {
                color: #000000;
                font-weight: bold;
            }
            em {
                color: #000000;
                font-style: italic;
            }
            blockquote {
                border-left: 4px solid #000000;
                padding-left: 20px;
                margin: 20px 0;
                font-style: italic;
                padding: 15px 20px;
                border-radius: 0;
                background: #F5F5F5;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #000000;
                font-size: 12px;
                color: #000000;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">📖 Explicación Bíblica</div>
            <div class="subtitle">Generado por Inteligencia Artificial • ${new Date().toLocaleDateString(
        "es-ES"
    )}</div>
        </div>
        <div class="content">
            ${explanation
            ?.replace(/\n\n/g, "</p><p>")
            .replace(/\n/g, "<br/>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/^(.+)$/gm, "<p>$1</p>") || ""
        }
        </div>
        <div class="footer">
            Esta explicación fue generada por IA y puede contener interpretaciones subjetivas.<br/>
            Siempre consulte con líderes espirituales calificados para un estudio más profundo.
        </div>
        <script>
            window.ReactNativeWebView.postMessage(document.body.scrollHeight);
        </script>
    </body>
    </html>
  `;
};

// <br/>
// <a href="https://play.google.com/store/apps/details?id=com.louislam09.bible">Descargar: Santa Biblia RV60: Audio</a>
