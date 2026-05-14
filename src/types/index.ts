import { Timestamp } from 'firebase/firestore';

export type Category = 'trend' | 'study' | 'school-life' | 'hobby' | 'issue';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  thumbnailUrl: string;
  category: Category;
  authorId: string;
  authorName: string;
  publishedAt: Timestamp | Date;
  scheduledAt?: Timestamp | Date | null;
  status: 'draft' | 'published' | 'scheduled';
  videoUrl?: string;
  viewCount: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
  school?: string;
  grade?: number;
}

export interface NewsScrap {
  id: string;
  userId: string;
  newsId: string;
  savedAt: Timestamp | Date;
}
