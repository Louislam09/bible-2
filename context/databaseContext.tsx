import { UseGreekDatabase, useGreekDB } from "@/hooks/useGreekDB";
import { UseHebrewDatabase, useHebrewDB } from "@/hooks/useHebrewDB";
import useInstalledBibles, { VersionItem } from "@/hooks/useInstalledBible";
import useLoadDatabase, { UseLoadDB } from "@/hooks/useLoadDatabase";
import { DEFAULT_DATABASE, EBibleVersions } from "@/types";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import * as SQLite from "expo-sqlite";
import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
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
  isInstallBiblesLoaded: boolean;
  isMyBibleDbLoaded: boolean;
  refreshDatabaseList: () => void;
  interlinearService: UseHebrewDatabase;
  interlinearGreekService: UseGreekDatabase;
  mainBibleService: UseLoadDB;
  allBibleLoaded: boolean;
  getBibleServices: () => {
    primaryDB: UseLoadDB | UseHebrewDatabase | UseGreekDatabase | null;
    baseDB: UseHebrewDatabase | UseGreekDatabase | UseLoadDB | null;
  };
};

const initialContext: DatabaseContextType = {
  myBibleDB: null,
  executeSql: async (sql: string, params?: any[], queryName?: string) => [],
  installedBibles: [],
  installedDictionary: [],
  isInstallBiblesLoaded: false,
  isMyBibleDbLoaded: false,
  refreshDatabaseList: () => { },
  interlinearService: {
    database: null,
    isLoaded: false,
    error: null,
    executeSql: async (sql: string, params?: any[], queryName?: string) => [],
    reOpen: (dbName: any) => Promise.resolve(undefined),
  },
  interlinearGreekService: {
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
  } = useInstalledBibles();

  const currentDbName = useMemo(
    () => installedBibles?.find((x) => x.id === currentBibleVersion),
    [installedBibles, currentBibleVersion]
  );

  const isInterlinear = useMemo(
    () =>
      [
        EBibleVersions.INT,

        EBibleVersions.GREEK,
      ].includes(currentBibleVersion as EBibleVersions),
    [currentBibleVersion]
  );

  const mainBibleService = useLoadDatabase({
    currentBibleVersion: isDataLoaded && isLoaded ? currentDbName : undefined,
    isInterlinear,
  });

  const interlinearService = useHebrewDB({
    databaseId: DEFAULT_DATABASE.INTERLINEAR,
    isInterlinear,
    onProgress: (msg) => {
      showToast(msg, "SHORT");
    },
    enabled: mainBibleService.isLoaded,
  });

  const interlinearGreekService = useGreekDB({
    databaseId: DEFAULT_DATABASE.GREEK,
    onProgress: (msg) => {
      showToast(msg, "SHORT");
    },
    enabled: interlinearService.isLoaded,
  });

  const allBibleLoaded = useMemo(
    () =>
      [
        mainBibleService.isLoaded,
        interlinearService.isLoaded,
        interlinearGreekService.isLoaded,
      ].every((x) => x),
    [mainBibleService.isLoaded, interlinearService.isLoaded, interlinearGreekService.isLoaded]
  );

  const getBibleServices = useCallback(() => {
    // console.log({ currentBibleVersion })
    switch (currentBibleVersion) {
      case EBibleVersions.BIBLE:
        return {
          primaryDB: mainBibleService,
          baseDB: interlinearService,
        }
      case EBibleVersions.NTV:
        return {
          primaryDB: mainBibleService,
          baseDB: null,
        }
      case EBibleVersions.INT:
        return {
          primaryDB: interlinearService,
          baseDB: mainBibleService,
        }
      case EBibleVersions.GREEK:
        return {
          primaryDB: interlinearGreekService,
          baseDB: mainBibleService,
        }
      default:
        return {
          primaryDB: mainBibleService,
          baseDB: interlinearService,
        };
    }
  }, [currentBibleVersion, allBibleLoaded]);

  // useEffect(() => {
  //   console.log({ currentBibleVersion });
  //   console.log(getBibleServices());
  // }, [currentBibleVersion, allBibleLoaded]);

  const dbContextValue = {
    myBibleDB: mainBibleService.database,
    executeSql: mainBibleService.executeSql,
    installedBibles,
    installedDictionary,
    isInstallBiblesLoaded: isLoaded,
    refreshDatabaseList,
    isMyBibleDbLoaded: mainBibleService.isLoaded,
    interlinearService,
    interlinearGreekService,
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
