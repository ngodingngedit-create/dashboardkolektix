import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
    interface Window {
        echo: Echo<any> | null;
    }
}

if (typeof window !== "undefined") {
    Pusher.Runtime.createXHR = function (): any {
        return new XMLHttpRequest();
    };

    const token = localStorage.getItem("token");

    window.echo = new Echo<any>({
        broadcaster: "pusher",
        key: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1", // Tambahkan default cluster jika tidak ada
        wsHost: process.env.NEXT_PUBLIC_WS_HOST || "127.0.0.1",
        wsPort: Number(process.env.NEXT_PUBLIC_WS_PORT) || 6001,
        wssPort: Number(process.env.NEXT_PUBLIC_WSS_PORT) || 6001,
        forceTLS: process.env.NEXT_PUBLIC_FORCE_TLS === "true",
        disableStats: true,
        enabledTransports: ["ws", "wss"],
        authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_HOST}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        },
    });
}

export default typeof window !== "undefined" ? window.echo : null;
