const entity = (name, properties, primaryKey = 'id') => ({
  name,
  primaryKey,
  properties: {
    id: 'string',
    createdAt: 'date?',
    updatedAt: 'date?',
    ...properties
  }
});

const schemas = [
  entity('Company', {
    code: 'string', name: 'string?', address: 'string?', vatNo: 'string?', crNo: 'string?',
    phone: 'string?', fiscalYear: 'string?', currency: 'string?', country: 'string?',
    vatRate: 'double?', insRate: 'double?'
  }),
  entity('User', {
    companyCode: 'string', name: 'string', email: 'string', passwordHash: 'string',
    roleId: 'string?', color: 'string?', active: 'bool?', lastLoginAt: 'date?'
  }),
  entity('Role', { name: 'string', permissions: 'string[]', active: 'bool?' }),
  entity('Permission', { code: 'string', name: 'string?', active: 'bool?' }),
  entity('Account', {
    companyCode: 'string', code: 'string', name: 'string', nameEn: 'string?', level: 'string',
    parentCode: 'string?', accountType: 'string', isActive: 'bool?'
  }, 'id'),
  entity('JournalEntry', {
    companyCode: 'string', number: 'string', accountingDate: 'date', description: 'string?',
    status: 'string', totalDebit: 'decimal128', totalCredit: 'decimal128',
    sourceType: 'string?', sourceId: 'string?', periodId: 'string?', postedBy: 'string?',
    reversedById: 'string?', lines: 'JournalLine[]'
  }),
  entity('JournalLine', {
    accountCode: 'string', accountName: 'string?', debit: 'decimal128', credit: 'decimal128',
    description: 'string?', costCenterId: 'string?'
  }, 'id'),
  entity('OpeningBalance', {
    companyCode: 'string', periodId: 'string', accountCode: 'string', amount: 'decimal128',
    direction: 'string', journalEntryId: 'string?', status: 'string'
  }),
  entity('Customer', { companyCode: 'string', number: 'string', name: 'string', vat: 'string?', phone: 'string?', address: 'string?', active: 'bool?' }),
  entity('Vendor', { companyCode: 'string', number: 'string', name: 'string', vat: 'string?', phone: 'string?', address: 'string?', active: 'bool?' }),
  entity('Product', { companyCode: 'string', sku: 'string?', name: 'string', unit: 'string?', price: 'decimal128', cost: 'decimal128', quantity: 'decimal128', minQuantity: 'decimal128', warehouseId: 'string?', active: 'bool?' }),
  entity('InventoryMovement', { companyCode: 'string', productId: 'string', quantity: 'decimal128', unitCost: 'decimal128', movementType: 'string', referenceType: 'string?', referenceId: 'string?', warehouseId: 'string?', branchId: 'string?', accountingDate: 'date', userId: 'string?' }),
  entity('SalesInvoice', { companyCode: 'string', number: 'string', customerId: 'string', accountingDate: 'date', subtotal: 'decimal128', discount: 'decimal128', tax: 'decimal128', total: 'decimal128', status: 'string', journalEntryId: 'string?', branchId: 'string?', lines: 'SalesInvoiceLine[]' }),
  entity('SalesInvoiceLine', { productId: 'string?', name: 'string', quantity: 'decimal128', unitPrice: 'decimal128', discount: 'decimal128', taxRate: 'decimal128', netAmount: 'decimal128', taxAmount: 'decimal128', total: 'decimal128' }, 'id'),
  entity('PurchaseInvoice', { companyCode: 'string', number: 'string', vendorId: 'string', accountingDate: 'date', subtotal: 'decimal128', discount: 'decimal128', tax: 'decimal128', total: 'decimal128', status: 'string', journalEntryId: 'string?', branchId: 'string?', lines: 'PurchaseInvoiceLine[]' }),
  entity('PurchaseInvoiceLine', { productId: 'string?', name: 'string', quantity: 'decimal128', unitPrice: 'decimal128', discount: 'decimal128', taxRate: 'decimal128', netAmount: 'decimal128', taxAmount: 'decimal128', total: 'decimal128' }, 'id'),
  entity('Treasury', { companyCode: 'string', number: 'string', name: 'string', currency: 'string?', balance: 'decimal128', branchId: 'string?', active: 'bool?' }),
  entity('TreasuryTransaction', { companyCode: 'string', number: 'string', treasuryId: 'string', type: 'string', amount: 'decimal128', accountingDate: 'date', referenceType: 'string?', referenceId: 'string?', contraAccountCode: 'string?', journalEntryId: 'string?', userId: 'string?' }),
  entity('Expense', { companyCode: 'string', number: 'string', description: 'string', accountCode: 'string', amount: 'decimal128', accountingDate: 'date', treasuryId: 'string?', journalEntryId: 'string?', status: 'string' }),
  entity('Installment', { companyCode: 'string', number: 'string', partyType: 'string', partyId: 'string', total: 'decimal128', status: 'string', schedule: 'InstallmentItem[]' }),
  entity('InstallmentItem', { dueDate: 'date', amount: 'decimal128', paid: 'bool', paidDate: 'date?', treasuryTransactionId: 'string?' }, 'id'),
  entity('Project', { companyCode: 'string', number: 'string', name: 'string', customerId: 'string?', status: 'string', budget: 'decimal128?' }),
  entity('Rental', { companyCode: 'string', number: 'string', partyId: 'string', startDate: 'date', endDate: 'date?', amount: 'decimal128', status: 'string' }),
  entity('Branch', { companyCode: 'string', code: 'string', name: 'string', address: 'string?', active: 'bool?' }),
  entity('Budget', { companyCode: 'string', year: 'int', accountCode: 'string', amount: 'decimal128', branchId: 'string?' }),
  entity('RecurringTransaction', { companyCode: 'string', number: 'string', description: 'string', debitAccountCode: 'string', creditAccountCode: 'string', amount: 'decimal128', frequency: 'string', nextRun: 'date', active: 'bool?' }),
  entity('Task', { companyCode: 'string', number: 'string', title: 'string', description: 'string?', assignedTo: 'string?', dueDate: 'date?', status: 'string' }),
  entity('CostCenter', { companyCode: 'string', code: 'string', name: 'string', active: 'bool?' }),
  entity('ManufacturingOrder', { companyCode: 'string', number: 'string', productId: 'string', quantity: 'decimal128', status: 'string', billOfMaterials: 'ManufacturingLine[]' }),
  entity('ManufacturingLine', { productId: 'string', quantity: 'decimal128' }, 'id'),
  entity('AuditLog', { companyCode: 'string', userId: 'string?', action: 'string', entity: 'string', entityId: 'string?', occurredAt: 'date', oldValue: 'string?', newValue: 'string?', machine: 'string?', result: 'string' }),
  entity('DocumentSequence', { companyCode: 'string', documentType: 'string', prefix: 'string', nextNumber: 'int', width: 'int' }),
  entity('AccountingPeriod', { companyCode: 'string', name: 'string', startDate: 'date', endDate: 'date', status: 'string', closedAt: 'date?', closedBy: 'string?' }),
  entity('BackupMetadata', { companyCode: 'string', filePath: 'string', checksum: 'string?', schemaVersion: 'int', createdBy: 'string?', valid: 'bool?', verifiedAt: 'date?' }),
  entity('SystemSetting', { companyCode: 'string', key: 'string', value: 'string?', valueType: 'string?' })
];

module.exports = { schemas };
