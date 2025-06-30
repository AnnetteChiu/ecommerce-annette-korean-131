import Image from 'next/image';

export function ImageBanner() {
  return (
    <section>
      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src="https://placehold.co/1200x400.png"
          alt="New Collection Banner"
          fill
          className="object-cover"
          data-ai-hint="fashion collection"
        />
      </div>
    </section>
  );
}
