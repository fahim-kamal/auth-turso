import { InValue, ResultSet, Row } from "@libsql/client";

function zip(arr1: string[], arr2: Row): Record<string, InValue> {
  const res = {};

  arr1.forEach((key, index) => {
    res[key] = arr2[index];
  });

  return res;
}

function transformResult(result: any, key: string, callback: Function): any {
  const transformed = result;

  if (!result?.[key]) {
    transformed[key] = callback(transformed[key]);
  } else transformed[key] = null;
  return transformed;
}

function transformToObjects(result: ResultSet): any[] {
  const { columns, rows } = result;

  const zipRow = (row: Row) => {
    return zip(columns, row);
  };

  return rows.length ? rows.map(zipRow) : [null];
}

function transformVerifiedToISO(result: any) {
  return transformResult(result, "emailVerified", (val: Date) =>
    val.toISOString()
  );
}

function transformISOToDate(result: any) {
  return transformResult(result, "emailVerified", (val: string | null) => {
    if (val !== null) {
      return new Date(val);
    } else return null;
  });
}

export { zip, transformVerifiedToISO, transformToObjects, transformISOToDate };
