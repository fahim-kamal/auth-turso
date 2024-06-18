# Auth.js Adapter for Turso Libsql Client

### This adapter implements the methods needed by Auth.js in order to interface with a Turso database.

### Setup

Copy the src files into your project.

- index.ts
- utils.ts
- schema.sql

<br>

The only additional required module is uuid.

```
$ npm install uuid
```

<br>

After copying files, you should update your Turso database to include the tables needed by Auth.js. This can be done by running the schema.sql file in the Turso CLI.

```shell
$ turso db shell <your-database>
→ .read path/to/schema.sql
```

<br>

After adding the tables to your database, instantiate a turso client (with appropriate environment variables) for use by the next-auth route handler.

```js
import NextAuth from "next-auth";
import { createClient } from "@libsql/client";
import { TursoAdapter } from "@/lib/turso/index.ts";

const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
  adapter: TursoAdapter(tursoClient),
});
```

### Tests

This adapter passes all the required tests in the Auth.js test suite.
