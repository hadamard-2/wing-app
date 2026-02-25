import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ChatLayoutShell } from "@/components/chat-layout-shell";

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ChatLayoutShell
      currentUser={{
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      }}
    >
      {children}
    </ChatLayoutShell>
  );
}
