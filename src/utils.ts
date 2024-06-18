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

  if (result?.[key] == false) {
    transformed[key] = null;
  } else {
    transformed[key] = callback(result[key]);
  }

  return transformed;
}

function transformToObjects(result: ResultSet): any[] {
  const { columns, rows } = result;

  const zipRow = (row: Row) => {
    return zip(columns, row);
  };

  return rows.length != 0 ? rows.map(zipRow) : [null];
}

function transformDateToISO(result: any, key: string) {
  return transformResult(result, key, (val: Date) => val.toISOString());
}

function transformISOToDate(result: any, key: string) {
  return transformResult(result, key, (val: string) => {
    return new Date(val);
  });
}

function generateUpdatePlaceholders(model: any, ignoreKeys: Array<string>) {
  const keys = Object.keys(model);
  const updateString = keys
    .filter(
      (key) =>
        ignoreKeys.findIndex((val) => {
          return val == key;
        }) == -1
    )
    .map((key) => `${key} = :${key}`)
    .join(",\n");

  return updateString;
}

function createPlaceholderString(record: object) {
  const keys = Object.keys(record);

  const columnNames = `(${keys.join(", ")})`;
  const namedValues = keys.map((key) => ":" + key);
  const namedValuesStatement = `(${namedValues.join(", ")})`;

  return columnNames + " VALUES " + namedValuesStatement;
}

export {
  zip,
  transformDateToISO,
  transformToObjects,
  transformISOToDate,
  generateUpdatePlaceholders,
  createPlaceholderString,
};
