import type {
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  Adapter,
  VerificationToken,
} from "@auth/core/adapters";

import type { Client } from "@libsql/client";

import { v4 as uuidv4 } from "uuid";

import {
  transformISOToDate,
  transformToObjects,
  transformDateToISO,
  generateUpdatePlaceholders,
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
      const userByAccount = turso
        .execute({
          sql: `
        SELECT User.id, name, email, emailVerified, image
        FROM Account 
        INNER JOIN User ON Account.userId = User.id
        WHERE provider = ? AND providerAccountId = ? 
        `,
          args: [
            providerAccountId.provider,
            providerAccountId.providerAccountId,
          ],
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return userByAccount;
    },
    updateUser: (user: Partial<AdapterUser> & Pick<AdapterUser, "id">) => {
      const updateString = generateUpdatePlaceholders(user, ["id"]);

      if (user?.emailVerified) {
        user = transformDateToISO(user, "emailVerified");
      }

      const updatedUser = turso
        .execute({
          sql: `
        UPDATE User
        SET ${updateString}
        WHERE id = :id
        RETURNING *
        `,
          args: user,
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return updatedUser;
    },
    linkAccount: (account: AdapterAccount) => {
      const accountArg = { ...account, id: uuidv4() };

      const linkedAccount = turso
        .execute({
          sql: `
        INSERT INTO Account
        (id, userId, type, 
         provider, providerAccountId, 
         refresh_token, access_token, 
         expires_at, token_type, scope,
         id_token, session_state)
        VALUES (:id, :userId, :type, 
         :provider, :providerAccountId, 
         :refresh_token, :access_token, 
         :expires_at, :token_type, :scope,
         :id_token, :session_state)
         RETURNING * 
        `,
          args: accountArg,
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return linkedAccount;
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
    ) => {
      const updateString = generateUpdatePlaceholders(session, [
        "sessionToken",
      ]);

      if (session?.expires) {
        session = transformDateToISO(session, "expires");
      }

      const updatedSession = turso
        .execute({
          sql: `
        UPDATE Session 
        SET ${updateString}
        WHERE sessionToken = :sessionToken
        RETURNING *
        `,
          args: session,
        })
        .then(transformToObjects)
        .then(([res]) => {
          if (res == null) return null;

          return transformISOToDate(res, "expires");
        });

      return updatedSession;
    },
    deleteSession: (sessionToken: string) => {
      const deletedSession = turso
        .execute({
          sql: `
        DELETE FROM Session 
        WHERE sessionToken = ? 
        RETURNING *
        `,
          args: [sessionToken],
        })
        .then(transformToObjects)
        .then((res) => res);

      return deletedSession;
    },
    createVerificationToken: (verificationToken: VerificationToken) => {
      const tokenArg = transformDateToISO(verificationToken, "expires");

      const token = turso
        .execute({
          sql: `
        INSERT INTO VerificationToken
        (identifier, token, expires)
        VALUES (?, ?, ?)
        `,
          args: [tokenArg.identifier, tokenArg.token, tokenArg.expires],
        })
        .then(transformToObjects)
        .then((res) => res);

      return token;
    },
    useVerificationToken: (params: { identifier: string; token: string }) => {
      const usedToken = turso
        .execute({
          sql: `
        DELETE FROM VerificationToken
        WHERE identifier = ? AND token = ? 
        RETURNING *
        `,
          args: [params.identifier, params.token],
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return usedToken;
    },
    unlinkAccount: (
      providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">
    ) => {
      const unlinkedAccount = turso
        .execute({
          sql: `
        DELETE FROM Account
        WHERE provider = ? AND providerAccountId = ?
        RETURNING *
        `,
          args: [
            providerAccountId.provider,
            providerAccountId.providerAccountId,
          ],
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return unlinkedAccount;
    },
    deleteUser: (userId: string) => {
      const deletedUser = turso
        .execute({
          sql: `
        DELETE FROM User
        WHERE id = ?
        RETURNING *
        `,
          args: [userId],
        })
        .then(transformToObjects)
        .then(([res]) => res);

      return deletedUser;
    },
  };
}
