import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/types';

interface StoryThumbnailProps {
  story: Story;
}

export function StoryThumbnail({ story }: StoryThumbnailProps) {
  return (
    <Link href={`/stories/${story.id}`} className="block text-center group w-24">
      <div className="relative w-24 h-24 mx-auto p-1 rounded-full bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500">
        <div className="bg-background rounded-full p-0.5 h-full w-full">
           <Image
            src={story.coverImageUrl}
            alt={story.title}
            width={150}
            height={150}
            className="rounded-full object-cover w-full h-full"
            data-ai-hint="fashion story"
          />
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-primary truncate">{story.title}</p>
    </Link>
  );
}
