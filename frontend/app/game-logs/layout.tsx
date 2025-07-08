export default function GameLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col gap-4 max-w-5xl p-4">
      {children}
    </div>
  );
} 