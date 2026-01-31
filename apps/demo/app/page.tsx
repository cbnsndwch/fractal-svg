import FractalPlayground from "@/components/FractalPlayground";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Fractal SVG Playground</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Generate and customize beautiful fractal SVG images
          </p>
        </header>
        <FractalPlayground />
      </div>
    </main>
  );
}
