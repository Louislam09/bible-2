
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
export function mergeTextsGreek(textStrong: string, textInterlenear: string) {
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

export interface GreekSegment {
    key: number;
    greek: string;
    strong: string;
    morph: string;
    spanish: string;
}

export const parseGreekText = (text: string): GreekSegment[] => {
    // Match: GreekWord + <S> + <m> + <n>
    const regex = /([^<\s]+)\s*<S>(.*?)<\/S>\s*<m>(.*?)<\/m>\s*<n>(.*?)<\/n>/g;

    let match;
    const segments: GreekSegment[] = [];
    let index = 0;

    while ((match = regex.exec(text)) !== null) {
        const [_, greek, strong, morph, spanish] = match;
        segments.push({
            key: index++,
            greek: greek.trim(),
            strong: strong.trim(),
            morph: morph.trim(),
            spanish: spanish.trim(),
        });
    }

    return segments;
};

export const parseText = (text: string) => {

    // <e>בְּרֵאשִׁ֖ית</e> <S>7225</S> <ns>En el principio</ns><n>be-re-Shit</n> In the beginning <e>בָּרָ֣א</e> <S>1254</S> <ns>creó</ns><n>ba-Ra</n> created <e>אֱלֹהִ֑ים</e> <S>430</S> <ns>Dios</ns><n>E-lo-Him;</n> God <e>אֵ֥ת</e> <S>853</S> <n>'et</n> <e>הַשָּׁמַ֖יִם</e> <S>8064</S> <ns>los cielos</ns><n>hash-sha-Ma-yim</n> the heaven <e>וְאֵ֥ת</e> <S>853</S> <n>ve-'Et</n> <e>הָאָֽרֶץ׃</e> <S>776</S> <ns>y la tierra.</ns><n>ha-'A-retz.</n> the earth
    const regex = /<e>(.*?)<\/e>\s*<S>(.*?)<\/S>\s*(?:<ns>(.*?)<\/ns>)?\s*<n>(.*?)<\/n>\s*([^<]*)/g;

    let match;
    const segments: Segment[] = [];
    let index = 0;

    while ((match = regex.exec(text)) !== null) {
        const [_, hebrew, strong, spanish, translit, english] = match;
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