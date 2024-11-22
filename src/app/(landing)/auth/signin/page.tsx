"use client";

import GoogleLogo from "../../../../../public/google.svg";
import YandexLogo from "../../../../../public/yandex.svg";
import GithubLogo from "../../../../../public/github.svg";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { OnError } from "~/lib/client/on_error";
import Image from "next/image";
import { Separator } from "~/components/ui/separator";

export default function SignInPage() {
  const loginSchema = z.object({
    email: z
      .string({
        message: "Email обязателен для ввода",
      })
      .email({
        message: "Неверный формат Email",
      }),
  });

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {} as z.infer<typeof loginSchema>,
  });

  async function OnSubmit<P extends "email" | "google" | "github" | "yandex">({
    provider,
    data,
  }: {
    provider: P;
    data: P extends "email" ? z.infer<typeof loginSchema> : undefined;
  }) {
    try {
      const res = await signIn(provider, {
        redirect: false,
        ...data,
      });
      if (res?.error) {
        throw new Error(res.error);
      }

      router.push("/");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <div className="h-screen container flex items-center justify-center bg-background">
      <div className="rounded-xl shadow-xl border-2 border-input p-6 space-y-6 flex flex-col">
        <h1 className="text-2xl font-medium">Вход</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              OnSubmit({ provider: "email", data });
            }, OnError)}
            className="space-y-2"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Войти через Email
            </Button>
          </form>
        </Form>

        <div className="grid grid-cols-3 gap-2 items-center justify-center">
          <Separator />
          <p className="mx-auto my-auto text-center text-muted-foreground">
            Или
          </p>
          <Separator />
        </div>

        <div className="space-y-2 flex flex-col">
          <Button
            variant="outline"
            className="min-w-[300px] gap-2"
            onClick={() => OnSubmit({ provider: "google", data: undefined })}
          >
            <Image src={GoogleLogo} alt="google" className="size-6" />
            <span>Войти через Google</span>
          </Button>
          <Button
            variant="outline"
            className="min-w-[300px] gap-2"
            onClick={() => OnSubmit({ provider: "github", data: undefined })}
          >
            <Image src={GithubLogo} alt="github" className="size-6" />

            <span>Войти через Github</span>
          </Button>
          <Button
            variant="outline"
            className="min-w-[300px] gap-2"
            onClick={() => OnSubmit({ provider: "yandex", data: undefined })}
          >
            <Image src={YandexLogo} alt="yandex" className="size-6" />
            <span>Войти через Yandex</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
