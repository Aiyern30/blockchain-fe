import { FloatingIcon } from "@/components/FloatingIcon";
import Navbar from "@/components/Navbar";
import { RoboAnimation } from "@/components/RoboAnimation";
import { SparklesCore } from "@/components/Sparkles";
export default function Home() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <div className="h-full w-full absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>
      <div className="absolute bottom-0 right-0 w-96 h-96">
        <RoboAnimation />
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <FloatingIcon count={6} />
      </div>
    </main>
  );
}
