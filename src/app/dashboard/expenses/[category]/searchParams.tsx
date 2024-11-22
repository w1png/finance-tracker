import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

export const lastDaysParser = {
  lastDays: parseAsInteger.withDefault(30),
};

export const createdAtParser = {
  createdAtOrder: parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
};

export const priceParser = {
  priceOrder: parseAsStringEnum(["asc", "desc"]),
};

export const infoIdParser = {
  info: parseAsString,
};
