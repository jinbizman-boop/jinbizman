declare module "*.css";
declare module "@cloudflare/vite-plugin" { import type { PluginOption } from "vite"; export function cloudflare(): PluginOption; }
