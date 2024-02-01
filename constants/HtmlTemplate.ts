export const htmlTemplate = (content: any, colors: any, fontSize: any) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                body{
                    color: ${colors.text};
                    background: transparent;
                    font-size: ${fontSize - 2}px;
                    border: 1px solid red;
                }

                b{
                  color: ${colors.notification};
                }
                a {
                    text-decoration: none;
                    color: ${colors.notification};
                }
                a:after{
                    content: '🔎'
                }
                p:last-child{
                    color: green;
                }
            </style>
        </head>
        <body>
            ${content?.definition?.replaceAll("font", "p")}
        </body>
        </html>
`;
};
