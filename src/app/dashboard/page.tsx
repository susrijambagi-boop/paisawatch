import { redirect } from "next/navigation";

// The dashboard is now the landing page at "/". Keep this path working for old
// links and bookmarks by redirecting.
export default function DashboardRedirect() {
  redirect("/");
}
