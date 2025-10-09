export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">MatchIT</h1>
        <p className="text-[#9CA3AF]">MVP — Swipe + Chat em tempo real (em construção)</p>
        <a
          href="/auth"
          className="inline-block px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] transition"
        >
          Entrar / Cadastrar
        </a>
      </div>
    </main>
  );
}
