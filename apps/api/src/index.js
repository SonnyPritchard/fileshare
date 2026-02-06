const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const port = Number(process.env.API_PORT) || 4000;
const WEB_BASE_URL = process.env.WEB_BASE_URL || "http://localhost:3000";
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${port}`;
const SIGN_IN_TTL_MS = Number(process.env.SIGN_IN_TTL_MS) || 15 * 60 * 1000;
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS) || 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = "fileshare_session";
const COOKIE_SECURE =
  process.env.COOKIE_SECURE === "true" ||
  WEB_BASE_URL.startsWith("https://") ||
  API_BASE_URL.startsWith("https://");
const PAIRING_CODE_TTL_MS = 10 * 60 * 1000;

const dbPath = process.env.AUTH_DB_PATH || path.join(__dirname, "..", "data", "auth.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sign_in_tokens (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sign_in_tokens_email ON sign_in_tokens (email);
  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
`);

const insertUserStmt = db.prepare(
  "INSERT INTO users (id, email, created_at) VALUES (@id, @email, @createdAt)"
);
const findUserByEmailStmt = db.prepare("SELECT * FROM users WHERE email = ?");
const findUserByIdStmt = db.prepare("SELECT * FROM users WHERE id = ?");
const insertTokenStmt = db.prepare(
  "INSERT INTO sign_in_tokens (token, email, expires_at) VALUES (@token, @email, @expiresAt)"
);
const findTokenStmt = db.prepare("SELECT * FROM sign_in_tokens WHERE token = ?");
const deleteTokenStmt = db.prepare("DELETE FROM sign_in_tokens WHERE token = ?");
const cleanupTokensStmt = db.prepare("DELETE FROM sign_in_tokens WHERE expires_at <= ?");
const insertSessionStmt = db.prepare(
  "INSERT INTO sessions (id, user_id, expires_at) VALUES (@id, @userId, @expiresAt)"
);
const findSessionStmt = db.prepare("SELECT * FROM sessions WHERE id = ?");
const deleteSessionStmt = db.prepare("DELETE FROM sessions WHERE id = ?");
const cleanupSessionsStmt = db.prepare("DELETE FROM sessions WHERE expires_at <= ?");

const pendingPairings = new Map();
const devices = new Map();

function getTeamIdForUser(user) {
  return `team_${user.id}`;
}

function cleanupPendingPairings() {
  const now = Date.now();
  for (const [code, pending] of pendingPairings) {
    if (pending.expiresAt <= now) {
      pendingPairings.delete(code);
    }
  }
}

function generatePairingCode() {
  let code = "";
  for (let attempts = 0; attempts < 5; attempts += 1) {
    const value = crypto.randomInt(0, 1_000_000);
    code = String(value).padStart(6, "0");
    if (!pendingPairings.has(code)) {
      return code;
    }
  }
  return code;
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.end();
}

const additionalOrigins = (process.env.WEB_ALLOWED_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const allowedOrigins = new Set([WEB_BASE_URL, ...additionalOrigins]);

function isLocalDevOrigin(origin) {
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function setCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigin =
    origin && (allowedOrigins.has(origin) || isLocalDevOrigin(origin)) ? origin : WEB_BASE_URL;
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function parseCookies(header) {
  if (!header) return {};
  return header.split(";").reduce((acc, part) => {
    const [rawKey, ...valueParts] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(valueParts.join("="));
    return acc;
  }, {});
}

function createSessionCookie(sessionId, maxAgeSeconds) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (COOKIE_SECURE) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function clearSessionCookie() {
  const parts = [`${COOKIE_NAME}=`, `Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=0`];
  if (COOKIE_SECURE) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

async function readJson(req) {
  const body = await readBody(req);
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error("Invalid JSON");
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanupExpired() {
  const now = Date.now();
  cleanupTokensStmt.run(now);
  cleanupSessionsStmt.run(now);
}

function getSessionFromRequest(req) {
  cleanupExpired();
  const cookies = parseCookies(req.headers.cookie || "");
  const sessionId = cookies[COOKIE_NAME];
  if (!sessionId) return null;
  const session = findSessionStmt.get(sessionId);
  if (!session || session.expires_at <= Date.now()) {
    if (session) {
      deleteSessionStmt.run(sessionId);
    }
    return null;
  }
  return session;
}

function getUserFromSession(session) {
  if (!session) return null;
  const user = findUserByIdStmt.get(session.user_id);
  return user || null;
}

function ensureUser(email) {
  const existing = findUserByEmailStmt.get(email);
  if (existing) return existing;
  const user = {
    id: crypto.randomUUID(),
    email,
    createdAt: new Date().toISOString(),
  };
  insertUserStmt.run(user);
  return { id: user.id, email: user.email, created_at: user.createdAt };
}

const server = http.createServer(async (req, res) => {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url, API_BASE_URL);
  const pathname = url.pathname;

  if (req.method === "GET" && pathname === "/health") {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && pathname === "/auth/start") {
    try {
      const body = await readJson(req);
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!isValidEmail(email)) {
        json(res, 400, { error: "Valid email required" });
        return;
      }

      const user = ensureUser(email);
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + SIGN_IN_TTL_MS;

      insertTokenStmt.run({ token, email: user.email, expiresAt });

      // TODO: Send via email provider and add basic rate limiting.
      console.log(
        `Sign-in link for ${user.email}: ${API_BASE_URL}/auth/verify?token=${token}`
      );

      json(res, 200, { ok: true });
    } catch (error) {
      json(res, 400, { error: "Invalid request" });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/auth/verify") {
    const token = url.searchParams.get("token");
    if (!token) {
      json(res, 400, { error: "Token is required" });
      return;
    }

    const record = findTokenStmt.get(token);
    if (!record || record.expires_at <= Date.now()) {
      if (record) {
        deleteTokenStmt.run(token);
      }
      json(res, 400, { error: "Token is invalid or expired" });
      return;
    }

    const user = ensureUser(record.email);
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + SESSION_TTL_MS;
    insertSessionStmt.run({ id: sessionId, userId: user.id, expiresAt });
    deleteTokenStmt.run(token);

    res.setHeader("Set-Cookie", createSessionCookie(sessionId, Math.floor(SESSION_TTL_MS / 1000)));
    redirect(res, `${WEB_BASE_URL}/dashboard`);
    return;
  }

  if (req.method === "POST" && pathname === "/auth/logout") {
    const session = getSessionFromRequest(req);
    if (session) {
      deleteSessionStmt.run(session.id);
    }
    res.setHeader("Set-Cookie", clearSessionCookie());
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && pathname === "/me") {
    const session = getSessionFromRequest(req);
    const user = getUserFromSession(session);
    if (!user) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }
    json(res, 200, { id: user.id, email: user.email, createdAt: user.created_at });
    return;
  }

  if (req.method === "GET" && pathname === "/control-plane/metadata") {
    const session = getSessionFromRequest(req);
    const user = getUserFromSession(session);
    if (!user) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }

    const teamId = getTeamIdForUser(user);

    json(res, 200, {
      teamId,
      deviceId: "device_demo",
      peers: [{ deviceId: "device_peer_1", label: "Alice's laptop" }],
      services: [{ id: "svc_1", deviceId: "device_peer_1", label: "Files" }],
      transport: { provider: "tailscale" },
    });
    return;
  }

  if (req.method === "POST" && pathname === "/devices/pair/start") {
    const session = getSessionFromRequest(req);
    const user = getUserFromSession(session);
    if (!user) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }

    try {
      cleanupPendingPairings();
      const body = await readJson(req);
      const deviceName =
        typeof body.deviceName === "string" && body.deviceName.trim()
          ? body.deviceName.trim()
          : "New device";
      const teamId = getTeamIdForUser(user);
      const code = generatePairingCode();
      const expiresAt = Date.now() + PAIRING_CODE_TTL_MS;
      const pending = {
        id: crypto.randomUUID(),
        name: deviceName,
        teamId,
        userId: user.id,
        status: "pending",
        expiresAt,
      };

      // TODO: Persist pending pairings and device records.
      pendingPairings.set(code, pending);

      json(res, 200, { pairingCode: code });
    } catch (error) {
      json(res, 400, { error: "Invalid request" });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/devices/pair/complete") {
    const session = getSessionFromRequest(req);
    const user = getUserFromSession(session);
    if (!user) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }

    try {
      cleanupPendingPairings();
      const body = await readJson(req);
      const pairingCode =
        typeof body.pairingCode === "string" ? body.pairingCode.trim() : "";

      if (!/^\d{6}$/.test(pairingCode)) {
        json(res, 400, { error: "Pairing code must be 6 digits" });
        return;
      }

      const pending = pendingPairings.get(pairingCode);
      if (!pending) {
        json(res, 400, { error: "Pairing code is invalid or expired" });
        return;
      }

      if (pending.userId !== user.id) {
        json(res, 403, { error: "Pairing code is for a different account" });
        return;
      }

      // TODO: Trigger agent enrollment for this device.
      const device = {
        id: pending.id,
        name: pending.name,
        teamId: pending.teamId,
        status: "active",
        lastSeenAt: new Date().toISOString(),
      };

      pendingPairings.delete(pairingCode);
      devices.set(device.id, device);

      json(res, 200, { success: true });
    } catch (error) {
      json(res, 400, { error: "Invalid request" });
    }
    return;
  }

  json(res, 404, { error: "Not found" });
});

server.listen(port, () => {
  console.log(`API listening on :${port}`);
});
