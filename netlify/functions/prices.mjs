import { getStore } from "@netlify/blobs";

const DEFAULT_PRICES = {
  punctual: {
    exterior: [90, 120, 155, 200],
    interior: [85, 110, 140, 180],
    complet:  [145, 195, 260, 335],
    detailing:[215, 295, 390, 505],
  },
  plans: {
    basic:    [150, 205, 265, 350],
    standard: [200, 273, 363, 471],
    premium:  [290, 395, 525, 680],
  },
  supplements: {
    dirty:  30,
    urgent: 20,
    teak:   45,
    seal:   55,
  },
  year: 2026
};

export default async (req, context) => {
  const store = getStore("prices");

  if (req.method === "GET") {
    try {
      const data = await store.get("current", { type: "json" });
      const prices = data || DEFAULT_PRICES;
      return Response.json(prices);
    } catch {
      return Response.json(DEFAULT_PRICES);
    }
  }

  if (req.method === "POST") {
    const authHeader = req.headers.get("x-admin-password");
    const adminPassword = process.env["ADMIN_PASSWORD"] || "nauticcreus2026";

    if (authHeader !== adminPassword) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const body = await req.json();
      await store.setJSON("current", body);
      return Response.json({ ok: true });
    } catch (e) {
      return new Response("Error saving: " + e.message, { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/prices" };
