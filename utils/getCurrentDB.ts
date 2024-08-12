import { DBName } from "enums";
import { VersionItem } from "hooks/useInstalledBible";
import { EBibleVersions } from "types";

const getCurrentDbName = (
  currentBible: string,
  databaseList: VersionItem[]
): string => {
  const defaultDb = "bible";
  const dbName =
    databaseList?.find((version) => currentBible === version.id)?.id ||
    defaultDb;
  return dbName;
};

export default getCurrentDbName;
