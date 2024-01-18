export const getVerseTextRaw = (text: any) =>
  text.replace(/<s>.*?<\/s>|<pb>|<pb\/>|<f>.*?<\/f>|<t>|<\/t>/gi, "");
// text.replace(/<S>|<\/S>|<pb>|<pb\/>|<f>|<\/f>/g, "").replace(/[0-9]/g, "");
