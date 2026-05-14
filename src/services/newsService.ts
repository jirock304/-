import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { NewsArticle, Category } from '../types';

const NEWS_COLLECTION = 'news';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const newsService = {
  async getArticles(category?: Category, includeDrafts = false) {
    try {
      let q = query(collection(db, NEWS_COLLECTION), orderBy('publishedAt', 'desc'));
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      if (!includeDrafts) {
        q = query(q, where('status', '==', 'published'));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, NEWS_COLLECTION);
    }
  },

  async getArticleById(id: string) {
    try {
      const docRef = doc(db, NEWS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as NewsArticle;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${NEWS_COLLECTION}/${id}`);
    }
  },

  async createArticle(data: Omit<NewsArticle, 'id' | 'viewCount'>) {
    try {
      const docRef = await addDoc(collection(db, NEWS_COLLECTION), {
        ...data,
        viewCount: 0,
        publishedAt: data.status === 'published' ? serverTimestamp() : data.publishedAt
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, NEWS_COLLECTION);
    }
  },

  async updateArticle(id: string, data: Partial<NewsArticle>) {
    try {
      const docRef = doc(db, NEWS_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${NEWS_COLLECTION}/${id}`);
    }
  },

  async deleteArticle(id: string) {
    try {
      const docRef = doc(db, NEWS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${NEWS_COLLECTION}/${id}`);
    }
  }
};
