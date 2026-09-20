function checkBalancedJournal(realm, companyCode) {
  const errors = [];
  const entries = realm.objects('JournalEntry').filtered('companyCode == $0', companyCode);
  for (const entry of entries) {
    if (entry.totalDebit.toString() !== entry.totalCredit.toString()) {
      errors.push({ type: 'UNBALANCED_JOURNAL', id: entry.id, number: entry.number });
    }
  }
  return errors;
}

function runIntegrityCheck(realm, companyCode) {
  const errors = checkBalancedJournal(realm, companyCode);
  return { passed: errors.length === 0, errors, checkedAt: new Date() };
}

module.exports = { checkBalancedJournal, runIntegrityCheck };
