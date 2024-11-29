import { DictionaryData } from "@/types";

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
                    background: ${colors.background};
                    font-size: ${isPrint ? "3rem" : fontSize + "px"};
                    user-select: none;
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 0;
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
                ${content?.[0]?.topic || ""} > <a href='S:${
    content?.[1]?.topic || ""
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

// <br/>
// <a href="https://play.google.com/store/apps/details?id=com.louislam09.bible">Descargar: Santa Biblia RV60: Audio</a>
