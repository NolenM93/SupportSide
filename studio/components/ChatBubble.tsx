export function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 text-[15px] leading-snug ${
          isUser ? "bubble-user" : "bubble-ai"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
