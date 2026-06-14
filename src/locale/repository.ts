import { DB } from "onecore"
import { Repository } from "sql-core"
import { Locale, LocaleFilter, localeModel, LocaleRepository } from "./locale"

export class SqlLocaleRepository extends Repository<Locale, string, LocaleFilter> implements LocaleRepository {
  constructor(db: DB) {
    super(db, "locale", localeModel)
  }
}
