import storiesData from '@/data/stories.json';
import type { Story } from '@/types';

const stories: Story[] = storiesData as Story[];

export function getStories(): Story[] {
  return stories;
}

export function getStoryById(id: string): Story | undefined {
  return stories.find((s) => s.id === id);
}
