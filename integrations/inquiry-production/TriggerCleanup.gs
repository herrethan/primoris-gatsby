// One-time editor helper. No web-app deployment update is needed.
// Sign into the school account before running resetRecoveryTrigger.
function resetRecoveryTrigger() {
  const active = Session.getActiveUser().getEmail();
  const effective = Session.getEffectiveUser().getEmail();
  if (!active || active !== effective) {
    throw new Error('Run resetRecoveryTrigger from the editor while signed into the school account.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Only this account's triggers are visible here. Other accounts must remove
    // their own old schedules from the Apps Script Triggers page.
    const previous = ScriptApp.getProjectTriggers()
      .filter(trigger => trigger.getHandlerFunction() === 'retryNotifications_');
    // Create first: an authorization/quota failure must not remove recovery.
    ScriptApp.newTrigger('retryNotifications_').timeBased().everyMinutes(10).create();
    for (const trigger of previous) ScriptApp.deleteTrigger(trigger);
    console.log('Created one ten-minute recovery trigger for the signed-in account; removed ' + previous.length + ' previous recovery trigger(s). Other functions were left unchanged.');
  } finally {
    lock.releaseLock();
  }
}
