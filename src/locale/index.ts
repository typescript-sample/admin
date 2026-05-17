import { DB, UseCase } from "onecore"
import { LocaleController } from "./controller"
import { Locale, LocaleFilter, LocaleRepository, LocaleService } from "./locale"
import { SqlLocaleRepository } from "./repository"
export * from "./controller"
export * from "./locale"

export class LocaleUseCase extends UseCase<Locale, string, LocaleFilter> implements LocaleService {
  constructor(repository: LocaleRepository) {
    super(repository)
  }
}

export function useLocaleController(db: DB): LocaleController {
  const repository = new SqlLocaleRepository(db)
  const service = new LocaleUseCase(repository)
  return new LocaleController(service)
}
