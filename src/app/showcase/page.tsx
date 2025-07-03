
import Image from 'next/image';

export default function ShowcasePage() {
  return (
    <div className="space-y-8">
      <div className="text-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-4xl font-headline font-bold">Our Showcase</h1>
        <p className="mt-2 text-lg text-muted-foreground">A collection of our favorite styles and curated looks.</p>
      </div>
      <div className="relative w-full overflow-hidden rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-700 delay-200">
        <Image
          src="https://i4.codibook.net/files/1982120939602/4b/1557734573.jpg"
          alt="Stylish fashion showcase"
          width={800}
          height={1200}
          className="w-full h-auto"
          data-ai-hint="fashion style"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>
    </div>
  );
}
