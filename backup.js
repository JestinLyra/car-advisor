(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.YarisCareBackup = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const APP_NAME = 'My Yaris Care';
  const BACKUP_VERSION = 1;
  const ODO_BASELINE = 285915;
  const OWNER_CHECK_COUNT = 9;
  const TRIP_CHECK_COUNT = 8;

  class BackupImportError extends Error {
    constructor(message) {
      super(message);
      this.name = 'BackupImportError';
    }
  }

  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = value => typeof value === 'string'
    ? value.slice(0, 10000)
    : (typeof value === 'number' && Number.isFinite(value) ? String(value) : '');
  const listOfObjects = (value, label) => {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.some(item => !isObject(item))) {
      throw new BackupImportError(`The backup has invalid ${label} data.`);
    }
    return value;
  };
  const checkedIndexes = (value, maximum, label) => {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.some(index => !Number.isInteger(index))) {
      throw new BackupImportError(`The backup has invalid ${label} data.`);
    }
    return [...new Set(value.filter(index => index >= 0 && index < maximum))];
  };

  function normaliseRefuel(item) {
    return {
      date: text(item.date),
      litres: text(item.litres),
      price: text(item.price),
      fuelType: text(item.fuelType) || 'U91',
      location: text(item.location),
      station: text(item.station),
      pricePerLitre: text(item.pricePerLitre)
    };
  }

  function normaliseService(item) {
    return {
      job: text(item.job),
      date: text(item.date),
      km: Number.isFinite(Number(item.km)) ? Number(item.km) : ODO_BASELINE,
      ...(item.type === 'reminder' ? { type: 'reminder' } : {})
    };
  }

  function normaliseMiscExpense(item) {
    return {
      date: text(item.date),
      item: text(item.item),
      price: text(item.price),
      shop: text(item.shop)
    };
  }

  function normaliseCarNote(item) {
    return { title: text(item.title), body: text(item.body) };
  }

  function normaliseUndo(value, normaliser, label) {
    if (value === undefined || value === null) return undefined;
    if (!isObject(value) || !isObject(value.item)) {
      throw new BackupImportError(`The backup has invalid ${label} undo data.`);
    }
    return {
      item: normaliser(value.item),
      index: Number.isInteger(value.index) && value.index >= 0 ? value.index : 0
    };
  }

  function normaliseState(source) {
    if (!isObject(source)) throw new BackupImportError('The backup data is missing or damaged.');

    const odo = Number(source.odo);
    if (!Number.isFinite(odo) || odo < ODO_BASELINE) {
      throw new BackupImportError('The backup contains an invalid odometer reading.');
    }

    if (!Array.isArray(source.done) || !Array.isArray(source.services)) {
      throw new BackupImportError('The backup is missing required Yaris Care data.');
    }

    const services = listOfObjects(source.services, 'reminder').map(normaliseService);
    const miscExpenses = listOfObjects(source.miscExpenses, 'car miscellaneous').map(normaliseMiscExpense);
    let refuels = listOfObjects(source.refuels, 'fuel record').map(normaliseRefuel);
    const fallbackRefuel = isObject(source.refuel) ? normaliseRefuel(source.refuel) : normaliseRefuel({});
    if (!refuels.length && fallbackRefuel.date && Number(fallbackRefuel.price) > 0) refuels.push(fallbackRefuel);
    refuels.sort((a, b) => b.date.localeCompare(a.date));

    let carNotes = listOfObjects(source.carNotes, 'car note').map(normaliseCarNote);
    if (!carNotes.length && isObject(source.carInfo)) {
      if (text(source.carInfo.insurance)) carNotes.push({ title: 'Car insurance information', body: text(source.carInfo.insurance) });
      if (text(source.carInfo.parts)) carNotes.push({
        title: 'Parts replaced',
        body: text(source.carInfo.parts) + (text(source.carInfo.date) ? `\nDate: ${text(source.carInfo.date)}` : '')
      });
    }

    const restored = {
      done: checkedIndexes(source.done, OWNER_CHECK_COUNT, 'Owner Checks'),
      odo,
      services,
      refuels,
      refuel: refuels[0] || fallbackRefuel,
      miscExpenses,
      tripDone: checkedIndexes(source.tripDone, TRIP_CHECK_COUNT, 'five-minute checklist'),
      tripChecklistVersion: 2,
      carNotes
    };

    const reminderUndo = normaliseUndo(source.lastDeletedReminder, normaliseService, 'reminder');
    const miscUndo = normaliseUndo(source.lastDeletedMiscExpense, normaliseMiscExpense, 'car miscellaneous');
    if (reminderUndo) restored.lastDeletedReminder = reminderUndo;
    if (miscUndo) restored.lastDeletedMiscExpense = miscUndo;
    return restored;
  }

  function parseBackupText(contents) {
    let backup;
    try {
      backup = JSON.parse(contents);
    } catch (error) {
      throw new BackupImportError('This file is not valid JSON. Choose an unmodified Yaris Care backup.');
    }
    if (!isObject(backup) || backup.app !== APP_NAME) {
      throw new BackupImportError('This is not a genuine Yaris Care backup file.');
    }
    if (!Number.isInteger(backup.backupVersion)) {
      throw new BackupImportError('The Yaris Care backup version is missing or invalid.');
    }
    if (backup.backupVersion < 1 || backup.backupVersion > BACKUP_VERSION) {
      throw new BackupImportError(`Backup version ${backup.backupVersion} is not supported by this app.`);
    }
    return normaliseState(backup.data);
  }

  return { APP_NAME, BACKUP_VERSION, BackupImportError, normaliseState, parseBackupText };
});
