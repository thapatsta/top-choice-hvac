import Image from "next/image";
import { Flame, Snowflake } from "lucide-react";

interface HeroVisualProps {
  heroImage?: { src: string; alt: string };
}

export function HeroVisual({ heroImage }: HeroVisualProps) {
  if (heroImage) {
    return (
      <div className="relative mx-auto hidden h-64 w-full overflow-hidden rounded-2xl md:block md:h-80 lg:h-full lg:min-h-[22rem]">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          preload
          className="rounded-2xl object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto hidden h-64 w-64 items-center justify-center sm:h-80 sm:w-80 md:flex">
      <div className="absolute inset-0 rounded-full bg-white/5" />
      <div className="absolute inset-6 rounded-full border border-white/15" />
      <div className="absolute inset-14 rounded-full bg-ember/15" />
      <Flame
        size={72}
        className="absolute left-[22%] top-[24%] -translate-x-1/2 -translate-y-1/2 text-ember"
        aria-hidden="true"
      />
      <Snowflake
        size={72}
        className="absolute right-[20%] bottom-[22%] translate-x-1/2 translate-y-1/2 text-white/70"
        aria-hidden="true"
      />
    </div>
  );
}
