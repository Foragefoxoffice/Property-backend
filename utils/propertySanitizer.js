/**
 * Sanitizes a property object or array of property objects.
 * Removes sensitive fields based on the user's authentication and role.
 * 
 * @param {Object|Array} data - The property or properties to sanitize.
 * @param {Object} user - The authenticated user (optional).
 * @returns {Object|Array} - The sanitized data.
 */
const sanitizeProperty = (data, user) => {
  // If user is admin/superadmin, don't sanitize (or sanitize less)
  const isAdmin = user && (user.role === 'admin' || user.role === 'super admin');
  
  if (isAdmin) {
    return data;
  }

  const performSanitization = (property) => {
    // If it's a Mongoose document, convert to object
    const p = property.toObject ? property.toObject() : { ...property };

    // 1. Remove Contact Management (Landlord info)
    delete p.contactManagement;

    // 2. Remove Internal Tracking Fields
    delete p.createdBy;
    delete p.createdByName;
    delete p.approvedBy;
    delete p.approvedByName;
    delete p.sentBy;
    delete p.sentByName;
    delete p.approvedDate;
    delete p.sentDate;

    // 3. Remove Internal Financial Details
    if (p.financialDetails) {
      delete p.financialDetails.financialDetailsAgentFee;
      delete p.financialDetails.financialDetailsAgentPaymentAgenda;
      delete p.financialDetails.financialDetailsFeeTax; // Often internal tax info
      delete p.financialDetails.financialDetailsLegalDoc; // Link to internal documents
      delete p.financialDetails.financialDetailsInternalNotes;
    }

    // 4. Remove Internal Status / Notes
    delete p.internalNotes;
    delete p.statusHistory;

    return p;
  };

  if (Array.isArray(data)) {
    return data.map(performSanitization);
  }
  
  return performSanitization(data);
};

module.exports = { sanitizeProperty };
