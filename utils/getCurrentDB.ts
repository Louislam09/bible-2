import { VersionItem } from "hooks/useInstalledBible";

const getCurrentDbName = (
  currentBible: string,
  databaseList: VersionItem[]
): string => {
  const defaultDb = "Reina Valera 1960";
  const dbName =
    databaseList?.find((version) => currentBible === version.id)?.name ||
    defaultDb;
  return dbName;
};

export default getCurrentDbName;
