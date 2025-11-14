import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ambil token dari cookie
    const token = req.cookies.token ?? process.env.MERCHANT_TOKEN;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    // Ambil query string
    const qs = req.url?.split("?")[1] ?? "";

    // Backend URL
    const backendURL = `${process.env.API_BASE_URL}/product-bymerchant?${qs}`;

    // Request ke backend
    const apiRes = await fetch(backendURL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Jika bukan JSON → langsung error
    const text = await apiRes.text();
    try {
      const json = JSON.parse(text);
      return res.status(apiRes.status).json(json);
    } catch {
      return res.status(500).json({ error: "Invalid Backend Response", raw: text });
    }
  } catch (err: any) {
    return res.status(500).json({
      message: err.message || "Error in proxy",
    });
  }
}
