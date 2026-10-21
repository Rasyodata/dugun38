import { getCurrentUser } from "@/lib/auth";
import { DemoSwitcherClient } from "./DemoSwitcherClient";

// Yalnız ALLOW_DEMO_LOGIN=1 iken görünür; sunum sırasında roller arası hızlı geçiş.
export async function DemoSwitcher() {
  if (process.env.ALLOW_DEMO_LOGIN !== "1") return null;
  const user = await getCurrentUser();
  return <DemoSwitcherClient role={user?.role ?? null} name={user?.name ?? null} />;
}
