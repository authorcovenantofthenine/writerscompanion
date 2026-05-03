/// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  // Get the incoming 'updated' timestamp from the request
  const incomingUpdated = e.record.get("updated");
  
  // Get the current record from the database to compare timestamps
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    // Record doesn't exist, let the update proceed (will fail at DB level)
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  // Compare timestamps - if they don't match, another client modified the record
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "projects");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "characters");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "scenes");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "world_elements");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "timeline_events");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "relationships");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "books");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "chapters");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "writing_prompts");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "writing_suggestions");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "assets");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "brainstorms");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "writing_history");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "subscriptions");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "worlds");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "regions");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "locations");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "location_connections");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "timeline_chapters");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "manuscript_metadata");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "templates");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "manuscripts");

onRecordUpdate((e) => {
  const incomingUpdated = e.record.get("updated");
  const currentRecord = $app.findRecordById(e.collection.name, e.record.id);
  
  if (!currentRecord) {
    e.next();
    return;
  }
  
  const currentUpdated = currentRecord.get("updated");
  
  if (incomingUpdated !== currentUpdated) {
    throw new BadRequestError("Record was modified elsewhere. Please refresh and try again.");
  }
  
  e.next();
}, "front_matter");