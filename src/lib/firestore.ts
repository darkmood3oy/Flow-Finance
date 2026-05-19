import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc,
  doc, 
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function sanitizeData(data: any) {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    } else if (sanitized[key] !== null && typeof sanitized[key] === 'object' && !(sanitized[key] instanceof Date) && !(sanitized[key] instanceof Timestamp)) {
       // Deep sanitize if needed, but for our simple objects shallow is usually enough
       // We'll stick to shallow for now as our data structures are flat
    }
  });
  return sanitized;
}

export function subscribeToTransactions(userId: string, callback: (transactions: any[]) => void) {
  const path = 'transactions';
  const q = query(
    collection(db, path),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date, // already ISO or date string
    }));
    callback(transactions);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function addTransaction(userId: string, data: any) {
  const path = 'transactions';
  try {
    await addDoc(collection(db, path), {
      ...sanitizeData(data),
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToProfile(userId: string, callback: (profile: any) => void) {
  const path = `profiles/${userId}`;
  return onSnapshot(doc(db, 'profiles', userId), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function updateProfile(userId: string, data: any) {
  const path = `profiles/${userId}`;
  try {
    await setDoc(doc(db, 'profiles', userId), {
      ...sanitizeData(data),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Accounts ---

export function subscribeToAccounts(userId: string, callback: (accounts: any[]) => void) {
  const path = 'accounts';
  const q = query(
    collection(db, path),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function createAccount(userId: string, data: any) {
  const path = 'accounts';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...sanitizeData(data),
      userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// --- Categories ---

export function subscribeToCategories(userId: string, callback: (categories: any[]) => void) {
  const path = 'categories';
  const q = query(
    collection(db, path),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function createCategory(userId: string, data: any) {
  const path = 'categories';
  try {
    await addDoc(collection(db, path), {
      ...sanitizeData(data),
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// --- Budgets ---

export function subscribeToBudgets(userId: string, callback: (budgets: any[]) => void) {
  const path = 'budgets';
  const q = query(
    collection(db, path),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function setBudget(userId: string, categoryId: string, limit: number, period: string) {
  const path = 'budgets';
  const budgetId = `${userId}_${categoryId}`;
  try {
    await setDoc(doc(db, path, budgetId), {
      userId,
      categoryId,
      limit,
      period,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
