// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     // Ambil token dari cookie
//     const token = req.cookies.token ?? process.env.MERCHANT_TOKEN;

//     if (!token) {
//       return res.status(401).json({ message: "Missing token" });
//     }

//     // Ambil query string
//     const qs = req.url?.split("?")[1] ?? "";

//     // Backend URL
//     const backendURL = `${process.env.NEXT_PUBLIC_WS_URL}/product-bymerchant?${qs}`;

//     // Request ke backend
//     const apiRes = await fetch(backendURL, {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     // Jika bukan JSON → langsung error
//     const text = await apiRes.text();
//     try {
//       const json = JSON.parse(text);
//       return res.status(apiRes.status).json(json);
//     } catch {
//       return res.status(500).json({ error: "Invalid Backend Response", raw: text });
//     }
//   } catch (err: any) {
//     return res.status(500).json({
//       message: err.message || "Error in proxy",
//     });
//   }
// }

import type { NextApiRequest, NextApiResponse } from "next";

function trimSlash(s?: string) {
  if (!s) return "";
  return s.replace(/\/+$/g, ""); // hapus trailing slash
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ambil token dari cookie (fallback ke MERCHANT_TOKEN)
    const token = req.cookies.token ?? process.env.MERCHANT_TOKEN;
    if (!token) return res.status(401).json({ message: "Missing token" });

    // Ambil query string
    const qs = req.url?.split("?")[1] ?? "";

    // Pilihan sumber backend URL:
    // - gunakan env server-side yang eksplisit jika tersedia (contoh: BACKEND_URL)
    // - fallback ke NEXT_PUBLIC_WS_URL (tetap valid)
    const envBackend = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_WS_URL ?? "";
    const backendBase = trimSlash(envBackend);

    // Jika env kosong, tunjukkan error jelas
    if (!backendBase) {
      console.error("No backend base URL set. process.env.BACKEND_URL / NEXT_PUBLIC_WS_URL empty");
      return res.status(500).json({ error: "Backend URL not configured on server" });
    }

    // Bangun URL dengan aman (hindari double-slash)
    const backendURL = `${backendBase}/product-bymerchant${qs ? `?${qs}` : ""}`;

    // LOG untuk debug (cek logs di festaging)
    console.log("Proxying request to backend:", backendURL);

    const apiRes = await fetch(backendURL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await apiRes.text();
    try {
      const json = JSON.parse(text);
      return res.status(apiRes.status).json(json);
    } catch {
      console.error("Invalid backend response (not JSON). Raw:", text);
      return res.status(500).json({ error: "Invalid Backend Response", raw: text });
    }
  } catch (err: any) {
    console.error("Proxy error:", err);
    return res.status(500).json({
      message: err.message || "Error in proxy",
    });
  }
}
