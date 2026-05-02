/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  // Get the projectId from the scene being created
  const projectId = e.record.get("projectId");
  
  if (!projectId) {
    e.next();
    return;
  }
  
  try {
    // Look up the project record
    const project = $app.findRecordById("projects", projectId);
    
    if (project) {
      // Get the userId from the project
      const projectUserId = project.get("userId");
      
      if (projectUserId) {
        // Set the scene's userId to match the project's userId
        e.record.set("userId", projectUserId);
      }
    }
  } catch (err) {
    // If project lookup fails, continue anyway
    console.log("Could not find project: " + projectId);
  }
  
  e.next();
}, "scenes");

onRecordUpdate((e) => {
  // Also sync on update if projectId changes
  const projectId = e.record.get("projectId");
  const originalProjectId = e.record.original().get("projectId");
  
  // Only re-sync if projectId was changed
  if (projectId && projectId !== originalProjectId) {
    try {
      const project = $app.findRecordById("projects", projectId);
      
      if (project) {
        const projectUserId = project.get("userId");
        
        if (projectUserId) {
          e.record.set("userId", projectUserId);
        }
      }
    } catch (err) {
      console.log("Could not find project: " + projectId);
    }
  }
  
  e.next();
}, "scenes");