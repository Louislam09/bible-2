import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import { Collections, Screens } from "@/types";
import { router } from "expo-router";
import type { ListOptions, RecordModel, RecordSubscription } from "pocketbase";
import { useEffect, useRef, useState } from "react";

type UseRealtimeResult<T, Single extends boolean> = Single extends true
  ? { data: T; loading: boolean; error: any, refetch: () => void }
  : { data: T[]; loading: boolean; error: any, refetch: () => void };

interface UseRealtimeCollectionProps<Single extends boolean> {
  collection: string;
  recordId?: Single extends true ? string : undefined;
  options?: ListOptions;
  enabled?: boolean;
  byUser?: boolean;
}

const useRealtimeCollection = <
  T extends RecordModel,
  Single extends boolean = false
>(
  props: UseRealtimeCollectionProps<Single>
): UseRealtimeResult<T, Single> => {
  const { collection, recordId, options, enabled = true, byUser = false } = props;
  const topic = recordId || "*";

  const [data, setData] = useState<Single extends true ? T : T[]>(
    (recordId ? {} : []) as Single extends true ? T : T[]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const unsubRef = useRef(() => { });

  const refetch = async () => {
    const user = authState$.user.get();
    const userId = user?.id || pb.authStore.record?.id;
    let userRecordId = '';

    if (byUser && !userId) {
      setError("User not authenticated");
      return;
    }
    try {
      setLoading(true);
      if (recordId) {
        const result = await pb.collection<T>(collection).getOne(recordId, {
          ...options,
        });
        userRecordId = result.id;
        setData(result as any);
      } else if (byUser) {
        const result = await pb.collection<T>(collection).getFirstListItem(`user.id="${userId}"`, {
          ...options,
        });
        setData(result as any);
      } else {
        const result = await pb.collection<T>(collection).getFullList({
          ...options,
        });
        setData(result as any);
      }

      pb.collection(collection).subscribe(
        userRecordId ? userRecordId : topic,
        (e: RecordSubscription<T>) => {
          setData((prev: any) => {
            if (recordId || byUser) {
              if (e.action === "update") return e.record;
              return prev;
            } else {
              if (e.action === "create") {
                return [e.record, ...prev];
              }
              if (e.action === "update")
                return prev.map((item: T) =>
                  item.id === e.record.id ? e.record : item
                );
              if (e.action === "delete")
                return prev.filter((item: T) => item.id !== e.record.id);
              return prev;
            }
          });
        },
        options
      );

      unsubRef.current = () => {
        pb.collection(collection).unsubscribe(userRecordId ? userRecordId : topic);
      };
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled || !collection) return;

    const fetchAndSubscribe = async () => {
      const user = authState$.user.get();
      const userId = user?.id || pb.authStore.record?.id;
      let userRecordId = '';

      if (byUser && !userId) {
        setError("User not authenticated");
        return;
      }
      try {
        setLoading(true);
        if (recordId) {
          const result = await pb.collection<T>(collection).getOne(recordId, {
            ...options,
          });
          userRecordId = result.id;
          setData(result as any);
        } else if (byUser) {
          const result = await pb.collection<T>(collection).getFirstListItem(`user.id="${userId}"`, {
            ...options,
          });
          setData(result as any);
        } else {
          const result = await pb.collection<T>(collection).getFullList({
            ...options,
          });
          setData(result as any);
        }

        pb.collection(collection).subscribe(
          userRecordId ? userRecordId : topic,
          (e: RecordSubscription<T>) => {
            setData((prev: any) => {
              if (recordId || byUser) {
                if (e.action === "update") return e.record;
                return prev;
              } else {
                if (e.action === "create") {
                  return [e.record, ...prev];
                }
                if (e.action === "update")
                  return prev.map((item: T) =>
                    item.id === e.record.id ? e.record : item
                  );
                if (e.action === "delete")
                  return prev.filter((item: T) => item.id !== e.record.id);
                return prev;
              }
            });
          },
          options
        );

        unsubRef.current = () => {
          pb.collection(collection).unsubscribe(userRecordId ? userRecordId : topic);
        };
      } catch (err: any) {
        // console.log("Realtime error:", err, JSON.stringify(err.originalError));
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSubscribe();

    return () => {
      unsubRef.current?.();
    };
  }, [collection, recordId, enabled, JSON.stringify(options)]);

  return { data, loading, error, refetch } as UseRealtimeResult<T, Single>;
};

export default useRealtimeCollection;
