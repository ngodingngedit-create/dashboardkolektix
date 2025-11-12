// pages/api/product-bymerchant.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = process.env.MERCHANT_TOKEN;
    const baseUrl = process.env.API_BASE_URL;
    if (!token || !baseUrl) {
      console.error("Missing env:", { token: !!token, baseUrl });
      return res.status(500).json({ error: "Missing API configuration" });
    }

    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const upstreamUrl = `${baseUrl.replace(/\/$/, "")}/product-bymerchant${qs ? `?${qs}` : ""}`;

    console.log("Proxying to:", upstreamUrl); // debug di server console

    const upstreamResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const text = await upstreamResponse.text();
    // forward status dan body apa adanya
    res.status(upstreamResponse.status).send(text);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Server proxy error" });
  }
}
