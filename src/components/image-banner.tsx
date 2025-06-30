import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ImageBannerProps {
  src: string;
  alt: string;
  'data-ai-hint': string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function ImageBanner({ src, alt, 'data-ai-hint': dataAiHint, title, description, buttonText, buttonLink }: ImageBannerProps) {
  const hasOverlayContent = title || description || buttonText;

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
        {hasOverlayContent && (
          <>
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white p-8">
              <div className="max-w-2xl">
                {title && <h2 className="text-5xl md:text-6xl font-headline font-bold mb-4 drop-shadow-md">{title}</h2>}
                {description && <p className="text-lg md:text-xl mb-8 drop-shadow">{description}</p>}
                {buttonText && buttonLink && (
                  <Button asChild size="lg">
                    <Link href={buttonLink}>{buttonText}</Link>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
