// Character update hook - validates and processes character updates
onRecordUpdate((e) => {
  // Safely access the record's name field with null/undefined checks
  const characterName = e.record ? e.record.get("name") : null;
  
  // Validate that required fields exist before processing
  if (characterName && typeof characterName === 'string' && characterName.trim() !== '') {
    // Log the character update for debugging
    console.log("Updating character: " + characterName);
  } else {
    // If name is missing or invalid, log a warning but allow the update to proceed
    console.log("Character update: name field is missing or invalid");
  }
  
  // Validate projectId exists (required field)
  const projectId = e.record ? e.record.get("projectId") : null;
  if (!projectId || projectId.trim() === '') {
    throw new BadRequestError("projectId is required for character updates");
  }
  
  // Validate userId exists (required field)
  const userId = e.record ? e.record.get("userId") : null;
  if (!userId || userId.trim() === '') {
    throw new BadRequestError("userId is required for character updates");
  }
  
  // Continue execution chain - CRITICAL
  e.next();
}, "characters");