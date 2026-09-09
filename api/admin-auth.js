// Checks an admin passcode against a server-side secret. The secret
// never reaches the browser — the frontend only ever gets back true/false.
// This is still a shared-passcode scheme, appropriate for a small pilot,
// not per-person accounts. Before handling real users at scale, replace
// this with Supabase Auth + a role column protected by Row Level Security,
// so admin status is enforced by the database, not just the UI.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  const secret = process.env.ADMIN_PASSCODE;
  if (!secret) {
    // No passcode configured on the server — admin sign-in is disabled
    // rather than silently open to everyone.
    res.status(200).json({ ok: false, reason: "not_configured" });
    return;
  }

  const { code } = req.body || {};
  res.status(200).json({ ok: typeof code === "string" && code === secret });
}
