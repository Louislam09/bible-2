import { storedData$ } from "@/context/LocalstoreContext";
import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import checkConnection from "@/utils/checkConnection";
import { RecordModel, UnsubscribeFunc } from "pocketbase";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

type AccessStatus = "pending" | "approved" | "rejected" | null;

export function useAccessRequest() {
    const [status, setStatus] = useState<AccessStatus>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recordId, setRecordId] = useState<string | null>(null); // store record ID for subscription

    const fetchRequestStatus = async () => {
        const isConnected = await checkConnection();
        if (!isConnected) {
            setLoading(false)
            return
        }

        const user = authState$.user.get();
        const userId = user?.id || pb.authStore.record?.id;
        try {
            setLoading(true);
            if (!pb.authStore.isValid) throw new Error("Not authenticated");

            const request: RecordModel = await pb
                .collection("access_requests")
                .getFirstListItem(`user.id="${userId}"`, { requestKey: null });

            if (request.status === 'approved') {
                storedData$.isAlegresNuevasUnlocked.set(true);
                storedData$.hasRequestAccess.set(true);
            } else if (request.status === 'rejected') {
                storedData$.isAlegresNuevasUnlocked.set(false);
            }

            setRecordId(request.id); // set for subscription
            setStatus(request.status as AccessStatus);
        } catch (err: any) {
            if (err.status === 404) {
                setStatus(null); // No request yet
                setRecordId(null);
            } else {
                setError(err.message || "Unknown error");
            }
        } finally {
            setLoading(false);
        }
    };

    const requestAccess = async (name: string) => {
        const isConnected = await checkConnection();
        if (!isConnected) {
            Alert.alert("Sin conexión", "No hay conexión a Internet para solicitar accesso.");
            return;
        }
        const user = authState$.user.get();
        const userId = user?.id || pb.authStore.record?.id;
        try {
            setLoading(true);
            if (!pb.authStore.isValid) throw new Error("Not authenticated");

            const existing = await pb
                .collection("access_requests")
                .getFirstListItem(`user.id="${userId}" && status="pending"`);

            if (existing) {
                setRecordId(existing.id);
                setStatus("pending");
                return;
            }
        } catch (err: any) {
            if (err.status !== 404) {
                setError(err.message || "Unknown error");
                setLoading(false);
                return;
            }

            try {
                const created = await pb.collection("access_requests").create({
                    user: userId,
                    name: name || "",
                    status: "pending",
                });

                setRecordId(created.id);
                setStatus(created.status as AccessStatus);
            } catch (createErr: any) {
                setError(createErr.message || "Failed to request access");
            } finally {
                setLoading(false);
            }
        }
    };

    // 📡 Subscribe to real-time changes
    useEffect(() => {
        if (!recordId) return;

        let unsubscribe: UnsubscribeFunc;

        const setupSubscription = async () => {
            try {
                unsubscribe = await pb.collection("access_requests").subscribe(recordId, (e) => {
                    const updated = e.record as RecordModel;
                    if (updated.status) {
                        setStatus(updated.status as AccessStatus);
                        if (updated.status === "approved") {
                            storedData$.isAlegresNuevasUnlocked.set(true);
                            storedData$.hasRequestAccess.set(true);
                        } else if (updated.status === "rejected") {
                            storedData$.isAlegresNuevasUnlocked.set(false);
                        }
                    }
                });
            } catch (err) {
                console.error("Subscription error", err);
            }
        };

        setupSubscription();

        return () => {
            console.log('unsubcribing')
            if (unsubscribe) unsubscribe();
        };
    }, [recordId]);


    useEffect(() => {
        fetchRequestStatus();
    }, []);

    return {
        status,
        loading,
        error,
        requestAccess,
        refetch: fetchRequestStatus,
    };
}
