import { faker } from "@faker-js/faker";
import { Receipt } from "~/lib/shared/types/receipt";
import { db } from "~/server/db";
import { expenses, expenseTypeEnum, receipts } from "~/server/db/schema";

const createdById = "f5d74fd2-cc12-40b7-a80b-e5a15160d028";
const fileId = "c224f49e-b606-4b29-823a-aa2761851ac4";

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function generateReceipts(count: number) {
  const rec: Receipt[] = [];
  for (let i = 0; i < count; i++) {
    const receiptId = faker.string.uuid();
    const createdAt = faker.date.past({
      years: 3,
    });
    rec.push({
      id: receiptId,
      createdAt,
      createdById,
      fileId,
      isSaved: true,
      deletedAt: null,
      expenses: Array.from({ length: randomInRange(2, 8) }).map((_) => ({
        id: faker.string.uuid(),
        createdById,
        createdAt,
        receiptId,
        price: randomInRange(5000, 100000),
        type: expenseTypeEnum.enumValues[
          randomInRange(0, expenseTypeEnum.enumValues.length - 1)
        ]!,
        title: faker.internet.displayName(),
        quantity: randomInRange(1, 10),
      })),
    });
  }

  await db.insert(receipts).values(rec);
  await db.insert(expenses).values(rec.flatMap((r) => r.expenses));
}

generateReceipts(200).then(() => process.exit(0));
