import { db } from '../src/firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

const getBookById = async (bookId) => {
  const bookDoc = await getDoc(doc(db, 'books', bookId));
  return { id: bookDoc.id, ...bookDoc.data() };
};

export const getTrendingBooks = async () => {
  const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const q = query(collection(db, 'rental_logs'), where('rentedAt', '>=', sevenDaysAgo));
  const snapshot = await getDocs(q);

  const bookMap = new Map();

  for (const doc of snapshot.docs) {
    const { bookId } = doc.data();
    if (!bookMap.has(bookId)) {
      const book = await getBookById(bookId);
      bookMap.set(bookId, book);
    }
  }

  return Array.from(bookMap.values());
};

export const getTopBooks = async () => {
  const snapshot = await getDocs(collection(db, 'rental_logs'));
  const countMap = {};

  for (const doc of snapshot.docs) {
    const { bookId } = doc.data();
    countMap[bookId] = (countMap[bookId] || 0) + 1;
  }

  const sortedBookIds = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  const books = [];

  for (const id of sortedBookIds) {
    const book = await getBookById(id);
    books.push(book);
  }

  return books;
};
