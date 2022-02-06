import { SearchController } from 'express-ext';
import { Log, Search } from 'onecore';
import { DB, SearchBuilder } from 'query-core';
import { AuditLog, AuditLogFilter, auditLogModel } from './audit-log';

export function useAuditLogController(log: Log, db: DB): AuditLogController {
  const builder = new SearchBuilder<AuditLog, AuditLogFilter>(db.query, 'auditlog', auditLogModel, db.driver);
  return new AuditLogController(log, builder.search);
}
export class AuditLogController extends SearchController<AuditLog, AuditLogFilter> {
  constructor(log: Log, search: Search<AuditLog, AuditLogFilter>) {
    super(log, search);
    this.array = ['status'];
    this.dates = ['timestamp'];
  }
}
