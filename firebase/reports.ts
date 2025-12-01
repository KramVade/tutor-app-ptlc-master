import { 
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

const REPORTS_COLLECTION = 'reports';

export interface Report {
  id?: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserType: 'tutor' | 'parent';
  category: 'inappropriate_behavior' | 'harassment' | 'safety_concern' | 'unprofessional' | 'fraud' | 'other';
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  bookingId?: string;
  evidence?: string[];
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function getAllReports() {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const snapshot = await getDocs(reportsRef);
    
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Report[];
    
    // Sort by createdAt (newest first)
    return reports.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
}

export async function getReportById(reportId: string) {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    const reportSnap = await getDoc(reportRef);
    
    if (reportSnap.exists()) {
      return {
        id: reportSnap.id,
        ...reportSnap.data()
      } as Report;
    }
    return null;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
}

export async function getReportsByReporter(reporterId: string) {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const q = query(
      reportsRef,
      where('reporterId', '==', reporterId)
    );
    const snapshot = await getDocs(q);
    
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Report[];
    
    // Sort by createdAt (newest first)
    return reports.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching reports by reporter:', error);
    throw error;
  }
}

export async function getReportsByReportedUser(reportedUserId: string) {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const q = query(
      reportsRef,
      where('reportedUserId', '==', reportedUserId)
    );
    const snapshot = await getDocs(q);
    
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Report[];
    
    // Sort by createdAt (newest first)
    return reports.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching reports by reported user:', error);
    throw error;
  }
}

export async function getReportsByStatus(status: Report['status']) {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const q = query(
      reportsRef,
      where('status', '==', status)
    );
    const snapshot = await getDocs(q);
    
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Report[];
    
    // Sort by createdAt (newest first)
    return reports.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching reports by status:', error);
    throw error;
  }
}

export async function addReport(reportData: Omit<Report, 'id'>) {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    
    // Determine priority based on category
    let priority: Report['priority'] = 'medium';
    if (reportData.category === 'safety_concern' || reportData.category === 'harassment') {
      priority = 'high';
    } else if (reportData.category === 'fraud') {
      priority = 'urgent';
    }
    
    // Remove undefined fields to avoid Firestore errors
    const cleanedData: any = {
      reporterId: reportData.reporterId,
      reporterName: reportData.reporterName,
      reporterEmail: reportData.reporterEmail,
      reportedUserId: reportData.reportedUserId,
      reportedUserName: reportData.reportedUserName,
      reportedUserType: reportData.reportedUserType,
      category: reportData.category,
      description: reportData.description,
      status: 'pending',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Only add optional fields if they are defined
    if (reportData.bookingId) {
      cleanedData.bookingId = reportData.bookingId;
    }
    if (reportData.evidence) {
      cleanedData.evidence = reportData.evidence;
    }
    if (reportData.adminNotes) {
      cleanedData.adminNotes = reportData.adminNotes;
    }
    
    const docRef = await addDoc(reportsRef, cleanedData);
    
    // Create notification for admin
    try {
      const { addNotification } = await import('./notifications');
      const { getAllAdmins } = await import('./admin');
      
      const admins = await getAllAdmins();
      
      // Notify all admins
      for (const admin of admins) {
        await addNotification({
          userId: admin.id,
          type: 'system',
          title: 'New Report Submitted',
          message: `${reportData.reporterName} reported ${reportData.reportedUserName} for ${reportData.category.replace(/_/g, ' ')}`,
          read: false,
          link: `/admin/moderation`,
          createdAt: new Date().toISOString()
        });
      }
    } catch (notifError) {
      console.error('Error creating admin notification:', notifError);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
}

export async function updateReport(reportId: string, reportData: Partial<Report>) {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, {
      ...reportData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
}

export async function updateReportStatus(
  reportId: string, 
  status: Report['status'],
  adminId?: string,
  adminNotes?: string
) {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolvedAt = new Date().toISOString();
      if (adminId) {
        updateData.resolvedBy = adminId;
      }
    }
    
    await updateDoc(reportRef, updateData);
    
    // Notify reporter about status change
    if (status === 'resolved' || status === 'dismissed') {
      try {
        const report = await getReportById(reportId);
        if (report) {
          const { addNotification } = await import('./notifications');
          await addNotification({
            userId: report.reporterId,
            type: 'system',
            title: 'Report Update',
            message: `Your report has been ${status}. ${adminNotes || ''}`,
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      } catch (notifError) {
        console.error('Error creating reporter notification:', notifError);
      }
    }
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
}

// Get report statistics
export async function getReportStats() {
  try {
    const reports = await getAllReports();
    
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      underReview: reports.filter(r => r.status === 'under_review').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      dismissed: reports.filter(r => r.status === 'dismissed').length,
      byCategory: {
        inappropriate_behavior: reports.filter(r => r.category === 'inappropriate_behavior').length,
        harassment: reports.filter(r => r.category === 'harassment').length,
        safety_concern: reports.filter(r => r.category === 'safety_concern').length,
        unprofessional: reports.filter(r => r.category === 'unprofessional').length,
        fraud: reports.filter(r => r.category === 'fraud').length,
        other: reports.filter(r => r.category === 'other').length,
      },
      byPriority: {
        low: reports.filter(r => r.priority === 'low').length,
        medium: reports.filter(r => r.priority === 'medium').length,
        high: reports.filter(r => r.priority === 'high').length,
        urgent: reports.filter(r => r.priority === 'urgent').length,
      }
    };
  } catch (error) {
    console.error('Error getting report stats:', error);
    throw error;
  }
}
