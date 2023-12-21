import { IStrongData } from '../components/CurrentWordModal'

export const htmlTemplate = (content: IStrongData) => {
    return (
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                a {
                    text-decoration: none;
                    color: green;
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
            <p><b>Pronunciacion: </b>${content.pronunciation}</p>
            <p><b>No. strong: </b>${content.topic}</p>
            ${content?.definition?.replaceAll("font", "p")}
            </body>
        </html>
`
    )
}