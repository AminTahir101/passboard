import { getMockStore, STUDENT_ID, ADMIN_ID, type MockStore } from "@/lib/mock-db";

// ── Mock user objects ─────────────────────────────────────────────────────────

function getMockUserId(): string {
  return process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "admin" ? ADMIN_ID : STUDENT_ID;
}

function getMockUser() {
  const id = getMockUserId();
  return {
    id,
    email: id === ADMIN_ID ? "dev-admin@localhost" : "dev-student@localhost",
    role: "authenticated",
    aud: "authenticated",
    created_at: "2024-01-01T00:00:00Z",
    app_metadata: {},
    user_metadata: {},
  };
}

// ── Query builder ─────────────────────────────────────────────────────────────

type Filter =
  | { type: "eq"; col: string; val: unknown }
  | { type: "neq"; col: string; val: unknown }
  | { type: "in"; col: string; val: unknown[] }
  | { type: "not"; col: string; op: string; val: unknown }
  | { type: "is"; col: string; val: unknown };

class MockQueryBuilder {
  private _op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private _cols = "*";
  private _countMode = false;
  private _filters: Filter[] = [];
  private _order: { col: string; ascending: boolean } | null = null;
  private _limitN: number | null = null;
  private _single = false;
  private _mutationData: unknown = null;
  private _returnSelect = false;

  constructor(private _table: string) {}

  // ── Select ──────────────────────────────────────────────────────────────────

  select(cols = "*", opts?: { count?: string; head?: boolean }) {
    if (this._op === "insert") {
      // insert().select() — return the inserted row
      this._returnSelect = true;
      return this;
    }
    this._op = "select";
    this._cols = cols;
    if (opts?.count === "exact") this._countMode = true;
    return this;
  }

  // ── Filters ─────────────────────────────────────────────────────────────────

  eq(col: string, val: unknown) {
    this._filters.push({ type: "eq", col, val });
    return this;
  }

  neq(col: string, val: unknown) {
    this._filters.push({ type: "neq", col, val });
    return this;
  }

  in(col: string, vals: unknown[]) {
    this._filters.push({ type: "in", col, val: vals });
    return this;
  }

  not(col: string, op: string, val: unknown) {
    this._filters.push({ type: "not", col, op, val });
    return this;
  }

  is(col: string, val: unknown) {
    this._filters.push({ type: "is", col, val });
    return this;
  }

  // ── Ordering / paging ───────────────────────────────────────────────────────

  order(col: string, opts?: { ascending?: boolean }) {
    this._order = { col, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(n: number) {
    this._limitN = n;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  // ── Mutations ────────────────────────────────────────────────────────────────

  insert(data: unknown) {
    this._op = "insert";
    this._mutationData = data;
    return this;
  }

  update(data: unknown) {
    this._op = "update";
    this._mutationData = data;
    return this;
  }

  delete() {
    this._op = "delete";
    return this;
  }

  upsert(data: unknown, _opts?: unknown) {
    this._op = "upsert";
    this._mutationData = data;
    return this;
  }

  // ── Thenable ─────────────────────────────────────────────────────────────────

  then(onfulfilled?: (v: unknown) => unknown, onrejected?: (e: unknown) => unknown) {
    return Promise.resolve(this._execute()).then(onfulfilled, onrejected);
  }

  // ── Execution ────────────────────────────────────────────────────────────────

  private _execute(): unknown {
    // Mutations succeed silently (dev mode — no persistence)
    if (this._op !== "select") {
      if (this._op === "insert" && this._returnSelect) {
        const base = Array.isArray(this._mutationData)
          ? (this._mutationData as Record<string, unknown>[]).map((d) => ({
              id: "mock-" + Math.random().toString(36).slice(2, 10),
              created_at: new Date().toISOString(),
              ...d,
            }))
          : {
              id: "mock-" + Math.random().toString(36).slice(2, 10),
              created_at: new Date().toISOString(),
              ...(this._mutationData as Record<string, unknown>),
            };
        if (this._single) {
          return { data: Array.isArray(base) ? base[0] : base, error: null };
        }
        return { data: base, error: null };
      }
      return { data: null, error: null };
    }

    // SELECT
    const store = getMockStore();
    const rows = (store as unknown as Record<string, unknown[]>)[this._table] ?? [];

    let filtered = rows.filter((row) => this._match(row as Record<string, unknown>));

    // Count mode
    if (this._countMode) {
      return { count: filtered.length, error: null };
    }

    // Join syntax: "tablename (col1, col2)"
    if (this._cols.includes("(")) {
      filtered = this._applyJoins(filtered as Record<string, unknown>[], store);
    }

    // Order
    if (this._order) {
      const { col, ascending } = this._order;
      filtered = [...filtered].sort((a, b) => {
        const va = (a as Record<string, unknown>)[col];
        const vb = (b as Record<string, unknown>)[col];
        if (va === vb) return 0;
        const cmp = va! < vb! ? -1 : 1;
        return ascending ? cmp : -cmp;
      });
    }

    // Limit
    if (this._limitN !== null) {
      filtered = filtered.slice(0, this._limitN);
    }

    // Single
    if (this._single) {
      const row = (filtered[0] as Record<string, unknown>) ?? null;
      return {
        data: row,
        error: row ? null : { message: "No rows found", code: "PGRST116" },
      };
    }

    return { data: filtered, error: null };
  }

  private _match(row: Record<string, unknown>): boolean {
    for (const f of this._filters) {
      const v = row[f.col];
      if (f.type === "eq" && v !== f.val) return false;
      if (f.type === "neq" && v === f.val) return false;
      if (f.type === "in" && !(f.val as unknown[]).includes(v)) return false;
      if (f.type === "is") {
        if (f.val === null && v !== null) return false;
        if (f.val !== null && v !== f.val) return false;
      }
      if (f.type === "not" && f.op === "in") {
        // val arrives as "(id1,id2,...)" from the practice questions route
        const ids = String(f.val)
          .replace(/^\(|\)$/g, "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (ids.includes(String(v))) return false;
      }
    }
    return true;
  }

  private _applyJoins(
    rows: Record<string, unknown>[],
    store: MockStore
  ): Record<string, unknown>[] {
    // Match "relatedTable (col1, col2, ...)" patterns
    const joinRegex = /(\w+)\s*\([^)]+\)/g;
    const joinMatches = [...this._cols.matchAll(joinRegex)];
    if (!joinMatches.length) return rows;

    return rows.map((row) => {
      const result = { ...row };
      for (const match of joinMatches) {
        const relTable = match[1]; // e.g. "questions"
        const relRows = (store as unknown as Record<string, unknown[]>)[relTable];
        if (!relRows) continue;
        // Derive FK key: "questions" → "question_id"
        const fkKey = relTable.replace(/s$/, "") + "_id";
        const relRow = relRows.find(
          (r) => (r as Record<string, unknown>).id === row[fkKey]
        );
        result[relTable] = relRow ?? null;
      }
      return result;
    });
  }
}

// ── Auth mock ─────────────────────────────────────────────────────────────────

const mockAuth = {
  getUser: async () => ({ data: { user: getMockUser() }, error: null }),
  getSession: async () => ({
    data: {
      session: {
        access_token: "mock-dev-token",
        refresh_token: "mock-dev-refresh",
        user: getMockUser(),
      },
    },
    error: null,
  }),
  signInWithPassword: async () => ({
    data: { user: getMockUser(), session: null },
    error: null,
  }),
  signOut: async () => ({ error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  admin: {
    createUser: async (opts: { email: string; password?: string }) => ({
      data: {
        user: {
          id: "new-" + Math.random().toString(36).slice(2, 10),
          email: opts.email,
          created_at: new Date().toISOString(),
        },
      },
      error: null,
    }),
    deleteUser: async () => ({ data: {}, error: null }),
  },
};

// ── Public factory ────────────────────────────────────────────────────────────

export function createMockClient() {
  return {
    auth: mockAuth,
    from: (table: string) => new MockQueryBuilder(table),
  };
}
