import type { ModuleManifest } from "../../app/registry";

export const manifest: ModuleManifest = {
  code: "leave_management",
  basePath: "/leave",
  load: () => import("./routes"),
  indexPermission: "leave_management.leave_request.view_self",
};