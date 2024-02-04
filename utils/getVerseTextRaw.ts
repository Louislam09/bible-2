export const getVerseTextRaw = (text: any, addIcon: boolean = false) =>
  text
    .replace(/<.*?>|<\/.*?> |<.*?>.*?<\/.*?>|\[.*?\]/gi, "")
    .replace(/\d+/g, addIcon ? "🔍" : "");
// .replace(/[0-9]/g, ".");
// text.replace(/<s>.*?<\/s>|<pb>|<pb\/>|<f>.*?<\/f>|<t>|<\/t>|<.*?>/gi, "");
// text.replace(/<S>|<\/S>|<pb>|<pb\/>|<f>|<\/f>/g, "").replace(/[0-9]/g, "");
