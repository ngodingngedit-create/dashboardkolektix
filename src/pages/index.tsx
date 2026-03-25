import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-primary-base flex items-center justify-center">
      <div className="animate-pulse text-white font-semibold">Redirecting...</div>
    </div>
  );
}