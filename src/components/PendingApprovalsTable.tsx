import React, { useMemo } from 'react';
import { approveUser, rejectUser } from '../utils/userStorage';
import { logApproval } from '../utils/auditLog';
import { sendEmailNotification, EmailNotificationData } from '../utils/emailService';

export interface PendingApproval {
  id: string;
  userName: string;
  email: string;
  role: string;
  requestDate: string;
  accountType: 'police' | 'dvla';
  additionalInfo: {
    badgeNumber?: string;
    rank?: string;
    station?: string;
    idNumber?: string;
    position?: string;
  };
}

interface PendingApprovalsTableProps {
  searchQuery: string;
  filterQuery: string;
  approvals: PendingApproval[];
  setApprovals: React.Dispatch<React.SetStateAction<PendingApproval[]>>;
  onRefresh?: () => void;
}

const PendingApprovalsTable: React.FC<PendingApprovalsTableProps> = ({
  searchQuery,
  filterQuery,
  approvals,
  setApprovals,
  onRefresh
}) => {
  const filteredApprovals = useMemo(() => {
    return approvals.filter(approval => {
      const matchesSearch = searchQuery === '' || 
        approval.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterQuery === '' ||
        approval.userName.toLowerCase().includes(filterQuery.toLowerCase()) ||
        approval.email.toLowerCase().includes(filterQuery.toLowerCase());
      
      return matchesSearch && matchesFilter;
    });
  }, [approvals, searchQuery, filterQuery]);

  const handleApprove = async (approval: PendingApproval) => {
    console.log(`Approve clicked for ${approval.userName}`);

    // Approve in storage system
    const approvedUser = approveUser(approval.id);

    if (approvedUser) {
      const loginCredential = approval.accountType === 'police'
        ? approval.additionalInfo.badgeNumber
        : approval.additionalInfo.idNumber;

      const additionalDetails = approval.accountType === 'police'
        ? `Badge: ${approval.additionalInfo.badgeNumber}, Rank: ${approval.additionalInfo.rank}, Station: ${approval.additionalInfo.station}`
        : `ID: ${approval.additionalInfo.idNumber}, Position: ${approval.additionalInfo.position}`;

      // Log approval action
      logApproval('Account Approved', `Approved ${approval.accountType} officer account for ${approval.userName} (${loginCredential})`, 'main', 'high');

      // Send email notification
      const emailData: EmailNotificationData = {
        recipientEmail: approval.email,
        recipientName: approval.userName,
        accountType: approval.accountType,
        loginCredential,
        role: approval.role,
        additionalInfo: approval.additionalInfo
      };

      try {
        const emailSent = await sendEmailNotification(emailData, 'approval');
        if (emailSent) {
          console.log(`✅ Approval email sent to ${approval.email}`);
        } else {
          console.warn(`⚠️ Failed to send approval email to ${approval.email}`);
        }
      } catch (error) {
        console.error('Error sending approval email:', error);
      }

      alert(`Account for ${approval.userName} (${approval.role}) has been approved.\nDetails: ${additionalDetails}\n\nLogin Credentials:\nUsername: ${loginCredential}\nPassword: [The password they provided during registration]\n\nThey can now login to the ${approval.accountType === 'police' ? 'Police' : 'DVLA'} system.\n\n📧 An approval notification has been sent to ${approval.email}`);

      if (onRefresh) {
        onRefresh();
      } else {
        setApprovals((prev: PendingApproval[]) => prev.filter((a: PendingApproval) => a.id !== approval.id));
      }
    } else {
      alert('Error approving account. Please try again.');
    }
  };

  const handleReject = async (approval: PendingApproval) => {
    console.log(`Reject clicked for ${approval.userName}`);

    // Reject in storage system
    const success = rejectUser(approval.id);

    if (success) {
      const credential = approval.accountType === 'police'
        ? approval.additionalInfo.badgeNumber
        : approval.additionalInfo.idNumber;

      // Log rejection action
      logApproval('Account Rejected', `Rejected ${approval.accountType} officer account for ${approval.userName} (${credential})`, 'main', 'medium');

      // Send email notification
      const emailData: EmailNotificationData = {
        recipientEmail: approval.email,
        recipientName: approval.userName,
        accountType: approval.accountType,
        loginCredential: credential,
        role: approval.role,
        additionalInfo: approval.additionalInfo
      };

      try {
        const emailSent = await sendEmailNotification(emailData, 'rejection');
        if (emailSent) {
          console.log(`✅ Rejection email sent to ${approval.email}`);
        } else {
          console.warn(`⚠️ Failed to send rejection email to ${approval.email}`);
        }
      } catch (error) {
        console.error('Error sending rejection email:', error);
      }

      alert(`Account for ${approval.userName} (${approval.role}) has been rejected.\n\n📧 A rejection notification has been sent to ${approval.email}`);

      if (onRefresh) {
        onRefresh();
      } else {
        setApprovals((prev: PendingApproval[]) => prev.filter((a: PendingApproval) => a.id !== approval.id));
      }
    } else {
      alert('Error rejecting account. Please try again.');
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                USER NAME
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EMAIL
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROLE
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                REQUEST DATE
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DETAILS
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApprovals.map((approval, index) => (
              <tr 
                key={approval.id}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {approval.userName}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {approval.email}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`
                    inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${approval.role === 'Police Officer' 
                      ? 'bg-purple-100 text-purple-800' 
                      : approval.role === 'DVLA Officer'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                    }
                  `}>
                    {approval.role}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {approval.requestDate}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500">
                    {approval.accountType === 'police' ? (
                      <div>
                        <div>Badge: {approval.additionalInfo.badgeNumber}</div>
                        <div>Rank: {approval.additionalInfo.rank}</div>
                      </div>
                    ) : (
                      <div>
                        <div>ID: {approval.additionalInfo.idNumber}</div>
                        <div>Position: {approval.additionalInfo.position}</div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => handleApprove(approval)}
                      className="px-3 py-1 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval)}
                      className="px-3 py-1 bg-red-600 text-white text-xs sm:text-sm rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredApprovals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No pending approvals found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovalsTable;
