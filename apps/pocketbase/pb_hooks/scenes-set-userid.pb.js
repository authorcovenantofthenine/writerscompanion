/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  // Set userId to the authenticated user's ID
  if (e.requestInfo && e.auth && e.auth.id) {
    e.record.set("userId", e.auth.id);
  }
  e.next();
}, "scenes");