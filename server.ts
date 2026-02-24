import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import next from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer((req, res) => handle(req, res));
const io = new SocketIOServer(httpServer);

io.use(async (socket, next) => {
  const cookie = socket.handshake.headers.cookie;
  if (!cookie) return next(new Error("Authentication required"));

  const session = await auth.api.getSession({
    headers: new Headers({ cookie }),
  });

  if (!session?.user) return next(new Error("Invalid session"));

  socket.data = { userId: session.user.id, userName: session.user.name };
  next();
});

io.on("connection", (socket) => {
  const { userId } = socket.data;
  socket.join(userId);

  socket.on("private_message", async ({ conversationId, content }) => {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { userId_conversationId: { userId, conversationId } },
    });
    if (!participant) return;

    const message = await prisma.message.create({
      data: { content, senderId: userId, conversationId },
    });

    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
    });

    const payload = {
      id: message.id,
      content: message.content,
      senderId: userId,
      conversationId,
      createdAt: message.createdAt.toISOString(),
    };

    for (const p of participants) {
      io.to(p.userId).emit("private_message", payload);
    }
  });
});

const port = parseInt(process.env.PORT || "3000", 10);
httpServer.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);
});
