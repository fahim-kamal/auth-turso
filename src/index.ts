import type {
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  Adapter,
} from "@auth/core/adapters";

import type { Client, InValue } from "@libsql/client";

import {
  transformISOToDate,
  transformToObjects,
  transformVerifiedToISO,
} from "./utils.js";

export function TursoAdapter(turso: Client): Adapter {
  return {
    createUser: (user: AdapterUser) => {
      const userArg = transformVerifiedToISO(user);

      const userRes = turso
        .execute({
          sql: `
        INSERT INTO User (id, name, email, emailVerified, image)
        VALUES (:id, :name, :email, :emailVerified, :image)
        RETURNING *
        `,
          args: userArg,
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return userRes;
    },
    getUser: (id: string) => {
      const user = turso
        .execute({
          sql: `
        SELECT * FROM User 
        WHERE id = ? 
        LIMIT 1
        `,
          args: [id],
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return user;
    },
    getUserByEmail: (email: string) => {
      const user = turso
        .execute({
          sql: `
        SELECT * FROM User
        WHERE email = ? 
        LIMIT 1
        `,
          args: [email],
        })
        .then(transformToObjects)
        .then(([res]) => (res !== null ? transformISOToDate(res) : null));

      return user;
    },
    getUserByAccount: (
      providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">
    ) => {
      return;
    },
    updateUser: (user: Partial<AdapterUser> & Pick<AdapterUser, "id">) => {
      return;
    },
    linkAccount: (account: AdapterAccount) => {
      return;
    },
    createSession: (session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }) => {},
    getSessionAndUser: (sessionToken: string) => {},
    updateSession: (
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ) => {},
    deleteSession: (sessionToken: string) => {},
  };
}
