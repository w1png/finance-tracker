export const subscriptions = [
  {
    name: "start",
    localizedName: "Старт",
    receiptsPerMonth: 15,
    price: 0,
    description:
      "Бесплатный тариф для тех, кто только начинает. Подходит для знакомством с функционалом.",
  },
  {
    name: "basic",
    localizedName: "Базовый",
    receiptsPerMonth: 150,
    price: 490,
    description:
      "Оптимальный выбор для активных пользователей. Больше чеков и свободы для повседневных задач.",
  },
  {
    name: "pro",
    localizedName: "Профи",
    receiptsPerMonth: -1,
    price: 990,
    description:
      "Максимальные возможности для тех, кому нужен полный контроль. Без ограничений.",
  },
] as const;

export type Subscription = (typeof subscriptions)[number];
