import { AdapterUser } from "@auth/core/adapters";
import { TursoAdapter } from "../src/index.js";
import { runBasicTests, TestOptions } from "./testSuite.js";
import { createClient } from "@libsql/client";

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
      return;
    },
    user: async (id: string) => {
      const res = await tursoClient
        .execute({
          sql: "SELECT * FROM User WHERE id = ? ",
          args: [id],
        })
        .then((val) => {
          const [userRes] = val.rows as any;

          if (userRes?.emailVerified !== null) {
            userRes.emailVerified = new Date(
              userRes["emailVerified"] as string
            );
          }

          return userRes;
        });

      return res;
    },
    account: (providerAccountId: {
      provider: string;
      providerAccountId: string;
    }) => {
      return;
    },
    verificationToken: (params: { identifier: string; token: string }) => {
      return;
    },
  },
  testWebAuthnMethods: false,
};

runBasicTests(options);
