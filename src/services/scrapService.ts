import { 
  collection, 
  setDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { NewsArticle, NewsScrap } from '../types';

const SCRAPS_COLLECTION = 'scraps';

export const scrapService = {
  async getScraps(userId: string) {
    try {
      const q = query(
        collection(db, SCRAPS_COLLECTION), 
        where('userId', '==', userId),
        orderBy('savedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const scrapData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsScrap));
      
      // Fetch actual news articles for these scraps
      const newsPromises = scrapData.map(async (scrap) => {
        const newsRef = doc(db, 'news', scrap.newsId);
        const newsSnap = await getDoc(newsRef);
        if (newsSnap.exists()) {
          return { id: newsSnap.id, ...newsSnap.data() } as NewsArticle;
        }
        return null;
      });
      
      const results = await Promise.all(newsPromises);
      return results.filter(n => n !== null) as NewsArticle[];
    } catch (error) {
      console.error('Error fetching scraps:', error);
      return [];
    }
  },

  async toggleScrap(userId: string, newsId: string) {
    try {
      const scrapId = `${userId}_${newsId}`;
      const scrapRef = doc(db, SCRAPS_COLLECTION, scrapId);
      const scrapSnap = await getDoc(scrapRef);

      if (scrapSnap.exists()) {
        await deleteDoc(scrapRef);
        return false;
      } else {
        await setDoc(scrapRef, {
          userId,
          newsId,
          savedAt: serverTimestamp()
        });
        return true;
      }
    } catch (error) {
      console.error('Error toggling scrap:', error);
      throw error;
    }
  },

  async isScrapped(userId: string, newsId: string) {
    try {
      const scrapId = `${userId}_${newsId}`;
      const scrapRef = doc(db, SCRAPS_COLLECTION, scrapId);
      const scrapSnap = await getDoc(scrapRef);
      return scrapSnap.exists();
    } catch (error) {
      console.error('Error checking scrap status:', error);
      return false;
    }
  }
};
