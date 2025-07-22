import { useEffect, useRef, useState } from "react";
import type { RecordModel, RecordSubscription, ListOptions } from "pocketbase";
import { Collections, Screens } from "@/types";
import { router } from "expo-router";
import { pb } from "@/globalConfig";

type UseRealtimeResult<T, Single extends boolean> = Single extends true
  ? { data: T; loading: boolean; error: any }
  : { data: T[]; loading: boolean; error: any };

interface UseRealtimeCollectionProps<Single extends boolean> {
  collection: string;
  recordId?: Single extends true ? string : undefined;
  options?: ListOptions;
  enabled?: boolean;
}

const useRealtimeCollection = <
  T extends RecordModel,
  Single extends boolean = false
>(
  props: UseRealtimeCollectionProps<Single>
): UseRealtimeResult<T, Single> => {
  const { collection, recordId, options, enabled = true } = props;
  const topic = recordId || "*";

  const [data, setData] = useState<Single extends true ? T : T[]>(
    (recordId ? {} : []) as Single extends true ? T : T[]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const unsubRef = useRef(() => {});

  useEffect(() => {
    if (!enabled || !collection) return;

    const fetchAndSubscribe = async () => {
      try {
        setLoading(true);

        if (recordId) {
          const result = await pb.collection<T>(collection).getOne(recordId, {
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
          topic,
          (e: RecordSubscription<T>) => {
            setData((prev: any) => {
              if (recordId) {
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
          pb.collection(collection).unsubscribe(topic);
        };
      } catch (err: any) {
        console.log("Realtime error:", err, JSON.stringify(err.originalError));
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

  return { data, loading, error } as UseRealtimeResult<T, Single>;
};

export default useRealtimeCollection;
