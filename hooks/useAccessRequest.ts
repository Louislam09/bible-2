import { storedData$ } from "@/context/LocalstoreContext";
import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import checkConnection from "@/utils/checkConnection";
import { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

type AccessStatus = "pending" | "approved" | "rejected" | null;

export function useAccessRequest() {
    const [status, setStatus] = useState<AccessStatus>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequestStatus = async () => {
        const isConnected = await checkConnection();
        if (!isConnected || storedData$.isAlegresNuevasUnlocked.get()) {
            setLoading(false)
            return
        }

        const user = authState$.user.get();
        const userId = user?.id || pb.authStore.record?.id;
        console.log({ userId, aid: pb.authStore.record?.id })
        try {
            setLoading(true);
            if (!pb.authStore.isValid) throw new Error("Not authenticated");

            const request: RecordModel = await pb
                .collection("access_requests")
                .getFirstListItem(`user.id="${userId}"`, { requestKey: null });
            console.log('fetchRequestStatus', { request })
            setStatus(request.status as AccessStatus);
        } catch (err: any) {
            console.log('fetchRequestStatus', { err })
            if (err.status === 404) {
                setStatus(null); // No request yet
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

            // Check for existing pending request
            const existing = await pb
                .collection("access_requests")
                .getFirstListItem(`user.id="${userId}" && status="pending"`);

            if (existing) {
                setStatus("pending");
                return;
            }
        } catch (err: any) {
            if (err.status !== 404) {
                console.log('requestAccess', { err })
                setError(err.message || "Unknown error");
                setLoading(false);
                return;
            }

            // No existing pending request, so create one
            try {
                const created = await pb.collection("access_requests").create({
                    user: userId,
                    name: name || "",
                    status: "pending",
                });

                setStatus(created.status as AccessStatus);
            } catch (createErr: any) {
                setError(createErr.message || "Failed to request access");
            } finally {
                setLoading(false);
            }
        }
    };

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
