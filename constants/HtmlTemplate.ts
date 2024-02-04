import { StrongData } from "types";

export const htmlTemplate = (
  content: StrongData[] | any,
  colors: any,
  fontSize: any
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
                    background: transparent;
                    font-size: ${fontSize - 2}px;
                    user-select: none;
                    border-bottom: 1px solid #ddd;
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
            <h4>${content?.[0]?.topic ?? ""} > <a href='S:${
    content?.[1]?.topic ?? ""
  }'>${content?.[1]?.topic ?? ""}</a> 🔍</h4>
            ${(content?.[0].definition ?? "")?.replaceAll("font", "p")}
            <script>
            window.ReactNativeWebView.postMessage(document.body.scrollHeight)
            </script>
        </body>
        </html>
`;
};
