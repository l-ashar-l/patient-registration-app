import { PGliteWorker } from "@electric-sql/pglite/worker";

const pgWorker = new Worker(new URL("./worker-setup.js", import.meta.url), {
  type: "module",
  name: "pglite-worker",
});

export const db = new PGliteWorker(pgWorker);
