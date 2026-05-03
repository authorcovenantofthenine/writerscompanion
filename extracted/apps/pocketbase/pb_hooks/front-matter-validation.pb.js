/// <reference path="../pb_data/types.d.ts" />
// Validation hook for front_matter collection
// Ensures sectionType is valid and required fields are present
onRecordCreate((e) => {
  const sectionType = e.record.get("sectionType");
  const projectId = e.record.get("projectId");
  const userId = e.record.get("userId");
  
  // Validate required fields
  if (!sectionType) {
    throw new BadRequestError("sectionType is required");
  }
  
  if (!projectId) {
    throw new BadRequestError("projectId is required");
  }
  
  if (!userId) {
    throw new BadRequestError("userId is required");
  }
  
  // Validate sectionType is one of the allowed values
  const validTypes = ['half_title', 'title_page', 'copyright', 'reviews', 'dedication', 'toc', 'preface', 'acknowledgments', 'prologue', 'introduction'];
  if (!validTypes.includes(sectionType)) {
    throw new BadRequestError("Invalid sectionType: " + sectionType);
  }
  
  e.next();
}, "front_matter");

onRecordUpdate((e) => {
  const sectionType = e.record.get("sectionType");
  const projectId = e.record.get("projectId");
  const userId = e.record.get("userId");
  
  // Validate required fields
  if (!sectionType) {
    throw new BadRequestError("sectionType is required");
  }
  
  if (!projectId) {
    throw new BadRequestError("projectId is required");
  }
  
  if (!userId) {
    throw new BadRequestError("userId is required");
  }
  
  // Validate sectionType is one of the allowed values
  const validTypes = ['half_title', 'title_page', 'copyright', 'reviews', 'dedication', 'toc', 'preface', 'acknowledgments', 'prologue', 'introduction'];
  if (!validTypes.includes(sectionType)) {
    throw new BadRequestError("Invalid sectionType: " + sectionType);
  }
  
  e.next();
}, "front_matter");