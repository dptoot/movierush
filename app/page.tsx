import GameBoard from '@/components/GameBoard';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="mx-auto max-w-4xl px-4 py-8">
        <GameBoard />
      </main>
    </div>
  );
}
