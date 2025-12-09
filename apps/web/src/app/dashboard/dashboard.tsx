"use client";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import type { AppRouter } from "@silva-diesel-controle-estoque/api/routers/index";
import type { inferProcedureOutput } from "@trpc/server";

type PrivateDataOutput = inferProcedureOutput<AppRouter["privateData"]>;

export default function Dashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const privateData = useQuery(trpc.privateData.queryOptions()) as {
    data?: PrivateDataOutput;
    isLoading: boolean;
    error: unknown;
  };

  return (
    <>
      <p>API: {privateData.data?.message}</p>
    </>
  );
}
