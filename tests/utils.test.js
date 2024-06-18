import { expect, test } from "vitest";
import { createPlaceholderString } from "../src/utils";

function utilTests() {
  test("placeholder string", () => {
    const session = {
      id: 12321,
      timestamp: new Date().valueOf(),
      sessionToken: "jfksjfkjk",
      userId: "sdjfksfj",
    };

    const sessionPlaceholder = `(id, timestamp, sessionToken, userId) VALUES (:id, :timestamp, :sessionToken, :userId)`;

    expect(createPlaceholderString(session)).toBe(sessionPlaceholder);
  });
}

utilTests();
