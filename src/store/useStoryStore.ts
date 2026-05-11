import { create } from 'zustand';

export interface Story {
  id: string;
  title: string;
  audioBlobUrl: string;
  date: string;
  isPpv: boolean;
  price?: string;
  creatorId?: string;
}

interface StoryState {
  myStories: Story[];
  addStory: (story: Omit<Story, 'id' | 'date'>) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  myStories: [],
  addStory: (story) => set((state) => ({
    myStories: [
      {
        ...story,
        id: crypto.randomUUID(),
        date: 'Justo ahora',
      },
      ...state.myStories
    ]
  })),
}));
