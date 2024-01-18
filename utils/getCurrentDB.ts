import { DBName } from "enums";
import { EBibleVersions } from "types";

const getCurrentDbName = (
  currentBible: keyof typeof EBibleVersions | string
): DBName.BIBLE | DBName.NTV => {
  const dbNames: {
    [key in EBibleVersions | string]: DBName.BIBLE | DBName.NTV;
  } = {
    [EBibleVersions.RVR60]: DBName.BIBLE,
    // [EBibleVersions.RVR1965]: DBName.BIBLE,
    [EBibleVersions.NTV]: DBName.NTV,
  };

  return dbNames[currentBible] ?? DBName.BIBLE;
};

export default getCurrentDbName;
