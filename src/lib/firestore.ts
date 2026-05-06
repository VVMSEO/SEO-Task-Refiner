import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, query, orderBy, Timestamp, onSnapshot, getDoc, serverTimestamp, increment, limit } from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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

export type TaskMode = 'refine' | 'split' | 'kanban' | 'audit';

export interface TaskData {
  id: string;
  mode: TaskMode;
  inputText: string;
  outputText: string;
  outputParsed: any;
  isFavorite: boolean;
  tags: string[];
  createdAt: Timestamp;
  tokensUsed: number;
  modelUsed: string;
}

export const createTask = async (userId: string, taskData: TaskData) => {
  const path = `users/${userId}/tasks/${taskData.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'tasks', taskData.id), taskData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const initializeProfile = async (userId: string, email: string | null, displayName: string | null) => {
  const path = `users/${userId}/profile/main`;
  try {
    const profileRef = doc(db, 'users', userId, 'profile', 'main');
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        email: email || '',
        displayName: displayName || '',
        totalRequests: 0,
        totalTokens: 0,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const incrementStats = async (userId: string, tokens: number) => {
  const path = `users/${userId}/profile/main`;
  try {
    const profileRef = doc(db, 'users', userId, 'profile', 'main');
    await updateDoc(profileRef, {
      totalRequests: increment(1),
      totalTokens: increment(tokens)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const updateTask = async (userId: string, taskId: string, updates: Partial<Pick<TaskData, 'isFavorite' | 'tags'>>) => {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'tasks', taskId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteTask = async (userId: string, taskId: string) => {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const subscribeToHistory = (userId: string, callback: (tasks: TaskData[]) => void) => {
  const path = `users/${userId}/tasks`;
  const q = query(collection(db, 'users', userId, 'tasks'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => doc.data() as TaskData));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const checkConnection = async () => {
    try {
        await getDoc(doc(db, 'test', 'connection'));
    } catch(error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
        }
    }
}
checkConnection();
