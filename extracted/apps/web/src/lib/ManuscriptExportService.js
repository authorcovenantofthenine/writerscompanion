// Export functionality has been removed from the platform.
// These stubs remain to prevent any lingering import errors during transition.

export const validateForExport = () => {
  return {
    valid: false,
    warnings: [],
    errors: ['Export functionality is no longer available.']
  };
};

export const exportToPDF = async () => false;
export const exportToDOCX = async () => false;
export const exportToEPub = async () => false;
export const exportToMOBI = async () => false;