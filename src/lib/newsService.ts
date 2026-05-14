import { collection, query, orderBy, onSnapshot, limit, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  category: string;
  authorId: string;
  createdAt: any;
  publishedAt: any;
  isPublished: boolean;
  views: number;
  scrapCount: number;
}

export const getNews = (callback: (news: NewsItem[]) => void) => {
  const q = query(
    collection(db, 'news'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (snapshot) => {
    const news = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NewsItem[];
    callback(news);
  }, (error) => {
    console.error("Firestore Error (list):", error);
  });
};

export const createNews = async (news: Partial<NewsItem>) => {
  const docRef = await addDoc(collection(db, 'news'), {
    ...news,
    createdAt: Timestamp.now(),
    publishedAt: Timestamp.now(),
    views: 0,
    scrapCount: 0,
    isPublished: true
  });
  return docRef.id;
};

export const updateNews = async (id: string, news: Partial<NewsItem>) => {
  const docRef = doc(db, 'news', id);
  await updateDoc(docRef, {
    ...news,
    updatedAt: Timestamp.now()
  });
};

export const deleteNews = async (id: string) => {
  await deleteDoc(doc(db, 'news', id));
};
