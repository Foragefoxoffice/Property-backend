/**
 * Sanitizes a property object or array of property objects.
 * Removes sensitive fields based on the user's authentication and role.
 * 
 * @param {Object|Array} data - The property or properties to sanitize.
 * @param {Object} user - The authenticated user (optional).
 * @returns {Object|Array} - The sanitized data.
 */
const sanitizeProperty = (data, user) => {
  const role = user?.role?.toLowerCase() || "";
  const isAdmin =
    role === "admin" || role === "super admin" || role === "superadmin";

  const performSanitization = (property) => {
    // If it's a Mongoose document, convert to object
    const p = property.toObject ? property.toObject() : { ...property };

    // =========================================================
    // 🛡️ HIDE FOR NON-ADMINS ONLY
    // =========================================================
    if (!isAdmin) {
      // 1. Remove Contact Management (Landlord info & Agent Fee)
      delete p.contactManagement;

      // 2. Remove Private Listing Information
      if (p.listingInformation) {
        delete p.listingInformation.listingInformationPropertyNo;
        delete p.listingInformation.listingInformationAvailableFrom;
        delete p.listingInformation.listingInformationAvailabilityStatus;
      }

      // 3. Remove Internal Financial Details (Agent Fee & Agenda)
      if (p.financialDetails) {
        delete p.financialDetails.financialDetailsAgentFee;
        delete p.financialDetails.financialDetailsAgentPaymentAgenda;
      }

      // Internal Tracking Fields
      delete p.createdBy;
      delete p.createdByName;
      delete p.approvedBy;
      delete p.approvedByName;
      delete p.sentBy;
      delete p.sentByName;
      delete p.approvedDate;
      delete p.sentDate;

      // Internal Status / Notes
      delete p.internalNotes;
      delete p.statusHistory;

      if (p.financialDetails) {
        delete p.financialDetails.financialDetailsFeeTax;
        delete p.financialDetails.financialDetailsLegalDoc;
        delete p.financialDetails.financialDetailsInternalNotes;
      }
    }

    return p;
  };

  if (Array.isArray(data)) {
    return data.map(performSanitization);
  }

  return performSanitization(data);
};

module.exports = { sanitizeProperty };
