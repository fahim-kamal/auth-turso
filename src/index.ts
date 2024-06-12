import type {
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  Adapter,
} from "@auth/core/adapters";

import type { Client } from "@libsql/client";

import { v4 as uuidv4 } from "uuid";

import {
  transformISOToDate,
  transformToObjects,
  transformDateToISO,
} from "./utils.js";

export function TursoAdapter(turso: Client): Adapter {
  return {
    createUser: (user: AdapterUser) => {
      const userArg = transformDateToISO(user, "emailVerified");

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
        .then(([res]) => res);

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
    }) => {
      const args = transformDateToISO({ ...session, id: uuidv4() }, "expires");

      const sessionRes = turso
        .execute({
          sql: `
        INSERT INTO Session (id, expires, sessionToken, userId)
        VALUES (:id, :expires, :sessionToken, :userId)
        RETURNING *
        `,
          args,
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return sessionRes;
    },
    getSessionAndUser: (sessionToken: string) => {
      const sessionAndUser = turso
        .execute({
          sql: `
        SELECT 
          Session.id as s_id, 
          expires, 
          sessionToken,
          userId, 
          name,
          email,
          emailVerified, 
          image
        FROM Session
        INNER JOIN User ON Session.userId = User.id
        WHERE sessionToken = ?
        `,
          args: [sessionToken],
        })
        .then(transformToObjects)
        .then(([res]) => {
          if (res == null) return null;

          const withExpiresDate = transformISOToDate(res, "expires");

          const {
            expires,
            s_id,
            sessionToken,
            userId,
            name,
            email,
            emailVerified,
            image,
          } = withExpiresDate;

          const user = { id: userId, name, email, emailVerified, image };
          const session = { expires, id: s_id, sessionToken, userId };

          return { user, session };
        });

      return sessionAndUser;
    },
    updateSession: (
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ) => {},
    deleteSession: (sessionToken: string) => {},
  };
}
