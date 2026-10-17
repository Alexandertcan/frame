import { randomBytes } from "node:crypto";
export function createAuth({
  env = process.env,
  fetcher = fetch,
  now = Date.now,
} = {}) {
  const sessions = new Map(),
    attempts = new Map();
  const origin = env.APP_ORIGIN || "http://127.0.0.1:4173";
  const configured = !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
  const cookieName = "frame_session";
  const cookie = (value, age) =>
    `${cookieName}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${origin.startsWith("https:") ? "; Secure" : ""}`;
  const reply = (status, data, headers = {}) => ({ status, data, headers });
  const session = (headers) => {
    const id = (headers.cookie || "")
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith(cookieName + "="))
      ?.slice(cookieName.length + 1);
    const value = sessions.get(id);
    if (value && value.expiry > now()) return value;
    sessions.delete(id);
    return null;
  };
  return {
    async handle({ method, url, headers = {}, body = {} }) {
      if (method === "GET" && url === "/api/auth/status")
        return reply(200, { configured, method: "email-link" });
      if (method === "GET" && url === "/api/auth/me")
        return reply(200, { user: session(headers)?.user || null });
      if (method !== "POST") return reply(405, { error: "请求方式不支持" });
      if (url === "/api/auth/logout") {
        const id = (headers.cookie || "").match(
          /(?:^|;\s*)frame_session=([^;]+)/,
        )?.[1];
        sessions.delete(id);
        return reply(200, { ok: true }, { "Set-Cookie": cookie("", 0) });
      }
      if (!["/api/auth/request-link", "/api/auth/session"].includes(url))
        return reply(404, { error: "接口不存在" });
      if (!configured)
        return reply(503, {
          error:
            "邮箱登录服务尚未配置。你仍可使用本地项目；管理员接入邮箱认证服务后即可登录。",
        });
      const base = env.SUPABASE_URL.replace(/\/$/, "");
      if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(base))
        return reply(503, { error: "邮箱登录服务配置无效" });
      const apiHeaders = {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_ANON_KEY,
      };
      try {
        if (url === "/api/auth/request-link") {
          const email =
            typeof body.email === "string"
              ? body.email.trim().toLowerCase()
              : "";
          if (email.length > 254 || !/^\S+@[^\s@]+\.[^\s@]+$/.test(email))
            return reply(400, { error: "请输入有效的邮箱地址" });
          if (attempts.get(email) > now() - 60000)
            return reply(429, { error: "邮件请求过于频繁，请一分钟后再试" });
          attempts.set(email, now());
          while (attempts.size > 2000)
            attempts.delete(attempts.keys().next().value);
          const r = await fetcher(
            `${base}/auth/v1/otp?redirect_to=${encodeURIComponent(origin + "/auth/callback")}`,
            {
              method: "POST",
              headers: apiHeaders,
              body: JSON.stringify({ email, create_user: true }),
              signal: AbortSignal.timeout(15000),
            },
          );
          if (!r.ok)
            return reply(r.status === 429 ? 429 : 502, {
              error:
                r.status === 429
                  ? "邮件请求过于频繁，请稍后再试"
                  : "暂时无法发送登录邮件，请稍后重试",
            });
          return reply(200, {
            ok: true,
            message:
              "登录链接已发送，请检查邮箱与垃圾邮件。链接由邮箱认证服务提供。",
          });
        }
        if (
          typeof body.accessToken !== "string" ||
          body.accessToken.length < 20 ||
          body.accessToken.length > 8192
        )
          return reply(400, { error: "登录链接无效，请重新申请" });
        const r = await fetcher(base + "/auth/v1/user", {
          headers: {
            ...apiHeaders,
            Authorization: "Bearer " + body.accessToken,
          },
          signal: AbortSignal.timeout(15000),
        });
        if (!r.ok)
          return reply(401, { error: "登录链接已过期或无效，请重新申请" });
        const user = await r.json();
        if (!user.id || !user.email || !user.email_confirmed_at)
          return reply(401, { error: "邮箱尚未验证，请使用邮件中的登录链接" });
        const id = randomBytes(32).toString("hex");
        const safeUser = { id: user.id, email: user.email };
        sessions.set(id, { user: safeUser, expiry: now() + 3600000 });
        while (sessions.size > 2000)
          sessions.delete(sessions.keys().next().value);
        return reply(
          200,
          { user: safeUser },
          { "Set-Cookie": cookie(id, 3600) },
        );
      } catch {
        return reply(502, { error: "邮箱认证服务暂时无法连接，请稍后重试" });
      }
    },
  };
}
