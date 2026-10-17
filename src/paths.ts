const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export function appPath(path = "/") {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path) || path.startsWith("#")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}` || "/";
}

export function logicalPath(pathname = location.pathname) {
  if (!base) return pathname || "/";
  if (pathname === base || pathname === `${base}/`) return "/";
  return pathname.startsWith(`${base}/`)
    ? pathname.slice(base.length) || "/"
    : pathname || "/";
}
