import { HeartHandshake, Hourglass } from "lucide-react";
import { ReactNode } from "react";
import AdvantagesImage from "~/components/icons/advantages";
import HeroDashboard from "../../../public/hero_dashboard.svg";
import Pig from "../../../public/pig.svg";
import Coffee from "../../../public/coffee.svg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn } from "~/lib/client/utils";
import FeedbackForm from "./feedback";
import FeedbackImage from "~/components/icons/feedback";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingClientPage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Advantages />
      <FAQ />
      <Feedback />
    </main>
  );
}

function Hero() {
  return (
    <section className="container min-h-screen mt-16 py-20 flex flex-col justify-center items-center gap-16 relative">
      <div className="space-y-6 w-fit text-center">
        <h1 className="font-extrabold text-4xl md:text-5xl max-w-[24ch] mx-auto">
          Покупки видны – финансы под контролем.
        </h1>
        <div>
          <Link className="w-full lg:w-fit" href="/auth/signin">
            <Button className="w-full lg:w-fit">Начать сейчас</Button>
          </Link>
        </div>
        <p className="text-muted-foreground max-w-[75ch] mx-auto">
          Наша платформа использует искусственный интеллект для автоматического
          считывания данных с чеков, помогая легко отслеживать и организовывать
          ваши покупки по категориям.
        </p>
      </div>
      <Image src={HeroDashboard} className="max-w-full" alt="hero_dashboard" />
      <Image
        src={Pig}
        className="hidden left-0 top-32 lg:absolute"
        alt="hero_dashboard"
      />
      <Image
        src={Coffee}
        className="hidden right-0 top-16 lg:absolute"
        alt="hero_dashboard"
      />
    </section>
  );
}

function Advantages() {
  return (
    <section
      className="flex flex-col py-20 gap-16 container items-center justify-center"
      id="advantages"
    >
      <h2 className="text-2xl md:text-4xl lg:text-5xl max-w-[20ch] text-center mx-auto font-extrabold">
        <span className="text-primary">Преимущества</span> нашей платформы
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdvantagesImage className="max-w-full h-fit" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdvantagesCard className="md:col-span-2 space-y-8 h-fit">
            <h4 className="text-2xl font-bold">Твои возможности с нами</h4>
            <div className="grid md:grid-cols-10 gap-4 md:gap-2">
              <div className="md:pl-2 space-y-3 md:space-y-9 md:border-l md:col-span-5">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Полный учет расходов</p>
                  <p className="text-2xl font-medium">61%</p>
                </div>
                <div className="w-full h-8 bg-primary rounded-md"></div>
              </div>
              <div className="md:pl-2 space-y-3 md:space-y-9 md:border-l md:col-span-2">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Экономия</p>
                  <p className="text-2xl font-medium">17%</p>
                </div>
                <div className="w-full h-8 bg-primary/30 rounded-md"></div>
              </div>
              <div className="md:pl-2 space-y-3 md:space-y-9 md:border-l md:col-span-3">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Снижение</p>
                  <p className="text-2xl font-medium">22%</p>
                </div>
                <div className="w-full h-8 bg-primary/5 rounded-md"></div>
              </div>
            </div>
          </AdvantagesCard>
          <AdvantagesCard className="hidden md:block">
            <Hourglass className="text-primary" />
            <div className="space-y-2">
              <h4 className="text-2xl font-bold">Экономия времени</h4>
              <p className="text-muted-foreground">
                Автоматическое распознавание чеков сокращает время на ручной
                ввод данных. Просто сделай фото, и все.
              </p>
            </div>
          </AdvantagesCard>
          <AdvantagesCard className="hidden md:block">
            <HeartHandshake className="text-primary" />
            <div className="space-y-2">
              <h4 className="text-2xl font-bold">Мгновенная помощь</h4>
              <p className="text-muted-foreground">
                Ваша финансовая информация всегда под рукой, с точной аналитикой
                и удобной структурой.
              </p>
            </div>
          </AdvantagesCard>
        </div>
      </div>
    </section>
  );
}

interface FAQQuestion {
  question: string;
  answer: string;
}

const faqQuestions: FAQQuestion[] = [
  {
    question: "Безопасны ли мои данные?",
    answer:
      "Да, все данные хранятся в зашифрованном виде на сервере. Это позволяет нам быть уверены, что все данные не будут потеряны в случае аварийного образования или потери доступа к серверу.",
  },
  {
    question: "Как работает приложение?",
    answer:
      "Наше приложение использует искусственный интеллект для распознавания текста с чеков. Просто сделайте фото, и система автоматически сохранит товары и их стоимость в нужные категории.",
  },
  {
    question: "Как долго хранится информация?",
    answer: "Информация хранится бесконечно.",
  },
  {
    question: "Есть ли бесплатный тариф?",
    answer: "Да, наше приложение полностью бесплатно.",
  },
  {
    question: "Как настроить категории расходов?",
    answer:
      "Категории расходов заполняются администрацией сайта, вы не можете их изменять.",
  },
];

function FAQ() {
  return (
    <section
      className="flex flex-col py-20 gap-16 container items-center justify-center"
      id="faq"
    >
      <div className="relative flex md:w-fit w-full">
        <svg
          className="absolute lg:right-full top-6 left-0 h-16 lg:h-auto"
          width="112"
          height="124"
          viewBox="0 0 112 124"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_52_2831)">
            <path
              d="M33.7506 102.878C33.1661 102.663 32.9229 102.685 32.7146 102.558C20.8701 91.0671 14.2704 77.1395 14.4101 60.4863C14.435 56.281 15.5483 52.1694 17.5471 48.343C21.7601 40.1044 30.4596 35.7681 39.5366 37.3197C44.272 38.1015 48.6643 39.6777 52.1325 43.1845C51.9258 45.4407 51.6438 47.6795 51.6226 49.8198C51.6048 53.3117 52.7053 56.4277 55.4053 58.8027C57.3651 60.6085 59.6225 61.1327 61.1066 60.206C63.0544 58.9898 63.5446 56.8788 62.969 54.9177C62.1748 52.1907 61.0445 49.5446 59.804 47.0318C58.9904 45.4126 57.7481 43.9323 56.6562 42.487C59.9137 34.2649 68.8055 32.5158 77.6144 38.2958C77.6352 39.5719 77.6386 40.9234 77.7348 42.217C78.2068 47.0145 80.2032 51.0536 84.3504 53.6852C85.9411 54.6902 87.7697 55.3532 89.6423 54.1195C91.0511 53.1754 91.5413 51.0644 90.8275 48.6739C89.6414 44.9024 87.2494 41.8839 84.5617 39.1145C83.5905 38.1738 82.6194 37.2332 81.6307 36.368C86.1993 23.5242 100.184 16.9191 110.547 24.8873C110.699 23.8898 110.967 23.078 110.771 22.5557C110.517 21.9406 109.76 21.4469 109.117 21.1388C103.001 18.4473 96.8817 17.8208 90.9052 21.3593C86.4128 23.971 82.9492 27.6163 80.1734 32.0568C79.7901 32.6829 79.4068 33.309 78.9482 33.9176C78.9307 33.993 78.7627 34.0335 78.4092 34.1897C77.7495 33.9571 76.9218 33.7649 76.1291 33.4219C66.4135 29.4973 60.5159 30.9882 53.6623 39.3286C52.8293 38.8174 51.8459 38.2712 50.9552 37.6671C45.6163 34.3615 39.8573 32.8652 33.5328 33.4625C23.2411 34.4097 15.1625 41.1945 12.0694 51.4411C10.3802 57.008 10.0979 62.6632 10.9042 68.4123C12.9119 82.3065 18.7103 94.2206 29.3773 103.61C29.8918 104.127 30.499 104.586 31.0134 105.102C31.0712 105.195 31.1114 105.364 31.2321 105.868C28.5336 105.877 26.1782 105.092 23.8053 104.382C21.4902 103.765 19.1348 102.98 16.6114 102.235C16.3819 104.247 17.2603 105.246 18.4345 105.995C19.8344 106.797 21.1993 107.75 22.6868 108.175C26.7151 109.269 30.8362 110.305 35.0274 111.04C38.3155 111.565 39.6212 110.041 38.8042 107.071C37.0145 100.775 35.1496 94.4625 33.2847 88.1497C32.968 87.1227 32.4658 86.2115 31.8832 84.9639C30.0684 86.2905 30.3902 87.6365 30.6544 88.8896C31.816 93.45 32.7518 97.9579 33.7506 102.878ZM87.9101 51.3336C82.8756 49.4494 80.4102 45.3809 81.2699 40.6543C84.2061 43.7197 87.0443 46.5241 87.9101 51.3336ZM59.7629 57.1131C55.5684 55.0267 54.1617 51.5218 55.6811 47.0278C57.9803 50.1043 59.9382 52.9426 59.7629 57.1131Z"
              fill="#047857"
            />
          </g>
          <defs>
            <clipPath id="clip0_52_2831">
              <rect
                width="90"
                height="105"
                fill="white"
                transform="matrix(-0.974082 -0.226193 -0.226193 0.974082 111.418 21.1357)"
              />
            </clipPath>
          </defs>
        </svg>

        <h2 className="text-2xl md:text-4xl lg:text-5xl max-w-[20ch] text-center mx-auto font-extrabold">
          Часто задаваемые вопросы
        </h2>
      </div>
      <Accordion type="single" className="w-full space-y-4">
        {faqQuestions.map((question) => (
          <AccordionItem
            className="bg-background"
            key={question.question}
            value={question.question}
          >
            <AccordionTrigger>{question.question}</AccordionTrigger>
            <AccordionContent>{question.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function Feedback() {
  return (
    <section
      className="flex flex-col py-20 gap-16 container items-center justify-center"
      id="feedback"
    >
      <div className="rounded-3xl w-full px-4 py-6 lg:p-12 bg-primary text-primary-foreground grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-6 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl lg:text-5xl max-w-[20ch] font-extrabold">
            Остались вопросы?
            <br />
            Напишите нам!
          </h2>
          <p className="text-white/60">
            Мы всегда рядом, чтобы помочь вам сделать управление финансами ещё
            проще. Оставьте свой вопрос или пожелание, и мы свяжемся с вами в
            ближайшее время. Мы ценим ваше мнение и работаем для вас!
          </p>
          <FeedbackForm />
        </div>
        <FeedbackImage className="max-w-full mx-auto my-auto h-fit" />
      </div>
    </section>
  );
}

function AdvantagesCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-background rounded-2xl space-y-4 p-6 border",
        className,
      )}
    >
      {children}
    </div>
  );
}
