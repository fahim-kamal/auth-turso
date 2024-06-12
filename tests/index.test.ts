import { AdapterUser } from "@auth/core/adapters";
import { TursoAdapter } from "../src/index.js";
import { runBasicTests, TestOptions } from "./testSuite.js";
import { createClient } from "@libsql/client";

import { transformToObjects, transformISOToDate } from "../src/utils.js";

const tursoClient = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL as string,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN,
});

const adapter = TursoAdapter(tursoClient);

const tests = [
  "createUser",
  "getUser",
  "getUserByEmail",
  "createSession",
  "getSessionAndUser",
  "updateUser",
  "updateSession",
  "linkAccount",
  "getUserByAccount",
  "deleteSession",
  "Verification Token methods exist",
  "createVerificationToken",
  "useVerificationToken",
  "Future methods exist",
  "unlinkAccount",
];

const options: TestOptions = {
  adapter,
  db: {
    session: (sessionToken: string) => {
      const session = tursoClient
        .execute({
          sql: `
        SELECT * FROM Session
        WHERE sessionToken = ? 
        LIMIT 1
        `,
          args: [sessionToken],
        })
        .then(transformToObjects)
        .then(([res]) => {
          if (res == null) return null;

          return transformISOToDate(res, "expires");
        });

      return session;
    },
    user: (id: string) => {
      const userRes = tursoClient
        .execute({
          sql: "SELECT * FROM User WHERE id = ?",
          args: [id],
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return userRes;
    },
    account: (providerAccountId: {
      provider: string;
      providerAccountId: string;
    }) => {
      const accountRes = tursoClient
        .execute({
          sql: `
        SELECT * 
        FROM Account 
        WHERE provider = ? AND providerAccountId = ? 
        LIMIT 1
        `,
          args: [
            providerAccountId.provider,
            providerAccountId.providerAccountId,
          ],
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return accountRes;
    },
    verificationToken: (params: { identifier: string; token: string }) => {
      return;
    },
  },
  testWebAuthnMethods: false,
};

runBasicTests(options);
