import Image from 'next/image';

export function ImageBanner() {
  return (
    <section>
      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src="https://i4.codibook.net/files/1982120751817/d87a70fe9b9ff7/1124494606.jpg"
          alt="New Collection Banner"
          fill
          className="object-cover"
          data-ai-hint="fashion collection"
        />
      </div>
    </section>
  );
}
