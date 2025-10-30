import { UseGreekDatabase, useGreekDB } from "@/hooks/useGreekDB";
import { UseHebrewDatabase, useHebrewDB } from "@/hooks/useHebrewDB";
import useInstalledBibles, { VersionItem } from "@/hooks/useInstalledBible";
import useLoadDatabase, { UseLoadDB } from "@/hooks/useLoadDatabase";
import { DEFAULT_DATABASE, EBibleVersions } from "@/types";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import * as SQLite from "expo-sqlite";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { storedData$ } from "./LocalstoreContext";

type DatabaseContextType = {
  myBibleDB?: SQLite.SQLiteDatabase | null;
  executeSql: <T = any>(
    sql: string,
    params?: any[],
    queryName?: string
  ) => Promise<T[]>;
  installedBibles: VersionItem[];
  installedDictionary: VersionItem[];
  installedCommentary: VersionItem[];
  isInstallBiblesLoaded: boolean;
  isMyBibleDbLoaded: boolean;
  refreshDatabaseList: () => void;
  hebrewInterlinearService: UseHebrewDatabase;
  greekInterlinearService: UseGreekDatabase;
  mainBibleService: UseLoadDB;
  allBibleLoaded: boolean;
  getBibleServices: ({ isNewCovenant }: { isNewCovenant?: boolean }) => {
    primaryDB: UseLoadDB | UseHebrewDatabase | UseGreekDatabase | null;
    baseDB: UseHebrewDatabase | UseGreekDatabase | UseLoadDB | null;
  };
};

const initialContext: DatabaseContextType = {
  myBibleDB: null,
  executeSql: async (sql: string, params?: any[], queryName?: string) => [],
  installedBibles: [],
  installedDictionary: [],
  installedCommentary: [],
  isInstallBiblesLoaded: false,
  isMyBibleDbLoaded: false,
  refreshDatabaseList: () => {},
  hebrewInterlinearService: {
    database: null,
    isLoaded: false,
    error: null,
    executeSql: async (sql: string, params?: any[], queryName?: string) => [],
    reOpen: (dbName: any) => Promise.resolve(undefined),
  },
  greekInterlinearService: {
    database: null,
    isLoaded: false,
    error: null,
    executeSql: async (sql: string, params?: any[], queryName?: string) => [],
    reOpen: (dbName: any) => Promise.resolve(undefined),
  },
  mainBibleService: {
    database: null,
    executeSql: async (sql: string, params?: any[], queryName?: string) => [],
    isLoaded: false,
    reOpen: (dbName: any) => Promise.resolve(undefined),
  },
  allBibleLoaded: false,
  getBibleServices: () => ({
    primaryDB: null,
    baseDB: null,
  }),
};

const DatabaseContext = createContext<DatabaseContextType>(initialContext);

const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentBibleVersion, isDataLoaded } = use$(() => ({
    currentBibleVersion: storedData$.currentBibleVersion.get(),
    isDataLoaded: storedData$.isDataLoaded.get(),
  }));

  const {
    installedBibles,
    isLoaded,
    refreshDatabaseList,
    installedDictionary,
    installedCommentary,
  } = useInstalledBibles();

  const currentDbName = useMemo(
    () =>
      installedBibles?.find((x) => x.id === currentBibleVersion) ||
      installedBibles[0],
    [installedBibles, currentBibleVersion]
  );

  const isInterlinear = useMemo(
    () =>
      [EBibleVersions.INTERLINEAR, EBibleVersions.GREEK].includes(
        currentBibleVersion as EBibleVersions
      ),
    [currentBibleVersion]
  );

  // Load main Bible database first (critical for app functionality)
  const mainBibleService = useLoadDatabase({
    currentBibleVersion:
      isDataLoaded && isLoaded ? currentDbName : installedBibles[0],
    isInterlinear,
  });

  // Load interlinear databases in parallel once main DB is ready
  // This reduces the cascade effect and improves startup time
  const shouldLoadInterlinear = mainBibleService.isLoaded && isDataLoaded;

  const hebrewInterlinearService = useHebrewDB({
    databaseId: DEFAULT_DATABASE.INTERLINEAR,
    onProgress: (msg) => {
      showToast(msg, "SHORT");
    },
    enabled: shouldLoadInterlinear,
  });

  const greekInterlinearService = useGreekDB({
    databaseId: DEFAULT_DATABASE.GREEK,
    onProgress: (msg) => {
      showToast(msg, "SHORT");
    },
    enabled: shouldLoadInterlinear, // Load in parallel with Hebrew, not dependent on it
  });

  const allBibleLoaded = useMemo(
    () =>
      [
        mainBibleService.isLoaded,
        hebrewInterlinearService.isLoaded,
        greekInterlinearService.isLoaded,
      ].every((x) => x),
    [
      mainBibleService.isLoaded,
      hebrewInterlinearService.isLoaded,
      greekInterlinearService.isLoaded,
    ]
  );

  const getBibleServices = useCallback(
    ({ isNewCovenant }: { isNewCovenant?: boolean }) => {
      switch (currentBibleVersion) {
        case EBibleVersions.BIBLE:
          return {
            primaryDB: mainBibleService,
            baseDB: isNewCovenant
              ? greekInterlinearService
              : hebrewInterlinearService,
          };
        case EBibleVersions.NTV:
          return {
            primaryDB: mainBibleService,
            baseDB: null,
          };
        case EBibleVersions.INTERLINEAR:
          return {
            primaryDB: mainBibleService,
            baseDB: hebrewInterlinearService,
          };
        case EBibleVersions.GREEK:
          return {
            primaryDB: mainBibleService,
            baseDB: greekInterlinearService,
          };
        default:
          return {
            primaryDB: mainBibleService,
            baseDB: hebrewInterlinearService,
          };
      }
    },
    [currentBibleVersion, allBibleLoaded, mainBibleService]
  );

  const dbContextValue = {
    myBibleDB: mainBibleService.database,
    executeSql: mainBibleService.executeSql,
    installedBibles,
    installedDictionary,
    installedCommentary,
    isInstallBiblesLoaded: isLoaded,
    refreshDatabaseList,
    isMyBibleDbLoaded: mainBibleService.isLoaded,
    hebrewInterlinearService,
    greekInterlinearService,
    mainBibleService,
    allBibleLoaded,
    getBibleServices,
  };

  return (
    <DatabaseContext.Provider value={dbContextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

const useDBContext = (): DatabaseContextType => useContext(DatabaseContext);

export { DatabaseContext, useDBContext };
export default DatabaseProvider;
