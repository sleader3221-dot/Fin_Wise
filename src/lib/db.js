const realtimeChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("finwise-data") : null;

const notifyDataChanged = (key) => {
  const detail = { key, changed_at: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent("finwise:data", { detail }));
  realtimeChannel?.postMessage(detail);
};

realtimeChannel?.addEventListener("message", (event) => {
  window.dispatchEvent(new CustomEvent("finwise:data", { detail: event.data }));
});

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  notifyDataChanged(key);
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const publicUser = (user) => user ? {
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  created_date: user.created_date,
} : null;

const getUsers = () => readJson("finwise_users", []);
const saveUsers = (users) => writeJson("finwise_users", users);
const getSessionUserId = () => localStorage.getItem("finwise_session_user_id");
const setSessionUserId = (id) => localStorage.setItem("finwise_session_user_id", id);

const sortRows = (rows, sort) => {
  if (!sort) return rows;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;

  return [...rows].sort((a, b) => {
    if (a[field] === b[field]) return 0;
    if (a[field] == null) return 1;
    if (b[field] == null) return -1;
    return (a[field] > b[field] ? 1 : -1) * (desc ? -1 : 1);
  });
};

const entityStore = (name) => {
  const key = `finwise_entity_${name}`;
  const read = () => {
    if (name === "User") return getUsers().map(publicUser);
    return readJson(key, []);
  };
  const write = (rows) => {
    if (name === "User") {
      const existing = getUsers();
      const merged = rows.map((row) => {
        const current = existing.find((user) => user.id === row.id);
        return { ...current, ...row, password: current?.password || row.password || "" };
      });
      saveUsers(merged);
      return;
    }
    writeJson(key, rows);
  };

  return {
    async list(sort, limit) {
      const rows = sortRows(read(), sort);
      return typeof limit === "number" ? rows.slice(0, limit) : rows;
    },
    async filter(criteria = {}, sort, limit) {
      const rows = read().filter((row) =>
        Object.entries(criteria).every(([field, value]) => row[field] === value)
      );
      const sorted = sortRows(rows, sort);
      return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
    },
    async get(id) {
      return read().find((row) => row.id === id) || null;
    },
    async create(data) {
      const now = new Date().toISOString();
      const row = { id: makeId(), created_date: now, updated_date: now, ...data };
      write([row, ...read()]);
      return row;
    },
    async update(id, data) {
      let updated = null;
      const rows = read().map((row) => {
        if (row.id !== id) return row;
        updated = { ...row, ...data, updated_date: new Date().toISOString() };
        return updated;
      });
      write(rows);
      return updated;
    },
    async delete(id) {
      write(read().filter((row) => row.id !== id));
      return true;
    },
  };
};

const db = {
  auth: {
    async register({ email, password }) {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) throw new Error("Email and password are required");
      if (password.length < 6) throw new Error("Password must be at least 6 characters");

      const users = getUsers();
      if (users.some((user) => user.email === cleanEmail)) {
        throw new Error("An account with this email already exists");
      }

      const user = {
        id: makeId(),
        email: cleanEmail,
        password,
        full_name: cleanEmail.split("@")[0],
        created_date: new Date().toISOString(),
      };
      saveUsers([...users, user]);
      setSessionUserId(user.id);
      return publicUser(user);
    },
    async verifyOtp({ email }) {
      const user = getUsers().find((item) => item.email === email.trim().toLowerCase());
      if (!user) throw new Error("Account not found");
      setSessionUserId(user.id);
      return { access_token: user.id };
    },
    setToken(token) {
      setSessionUserId(token);
    },
    async resendOtp() {
      return true;
    },
    async resetPasswordRequest() {
      return true;
    },
    async resetPassword({ email, newPassword }) {
      const cleanEmail = email?.trim().toLowerCase();
      const users = getUsers();
      const user = users.find((item) => item.email === cleanEmail);
      if (!user) throw new Error("Account not found");
      saveUsers(users.map((item) => item.id === user.id ? { ...item, password: newPassword } : item));
      return true;
    },
    async loginViaEmailPassword(email, password) {
      const user = getUsers().find(
        (item) => item.email === email.trim().toLowerCase() && item.password === password
      );
      if (!user) throw new Error("Invalid email or password");
      setSessionUserId(user.id);
      return publicUser(user);
    },
    async loginWithProvider() {
      throw new Error("Google login is not configured in this local build");
    },
    async isAuthenticated() {
      return Boolean(getSessionUserId());
    },
    async me() {
      const user = getUsers().find((item) => item.id === getSessionUserId());
      if (!user) throw new Error("Not authenticated");
      return publicUser(user);
    },
    logout(redirectTo = "/login") {
      localStorage.removeItem("finwise_session_user_id");
      if (redirectTo) window.location.href = redirectTo;
    },
  },
  entities: new Proxy({}, { get: (_, name) => entityStore(name) }),
  agents: {
    async listConversations({ agent_name } = {}) {
      const conversations = readJson("finwise_conversations", []);
      return agent_name ? conversations.filter((item) => item.agent_name === agent_name) : conversations;
    },
    async createConversation(data = {}) {
      const conversation = { id: makeId(), messages: [], created_date: new Date().toISOString(), ...data };
      writeJson("finwise_conversations", [conversation, ...readJson("finwise_conversations", [])]);
      return conversation;
    },
    subscribeToConversation(conversationId, callback) {
      const handler = () => {
        const conversations = readJson("finwise_conversations", []);
        const conversation = conversations.find((item) => item.id === conversationId);
        if (conversation) callback(conversation);
      };
      window.addEventListener("finwise:data", handler);
      window.addEventListener("storage", handler);
      return () => {
        window.removeEventListener("finwise:data", handler);
        window.removeEventListener("storage", handler);
      };
    },
    async addMessage(conversation, message) {
      const conversations = readJson("finwise_conversations", []);
      const id = typeof conversation === "string" ? conversation : conversation.id;
      const next = conversations.map((item) => {
        if (item.id !== id) return item;
        return { ...item, messages: [...(item.messages || []), message], updated_date: new Date().toISOString() };
      });
      writeJson("finwise_conversations", next);
      return true;
    },
  },
  integrations: {
    Core: {
      async UploadFile() { return { file_url: "" }; },
    },
  },
};

export default db;
