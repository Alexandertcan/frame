import assert from "node:assert/strict";
import { createAuth } from "../server/auth.mjs";
let passed = 0;
const test = async (name, fn) => {
  await fn();
  passed++;
  console.log("PASS", name);
};
await test("unconfigured email auth cannot create a login or pretend to send mail", async () => {
  const auth = createAuth({
    env: {},
    fetcher: () => {
      throw Error("must not call provider");
    },
  });
  assert.equal(
    (await auth.handle({ method: "GET", url: "/api/auth/status" })).data
      .configured,
    false,
  );
  assert.equal(
    (
      await auth.handle({
        method: "POST",
        url: "/api/auth/request-link",
        body: { email: "me@example.com" },
      })
    ).status,
    503,
  );
  assert.equal(
    (await auth.handle({ method: "GET", url: "/api/auth/me" })).data.user,
    null,
  );
});
const env = {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "test-anon",
  APP_ORIGIN: "https://frame.example",
};
await test("email request validates addresses, uses approved callback and throttles duplicates", async () => {
  const calls = [];
  const auth = createAuth({
    env,
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return { ok: true };
    },
  });
  assert.equal(
    (
      await auth.handle({
        method: "POST",
        url: "/api/auth/request-link",
        body: { email: "not an email" },
      })
    ).status,
    400,
  );
  assert.equal(calls.length, 0);
  assert.equal(
    (
      await auth.handle({
        method: "POST",
        url: "/api/auth/request-link",
        body: { email: " Person@Example.com " },
      })
    ).status,
    200,
  );
  assert.equal(JSON.parse(calls[0].options.body).email, "person@example.com");
  assert.ok(
    calls[0].url.includes(
      encodeURIComponent("https://frame.example/auth/callback"),
    ),
  );
  assert.equal(
    (
      await auth.handle({
        method: "POST",
        url: "/api/auth/request-link",
        body: { email: "person@example.com" },
      })
    ).status,
    429,
  );
});
await test("only provider-verified email creates an HttpOnly expiring session; logout invalidates it", async () => {
  let clock = 100000;
  let valid = false;
  const auth = createAuth({
    env,
    now: () => clock,
    fetcher: async () => ({
      ok: valid,
      json: async () => ({
        id: "user-1",
        email: "me@example.com",
        email_confirmed_at: "2026-10-15",
      }),
    }),
  });
  const request = {
    method: "POST",
    url: "/api/auth/session",
    body: { accessToken: "valid-token-for-test-only" },
  };
  assert.equal((await auth.handle(request)).status, 401);
  valid = true;
  const login = await auth.handle(request);
  assert.equal(login.status, 200);
  assert.match(
    login.headers["Set-Cookie"],
    /HttpOnly; SameSite=Lax; Path=\/; Max-Age=3600; Secure/,
  );
  assert.ok(!login.headers["Set-Cookie"].includes("valid-token"));
  const headers = { cookie: login.headers["Set-Cookie"].split(";")[0] };
  assert.equal(
    (await auth.handle({ method: "GET", url: "/api/auth/me", headers })).data
      .user.email,
    "me@example.com",
  );
  await auth.handle({ method: "POST", url: "/api/auth/logout", headers });
  assert.equal(
    (await auth.handle({ method: "GET", url: "/api/auth/me", headers })).data
      .user,
    null,
  );
  const again = await auth.handle(request);
  clock += 3600001;
  assert.equal(
    (
      await auth.handle({
        method: "GET",
        url: "/api/auth/me",
        headers: { cookie: again.headers["Set-Cookie"].split(";")[0] },
      })
    ).data.user,
    null,
  );
});
await test("provider failure does not leak provider details or create a session", async () => {
  const auth = createAuth({
    env,
    fetcher: async () => {
      throw Error("sensitive provider internals");
    },
  });
  const r = await auth.handle({
    method: "POST",
    url: "/api/auth/request-link",
    body: { email: "me@example.com" },
  });
  assert.equal(r.status, 502);
  assert.ok(!JSON.stringify(r).includes("sensitive"));
  assert.equal(
    (await auth.handle({ method: "GET", url: "/api/auth/me" })).data.user,
    null,
  );
});
console.log(`${passed} email-auth tests passed`);
