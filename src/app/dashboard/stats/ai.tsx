"use client";

import { useEffect, useState } from "react";
import Loader from "~/components/ui/loader";
import { api } from "~/trpc/main/react";

export default function DashboardStatsAI() {
  const [result, setResult] = useState("");

  const { data } = api.stat.ai.useQuery();
  useEffect(() => {
    setResult(data?.filter((c) => !!c).join("") ?? "");
  }, [data]);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  return <p className="font-medium h-full whitespace-pre-wrap">{result}</p>;
}
