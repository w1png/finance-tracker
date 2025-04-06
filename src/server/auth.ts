import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import type { Adapter } from "next-auth/adapters";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import YandexProvider from "next-auth/providers/yandex";

import { eq } from "drizzle-orm";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";
import { isBefore } from "date-fns";
import { Subscription, subscriptions } from "~/lib/shared/types/subscriptions";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: NonNullable<Awaited<ReturnType<typeof GetDBUser>>> &
      DefaultSession["user"];
  }
}

const GetDBUser = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      id: true,
      email: true,
      role: true,
      currentSubscription: true,
      subscriptionEndsAt: true,
      receiptsLeft: true,
    },
  });

  if (!user) return undefined;

  const currentSubscription: Subscription = isBefore(
    user.subscriptionEndsAt,
    new Date(),
  )
    ? subscriptions[0]
    : subscriptions.find((s) => s.name === user.currentSubscription)!;

  // if user has more receipts than allowed by their subscription then set the max as currentSubscription.receiptsPerMonth
  const newReceiptsLeft = Math.min(
    user.receiptsLeft,
    currentSubscription.receiptsPerMonth,
  );

  if (newReceiptsLeft !== user.receiptsLeft) {
    await db
      .update(users)
      .set({ receiptsLeft: newReceiptsLeft })
      .where(eq(users.id, user.id));
  }

  return {
    ...user,
    currentSubscription,
    receiptsLeft: newReceiptsLeft,
  };
};

export const authOptions: NextAuthOptions = {
  callbacks: {
    redirect({ baseUrl }) {
      return baseUrl;
    },
    session: async ({ session, user }) => {
      const dbUser = await GetDBUser(user.id);

      if (user.email === env.MAIN_ADMIN_EMAIL && dbUser?.role !== "ADMIN") {
        await db
          .update(users)
          .set({
            role: "ADMIN",
          })
          .where(eq(users.id, user.id));
      }

      return {
        ...session,
        user: dbUser,
      };
    },
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    YandexProvider({
      clientId: env.YANDEX_CLIENT_ID,
      clientSecret: env.YANDEX_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
      },
      from: env.EMAIL_USER,
      maxAge: 10 * 60,
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
