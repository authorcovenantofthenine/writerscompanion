/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  // This hook runs after a scene is created
  // If chapter_id is not set, attempt to find a chapter in the same project
  if (!e.record.get("chapter_id") || e.record.get("chapter_id") === "") {
    const projectId = e.record.get("projectId");
    if (projectId) {
      try {
        // Find the first chapter in this project
        const chapter = $app.findFirstRecordByData("chapters", "projectId", projectId);
        if (chapter) {
          e.record.set("chapter_id", chapter.id);
          $app.save(e.record);
        }
      } catch (err) {
        // If no chapter found, that's okay - chapter_id will remain as provided
        console.log("No chapter found for project: " + projectId);
      }
    }
  }
  e.next();
}, "scenes");

// Also handle updates - if chapter_id is being set, validate it exists
onRecordUpdate((e) => {
  const chapterId = e.record.get("chapter_id");
  if (chapterId && chapterId !== "") {
    try {
      const chapter = $app.findRecordById("chapters", chapterId);
      if (!chapter) {
        throw new BadRequestError("Chapter with ID " + chapterId + " does not exist");
      }
      // Verify the chapter belongs to the same project
      const sceneProjectId = e.record.get("projectId");
      const chapterProjectId = chapter.get("projectId");
      if (sceneProjectId !== chapterProjectId) {
        throw new BadRequestError("Chapter must belong to the same project as the scene");
      }
    } catch (err) {
      if (err.message && err.message.indexOf("does not exist") > -1) {
        throw err;
      }
      // Record not found is expected if chapter doesn't exist
      throw new BadRequestError("Invalid chapter_id: chapter does not exist");
    }
  }
  e.next();
}, "scenes");