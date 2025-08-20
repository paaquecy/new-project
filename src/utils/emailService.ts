// Email notification service for account approvals
export interface EmailNotificationData {
  recipientEmail: string;
  recipientName: string;
  accountType: 'police' | 'dvla';
  loginCredential: string;
  role: string;
  additionalInfo: {
    badgeNumber?: string;
    rank?: string;
    station?: string;
    idNumber?: string;
    position?: string;
  };
}

// Email templates
const getApprovalEmailTemplate = (data: EmailNotificationData): string => {
  const { recipientName, accountType, loginCredential, role, additionalInfo } = data;
  
  const systemName = accountType === 'police' ? 'Police' : 'DVLA';
  const credentialLabel = accountType === 'police' ? 'Badge Number' : 'ID Number';
  
  const additionalDetails = accountType === 'police' 
    ? `Badge Number: ${additionalInfo.badgeNumber}\nRank: ${additionalInfo.rank}\nStation: ${additionalInfo.station}`
    : `ID Number: ${additionalInfo.idNumber}\nPosition: ${additionalInfo.position}`;

  return `
Dear ${recipientName},

Your account registration for the ${systemName} Number Plate Recognition System has been **APPROVED**!

Account Details:
- Role: ${role}
- ${credentialLabel}: ${loginCredential}
- Email: ${data.recipientEmail}

Additional Information:
${additionalDetails}

Login Instructions:
1. Visit the system at: http://localhost:5173
2. Select "${systemName} Officer" as your account type
3. Use your ${credentialLabel.toLowerCase()} (${loginCredential}) as your username
4. Enter the password you provided during registration

Your account is now active and you can access all features of the ${systemName} system.

If you have any questions or need assistance, please contact the system administrator.

Best regards,
Number Plate Recognition System Team
  `.trim();
};

const getRejectionEmailTemplate = (data: EmailNotificationData): string => {
  const { recipientName, accountType, role } = data;
  
  const systemName = accountType === 'police' ? 'Police' : 'DVLA';

  return `
Dear ${recipientName},

We regret to inform you that your account registration for the ${systemName} Number Plate Recognition System has been **REJECTED**.

Account Details:
- Role: ${role}
- Email: ${data.recipientEmail}

The rejection may be due to:
- Incomplete or inaccurate information provided
- Invalid credentials or documentation
- Administrative review requirements not met

If you believe this decision was made in error, please contact the system administrator with additional documentation or clarification.

You may reapply for an account with corrected information at any time.

Best regards,
Number Plate Recognition System Team
  `.trim();
};

// Email sending function (simulated for development)
export const sendEmailNotification = async (
  data: EmailNotificationData, 
  type: 'approval' | 'rejection'
): Promise<boolean> => {
  try {
    const emailContent = type === 'approval' 
      ? getApprovalEmailTemplate(data)
      : getRejectionEmailTemplate(data);
    
    const emailSubject = type === 'approval'
      ? `Account Approved - ${data.accountType.toUpperCase()} Number Plate Recognition System`
      : `Account Rejected - ${data.accountType.toUpperCase()} Number Plate Recognition System`;

    // In a real application, this would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - EmailJS for client-side email sending
    
    // For development, we'll log the email details
    console.log('📧 Email Notification Sent:');
    console.log('To:', data.recipientEmail);
    console.log('Subject:', emailSubject);
    console.log('Content:', emailContent);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store email notification in localStorage for demo purposes
    const emailNotifications = JSON.parse(localStorage.getItem('email_notifications') || '[]');
    emailNotifications.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: emailSubject,
      content: emailContent,
      status: 'sent'
    });
    localStorage.setItem('email_notifications', JSON.stringify(emailNotifications));
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Get email notification history
export const getEmailNotificationHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('email_notifications') || '[]');
  } catch (error) {
    console.error('Error reading email notifications:', error);
    return [];
  }
};

// Clear email notification history
export const clearEmailNotificationHistory = () => {
  localStorage.removeItem('email_notifications');
};
