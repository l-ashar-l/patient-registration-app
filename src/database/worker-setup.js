import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { worker } from "@electric-sql/pglite/worker";
import { vector } from "@electric-sql/pglite/vector";

worker({
  async init() {
    return new PGlite("idb://patient-db", {
      extensions: { live, vector },
    });
  },
});
