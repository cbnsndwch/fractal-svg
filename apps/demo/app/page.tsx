import FractalPlayground from '@/components/FractalPlayground';

export default function Home() {
    return (
        <main className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-md">
                        Fractal SVG Playground
                    </h1>
                    <p className="text-lg text-white/90 drop-shadow-sm">
                        Generate and customize beautiful fractal SVG images
                    </p>
                </header>
                <FractalPlayground />
            </div>
        </main>
    );
}
