export function CreditsBadge({ balance }: { balance: number }) {
  return (
    <span className="chip">
      <span className="h-1.5 w-1.5 rounded-full bg-[#7cc4ff]" />
      {balance} credits
    </span>
  );
}
