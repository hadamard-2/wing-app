import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Chat } from "@/components/chat";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Chat
      currentUser={{
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      }}
    />
  );
}
