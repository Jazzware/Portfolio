import { onRequestPost as __api_contacto_ts_onRequestPost } from "/home/claude/portafolio/functions/api/contacto.ts"

export const routes = [
    {
      routePath: "/api/contacto",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contacto_ts_onRequestPost],
    },
  ]