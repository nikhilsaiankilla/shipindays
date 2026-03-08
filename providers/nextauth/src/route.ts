import { handlers } from "./auth.config";

export const GET: (request: Request) => Promise<Response> = (request) =>
  handlers.GET(request);

export const POST: (request: Request) => Promise<Response> = (request) =>
  handlers.POST(request);
