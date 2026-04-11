import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const userDataStr = Cookies.get("user_data");
    let userData = null;
    try {
      userData = userDataStr ? JSON.parse(userDataStr) : null;
    } catch (e) {
      console.error('Error parsing user_data:', e);
    }

    if (token && userData) {
      if (userData.role === 'Admin') {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
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