/* utils.js - updated helpers for Lost & Found (with analytics + categories + theme seed) */
(function () {
  window.LF = window.LF || {};

  const USERS_KEY = "lf-users";
  const ITEMS_KEY = "lf-items";
  const DELETED_KEY = "lf-deleted";
  const SESSION_KEY = "lf-session";
  const THEME_KEY = "lf-theme";
  const ADMIN_PASS_KEY = "lf-admin-pass";
  const LOGS_KEY = "lf-logs";

  const read = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  LF.readUsers = () => read(USERS_KEY, []);
  LF.writeUsers = (v) => write(USERS_KEY, v);

  LF.readItems = () => read(ITEMS_KEY, []);
  LF.writeItems = (v) => write(ITEMS_KEY, v);

  LF.readDeleted = () => read(DELETED_KEY, []);
  LF.writeDeleted = (v) => write(DELETED_KEY, v);

  LF.getSession = () => read(SESSION_KEY, null);
  LF.setSession = (s) => write(SESSION_KEY, s);
  LF.clearSession = () => localStorage.removeItem(SESSION_KEY);

  LF.getTheme = () => localStorage.getItem(THEME_KEY) || "light";
  LF.setTheme = (t) => localStorage.setItem(THEME_KEY, t);

  LF.getAdminPass = () => localStorage.getItem(ADMIN_PASS_KEY) || "codexadmin";
  LF.setAdminPass = (p) => localStorage.setItem(ADMIN_PASS_KEY, p);

  LF.readLogs = () => read(LOGS_KEY, []);
  LF.log = (type, meta = {}) => {
    const logs = LF.readLogs();
    logs.push({ id: Math.random().toString(36).slice(2), type, meta, at: Date.now() });
    write(LOGS_KEY, logs);
  };

  // Predefined categories (Option 2)
  LF.CATEGORIES = [
    "Bags",
    "Phones",
    "Electronics",
    "Books",
    "Documents",
    "ID Cards",
    "Wallets",
    "Clothes",
    "Keys",
    "Accessories",
    "Other"
  ];

  // Analytics helpers
  LF.analytics = {
    // count by type (lost/found)
    countByType: () => {
      const items = LF.readItems().filter(i => !i.deleted);
      return items.reduce((acc, it) => {
        acc[it.type] = (acc[it.type] || 0) + 1;
        return acc;
      }, {});
    },

    // items per day (YYYY-MM-DD)
    itemsPerDay: () => {
      const items = LF.readItems().filter(i => !i.deleted);
      return items.reduce((acc, it) => {
        const d = new Date(it.createdAt || Date.now()).toISOString().slice(0,10);
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {});
    },

    // user signup stats (counts per user creation not stored separately; we infer from users list)
    userSignupsPerDay: () => {
      // if you later store createdAt for users, switch to that; fallback: all users count by bucket 'total'
      const users = LF.readUsers();
      // try to parse createdAt if present
      const byDay = {};
      users.forEach(u => {
        const d = u.createdAt ? new Date(u.createdAt).toISOString().slice(0,10) : "unknown";
        byDay[d] = (byDay[d] || 0) + 1;
      });
      return byDay;
    },

    // resolved vs unresolved
    resolvedSummary: () => {
      const items = LF.readItems().filter(i => !i.deleted);
      const res = { resolved: 0, unresolved: 0 };
      items.forEach(i => (i.resolved ? res.resolved++ : res.unresolved++));
      return res;
    },

    // items by category
    byCategory: () => {
      const items = LF.readItems().filter(i => !i.deleted);
      return items.reduce((acc, it) => {
        const c = it.category || "Other";
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {});
    }
  };

  // ensure initial seed (default admin user + theme default)
  (function seed() {
    const users = LF.readUsers();
    if (!users.length) {
      users.push({ user: "admin", pass: "admin123", role: "admin", createdAt: Date.now() });
      LF.writeUsers(users);
    }
    if (!Array.isArray(LF.readItems())) LF.writeItems([]);
    if (!Array.isArray(LF.readDeleted())) LF.writeDeleted([]);
    if (!localStorage.getItem(THEME_KEY)) localStorage.setItem(THEME_KEY, "light");
  })();

})();
