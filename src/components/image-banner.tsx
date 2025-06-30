import Image from 'next/image';

interface ImageBannerProps {
  src: string;
  alt: string;
  'data-ai-hint': string;
}

export function ImageBanner({ src, alt, 'data-ai-hint': dataAiHint }: ImageBannerProps) {
  return (
    <section>
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          data-ai-hint={dataAiHint}
        />
      </div>
    </section>
  );
}
