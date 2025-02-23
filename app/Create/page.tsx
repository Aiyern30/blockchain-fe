import Link from "next/link";
import { ArrowRight, Grid, Package } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="min-h-[calc(100vh-128px)] bg-black text-white p-6 flex items-center justify-center">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Create</h1>
        </div>

        <div className="space-y-4">
          <Link
            href="/Create/Drop"
            className="block p-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Grid className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Drop</h2>
              </div>
              <ArrowRight className="w-5 h-5" />
            </div>
            <p className="mt-2 text-zinc-400 text-sm">
              A drop is the release of a new project. This usually happens on a
              specified date and time. Items will be revealed after they have
              been purchased.
            </p>
          </Link>

          <Link
            href="/Create/Collection"
            className="block p-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Collection or item</h2>
              </div>
              <ArrowRight className="w-5 h-5" />
            </div>
            <p className="mt-2 text-zinc-400 text-sm">
              Create a new NFT collection or add an NFT to an existing one. Your
              items will display immediately. List for sale when you&apos;re
              ready.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
