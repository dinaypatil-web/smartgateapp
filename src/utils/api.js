// API service for online data storage using Firebase Firestore
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    onSnapshot,
    Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
    USERS: 'users',
    SOCIETIES: 'societies',
    VISITORS: 'visitors',
    NOTICES: 'notices',
    PRE_APPROVALS: 'preApprovals'
};

// Helper to convert Firestore timestamp to ISO string
const toISOString = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp.toISOString();
    if (timestamp.toDate) return timestamp.toDate().toISOString();
    return timestamp;
};

// Helper to convert data for Firestore (handle dates)
const prepareForFirestore = (data) => {
    const prepared = { ...data };
    // Convert ISO date strings to Firestore Timestamps if needed
    // Firestore handles dates automatically, but we'll keep them as strings for consistency
    return prepared;
};

// Generate unique ID (Firestore auto-generates, but we'll use custom for consistency)
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ===== USER OPERATIONS =====
export const getUsers = async () => {
    try {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const snapshot = await getDocs(usersRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
};

export const getUserById = async (id) => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

export const getUserByEmail = async (email) => {
    try {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const q = query(usersRef, where('email', '==', email.toLowerCase()));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
    }
};

// Helper to get society by ID (for synchronous contexts)
export const getSocietyByIdSync = async (id) => {
    return await getSocietyById(id);
};

export const getUserByLoginName = async (loginName) => {
    try {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const q = query(usersRef, where('loginName', '==', loginName.toLowerCase()));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user by login name:', error);
        return null;
    }
};

export const addUser = async (userData) => {
    try {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const userWithId = {
            ...prepareForFirestore(userData),
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(usersRef, userWithId);
        return { id: docRef.id, ...userWithId };
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
};

export const updateUser = async (id, updates) => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, id);
        await updateDoc(userRef, prepareForFirestore(updates));
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, id);
        await deleteDoc(userRef);
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// ===== SOCIETY OPERATIONS =====
export const getSocieties = async () => {
    try {
        const societiesRef = collection(db, COLLECTIONS.SOCIETIES);
        const snapshot = await getDocs(societiesRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting societies:', error);
        return [];
    }
};

export const getSocietyById = async (id) => {
    try {
        const societyRef = doc(db, COLLECTIONS.SOCIETIES, id);
        const societySnap = await getDoc(societyRef);
        if (societySnap.exists()) {
            return { id: societySnap.id, ...societySnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting society:', error);
        return null;
    }
};

export const addSociety = async (societyData) => {
    try {
        const societiesRef = collection(db, COLLECTIONS.SOCIETIES);
        const societyWithId = {
            ...prepareForFirestore(societyData),
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(societiesRef, societyWithId);
        return { id: docRef.id, ...societyWithId };
    } catch (error) {
        console.error('Error adding society:', error);
        throw error;
    }
};

export const updateSociety = async (id, updates) => {
    try {
        const societyRef = doc(db, COLLECTIONS.SOCIETIES, id);
        await updateDoc(societyRef, prepareForFirestore(updates));
        return true;
    } catch (error) {
        console.error('Error updating society:', error);
        throw error;
    }
};

export const deleteSociety = async (id) => {
    try {
        const societyRef = doc(db, COLLECTIONS.SOCIETIES, id);
        await deleteDoc(societyRef);
        return true;
    } catch (error) {
        console.error('Error deleting society:', error);
        throw error;
    }
};

// ===== VISITOR OPERATIONS =====
export const getVisitors = async () => {
    try {
        const visitorsRef = collection(db, COLLECTIONS.VISITORS);
        const snapshot = await getDocs(visitorsRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting visitors:', error);
        return [];
    }
};

export const getVisitorById = async (id) => {
    try {
        const visitorRef = doc(db, COLLECTIONS.VISITORS, id);
        const visitorSnap = await getDoc(visitorRef);
        if (visitorSnap.exists()) {
            return { id: visitorSnap.id, ...visitorSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting visitor:', error);
        return null;
    }
};

export const addVisitor = async (visitorData) => {
    try {
        const visitorsRef = collection(db, COLLECTIONS.VISITORS);
        const visitorWithId = {
            ...prepareForFirestore(visitorData),
            status: 'pending',
            entryTime: new Date().toISOString(),
            exitTime: null
        };
        const docRef = await addDoc(visitorsRef, visitorWithId);
        return { id: docRef.id, ...visitorWithId };
    } catch (error) {
        console.error('Error adding visitor:', error);
        throw error;
    }
};

export const updateVisitor = async (id, updates) => {
    try {
        const visitorRef = doc(db, COLLECTIONS.VISITORS, id);
        await updateDoc(visitorRef, prepareForFirestore(updates));
        return true;
    } catch (error) {
        console.error('Error updating visitor:', error);
        throw error;
    }
};

// ===== NOTICE OPERATIONS =====
export const getNotices = async () => {
    try {
        const noticesRef = collection(db, COLLECTIONS.NOTICES);
        const snapshot = await getDocs(noticesRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting notices:', error);
        return [];
    }
};

export const addNotice = async (noticeData) => {
    try {
        const noticesRef = collection(db, COLLECTIONS.NOTICES);
        const noticeWithId = {
            ...prepareForFirestore(noticeData),
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(noticesRef, noticeWithId);
        return { id: docRef.id, ...noticeWithId };
    } catch (error) {
        console.error('Error adding notice:', error);
        throw error;
    }
};

export const deleteNotice = async (id) => {
    try {
        const noticeRef = doc(db, COLLECTIONS.NOTICES, id);
        await deleteDoc(noticeRef);
        return true;
    } catch (error) {
        console.error('Error deleting notice:', error);
        throw error;
    }
};

// ===== PRE-APPROVAL OPERATIONS =====
export const getPreApprovals = async () => {
    try {
        const preApprovalsRef = collection(db, COLLECTIONS.PRE_APPROVALS);
        const snapshot = await getDocs(preApprovalsRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting pre-approvals:', error);
        return [];
    }
};

export const addPreApproval = async (preApprovalData) => {
    try {
        const preApprovalsRef = collection(db, COLLECTIONS.PRE_APPROVALS);
        const preApprovalWithId = {
            ...prepareForFirestore(preApprovalData),
            status: 'valid',
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(preApprovalsRef, preApprovalWithId);
        return { id: docRef.id, ...preApprovalWithId };
    } catch (error) {
        console.error('Error adding pre-approval:', error);
        throw error;
    }
};

export const updatePreApproval = async (id, updates) => {
    try {
        const preApprovalRef = doc(db, COLLECTIONS.PRE_APPROVALS, id);
        await updateDoc(preApprovalRef, prepareForFirestore(updates));
        return true;
    } catch (error) {
        console.error('Error updating pre-approval:', error);
        throw error;
    }
};

// ===== REAL-TIME SUBSCRIPTIONS (for data synchronization) =====
export const subscribeToCollection = (collectionName, callback) => {
    const collectionRef = collection(db, collectionName);
    return onSnapshot(collectionRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(data);
    }, (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
    });
};

