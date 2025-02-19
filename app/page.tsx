import { FloatingIcon } from "@/components/FloatingIcon";
import { RoboAnimation } from "@/components/RoboAnimation";

export default function Home() {
  return (
    <>
      <div>
        <div className="absolute bottom-0 right-0 w-96 h-96">
          <RoboAnimation />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <FloatingIcon count={6} />
        </div>
      </div>
    </>
  );
}
