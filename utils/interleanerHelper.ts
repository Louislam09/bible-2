
export function mergeTexts(textStrong: string, textInterlenear: string) {
    // 1. Crear un mapa Strong → traducción española
    const spanishMap: { [key: string]: string } = {};
    [...textStrong.matchAll(/(.*?)<S>(\d+)<\/S>/g)].forEach(match => {
        const word = match[1].trim();
        const strong = match[2];
        spanishMap[strong] = word;
    });

    // 2. Insertar <ns>...</ns> después del inglés en text2
    const merged = textInterlenear.replace(/(<S>(\d+)<\/S>)([^<]*)(?=<|$)/g, (full, strongTag, strongNum, afterStrong) => {
        const extra = spanishMap[strongNum] ? `<ns>${spanishMap[strongNum]}</ns>` : '';
        return strongTag + afterStrong + extra;
    });

    return merged;
}

interface Segment {
    key: number;
    hebrew: string;
    strong: string;
    translit: string;
    english: string;
    spanish: string;
}

export const parseText = (text: string) => {
    //   const regex = /<e>(.*?)<\/e>\s*<S>(.*?)<\/S>\s*<n>(.*?)<\/n>\s*([^<]*)\s*<ns>(.*?)<\/ns>/g;
    const regex =
        /<e>(.*?)<\/e>\s*<S>(.*?)<\/S>\s*<n>(.*?)<\/n>\s*([^<]*)\s*(?:<ns>(.*?)<\/ns>)?/g;
    let match;
    const segments: Segment[] = [];
    let index = 0;

    while ((match = regex.exec(text)) !== null) {
        const [_, hebrew, strong, translit, english, spanish] = match;
        segments.push({
            key: index++,
            hebrew,
            strong,
            translit,
            english: english?.trim() || "",
            spanish: spanish?.trim() || "",
        });
    }

    return segments;
};