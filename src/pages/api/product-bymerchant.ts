// /pages/api/product-bymerchant.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token; // ambil token dari cookie
    const qs = req.url?.split("?")[1] ?? "";

    const backendURL = `${process.env.API_BASE_URL}/product-bymerchant?${qs}`;

    const apiRes = await fetch(backendURL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await apiRes.json();
    res.status(apiRes.status).json(json);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Error in proxy" });
  }
}
