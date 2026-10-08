import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { name } from "./index.js";

describe("@le/db", () => {
  it("exports its name", () => {
    expect(name).toBe("@le/db");
  });

  it("better-sqlite3 loads and supports basic SQL", () => {
    const db = new Database(":memory:");
    db.exec("CREATE TABLE t (id INTEGER PRIMARY KEY, v TEXT)");
    db.prepare("INSERT INTO t (v) VALUES (?)").run("hello");
    const row = db.prepare("SELECT v FROM t WHERE id = 1").get() as { v: string };
    expect(row.v).toBe("hello");
    db.close();
  });

  it("FTS5 is available", () => {
    const db = new Database(":memory:");
    db.exec("CREATE VIRTUAL TABLE f USING fts5(x)");
    db.prepare("INSERT INTO f (x) VALUES (?)").run("lightning blast");
    const rows = db.prepare("SELECT x FROM f WHERE f MATCH 'lightning'").all();
    expect(rows).toHaveLength(1);
    db.close();
  });
});
