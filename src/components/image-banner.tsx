import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageBannerProps {
  src: string;
  alt: string;
  'data-ai-hint': string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  layout?: 'center' | 'left';
}

export function ImageBanner({ 
  src, 
  alt, 
  'data-ai-hint': dataAiHint, 
  title, 
  description, 
  buttonText, 
  buttonLink, 
  layout = 'center' 
}: ImageBannerProps) {
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
            <div className={cn(
              "absolute inset-0", 
              layout === 'center' ? "bg-black/40" : "bg-gradient-to-r from-black/60 via-black/40 to-transparent"
            )} />
            <div className={cn(
                "relative z-10 h-full flex flex-col justify-center text-white p-8 md:p-16",
                layout === 'center' && "items-center text-center",
                layout === 'left' && "items-start text-left"
            )}>
              <div className="max-w-xl">
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
