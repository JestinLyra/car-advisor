'use strict';

const assert = require('node:assert/strict');
const backup = require('../backup.js');

const completeState = {
  code: '<script>not allowed</script>',
  odo: 286211,
  done: [0, 3],
  services: [{ type: 'reminder', job: 'Buy car oil', date: '2026-08-30', km: 286211 }],
  refuels: [{ date: '2026-08-30', price: '24.98', fuelType: 'U91', station: 'Liberty Oil', pricePerLitre: '189.9' }],
  miscExpenses: [{ date: '2026-08-30', item: 'Washer fluid', price: '16.00', shop: 'Auto shop' }],
  tripDone: [1, 4],
  carNotes: [{ title: 'Insurance', body: 'Policy details' }],
  lastDeletedReminder: { item: { type: 'reminder', job: 'Old reminder', date: '2026-08-29' }, index: 1 },
  lastDeletedMiscExpense: { item: { item: 'Old item', price: '5.00', shop: 'Shop', date: '2026-08-29' }, index: 0 }
};

const restored = backup.parseBackupText(JSON.stringify({ app: backup.APP_NAME, backupVersion: 1, data: completeState }));
assert.equal(restored.odo, 286211);
assert.equal(restored.refuels[0].station, 'Liberty Oil');
assert.equal(restored.miscExpenses[0].price, '16.00');
assert.equal(restored.services[0].job, 'Buy car oil');
assert.deepEqual(restored.done, [0, 3]);
assert.deepEqual(restored.tripDone, [1, 4]);
assert.equal(restored.carNotes[0].body, 'Policy details');
assert.equal(restored.lastDeletedReminder.item.job, 'Old reminder');
assert.equal(restored.lastDeletedMiscExpense.item.item, 'Old item');
assert.equal(Object.hasOwn(restored, 'code'), false);

const older = backup.parseBackupText(JSON.stringify({
  app: backup.APP_NAME,
  backupVersion: 1,
  data: { odo: 285915, done: [], services: [], refuel: { date: '', price: '', fuelType: 'U91' } }
}));
assert.deepEqual(older.refuels, []);
assert.deepEqual(older.miscExpenses, []);
assert.deepEqual(older.tripDone, []);
assert.deepEqual(older.carNotes, []);

assert.throws(() => backup.parseBackupText('{broken'), /not valid JSON/);
assert.throws(() => backup.parseBackupText(JSON.stringify({ app: 'Another app', backupVersion: 1, data: completeState })), /not a genuine Yaris Care/);
assert.throws(() => backup.parseBackupText(JSON.stringify({ app: backup.APP_NAME, backupVersion: 1, data: { odo: 286000 } })), /missing required Yaris Care data/);
assert.throws(() => backup.parseBackupText(JSON.stringify({ app: backup.APP_NAME, backupVersion: 2, data: completeState })), /not supported/);
assert.throws(() => backup.parseBackupText(JSON.stringify({ app: backup.APP_NAME, backupVersion: 1, data: { ...completeState, carNotes: ['damaged'] } })), /invalid car note data/);

console.log('Backup import tests passed');
