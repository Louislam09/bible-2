export const wordDefinitionHtmlTemplate = (
    content: any,
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
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
            <title>Santa Escritura</title>
            <style>
                body{
                    color: ${colors.text};
                    background: ${colors.background};
                    font-size: ${isPrint ? "3rem" : fontSize - 2 + "px"};
                    user-select: none;
                    padding-bottom: 20px;
                    font-family: "Open Sans", sans-serif;
                    font-optical-sizing: auto;
                    font-weight: <weight>;
                    font-style: normal;
                    font-variation-settings:
                        "wdth" 100;
                }
                h3{
                    text-transform: uppercase;
                    color: ${colors.notification};
                }
                b,h3{
                    color: ${colors.notification};
                }
                a {
                    // text-decoration: none;
                    color: ${colors.notification};
                }
                a:after{
                    content: '🔎'
                }
                p{
                    color: ${colors.text};
                }
                
            </style>
        </head>
        <body>
           ${content?.replace(/<b>(.*?)<\/b>/g, "<h3>$1</h3>")}
        </body>
        </html>
`;
};
