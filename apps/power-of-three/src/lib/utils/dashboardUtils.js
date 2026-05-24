export const copyToClipboard = async (formData) => {
  try {
    const textToCopy = `Title: ${formData.workTitle}\n\nSubmission:\n${formData.workSubmission}\n\nCalling Questions:\n${formData.callingQuestions}`;
    await navigator.clipboard.writeText(textToCopy);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const validateRoundSubmission = (formData) => {
  return formData.workTitle?.trim().length > 0 && formData.workSubmission?.trim().length > 0;
};

export const rotateRoles = (currentRoles) => {
  // roles rotate: writer→editor, beta_reader→writer, editor→beta_reader
  const newRoles = {};
  
  // Find who has what role currently
  let currentWriter, currentBeta, currentEditor;
  
  for (const [memberId, role] of Object.entries(currentRoles)) {
    if (role === 'writer') currentWriter = memberId;
    if (role === 'beta_reader') currentBeta = memberId;
    if (role === 'editor') currentEditor = memberId;
  }
  
  // Assign new roles
  if (currentWriter) newRoles[currentWriter] = 'editor';
  if (currentBeta) newRoles[currentBeta] = 'writer';
  if (currentEditor) newRoles[currentEditor] = 'beta_reader';
  
  return newRoles;
};