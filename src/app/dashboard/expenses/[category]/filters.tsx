"use client";

import { useQueryStates } from "nuqs";
import { Button } from "~/components/ui/button";
import { createdAtParser, lastDaysParser, priceParser } from "./searchParams";
import { ArrowDown, FilterX } from "lucide-react";
import { cn } from "~/lib/client/utils";

function FilterButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        "bg-background rounded-3xl py-3 px-3.5 gap-1",
        isActive && "border-primary",
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export default function Filters() {
  const [query, setQuery] = useQueryStates(
    {
      ...lastDaysParser,
      ...createdAtParser,
      ...priceParser,
    },
    {
      shallow: false,
    },
  );

  return (
    <div className="flex gap-2 max-w-full overflow-x-scroll">
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <FilterButton
          onClick={() =>
            setQuery({
              ...query,
              lastDays: 7,
            })
          }
          isActive={query.lastDays === 7}
        >
          За 7 дней
        </FilterButton>
        <FilterButton
          onClick={() =>
            setQuery({
              ...query,
              lastDays: 30,
            })
          }
          isActive={query.lastDays === 30}
        >
          За 30 дней
        </FilterButton>
        <FilterButton
          isActive={false}
          onClick={() => {
            setQuery({
              ...query,
              createdAtOrder: query.createdAtOrder === "asc" ? "desc" : "asc",
            });
          }}
        >
          <span>По дате</span>
          <ArrowDown
            className={cn(
              "size-4 transition",
              query.createdAtOrder === "asc" && "rotate-180",
            )}
          />
        </FilterButton>
      </div>
      <Button
        variant="ghost"
        onClick={() =>
          setQuery({
            priceOrder: null,
            createdAtOrder: null,
            lastDays: 30,
          })
        }
        className="aspect-square"
        size="icon"
      >
        <FilterX />
      </Button>
    </div>
  );
}
