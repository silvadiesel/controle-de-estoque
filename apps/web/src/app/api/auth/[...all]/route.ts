import { auth } from "@silva-diesel-controle-estoque/auth";

import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
