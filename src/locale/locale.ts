import { Attributes, Filter, SearchResult } from "onecore"

export class Status {
  static readonly Draft = 'D'
  static readonly Submitted = 'S'
  static readonly Approved = 'A'
}

export interface Locale {
  code: string
  name?: string
  nativeName?: string
  countryCode?: string
  countryName?: string
  nativeCountryName?: string
  dateFormat?: string
  firstDayOfWeek?: number
  decimalSeparator?: string
  groupSeparator?: string
  currencyCode?: string
  currencySymbol?: string
  currencyDecimalDigits?: number
  currencyPattern?: number
  currencySample?: string
}

export interface LocaleFilter extends Filter {
  code?: string
  name?: string
  nativeName?: string
  countryCode?: string
  countryName?: string
  nativeCountryName?: string
  dateFormat: string
  firstDayOfWeek?: number
  decimalSeparator?: string
  groupSeparator?: string
  currencyCode?: string
  currencySymbol?: string
  currencyDecimalDigits?: number
  currencyPattern?: number
  currencySample?: string
}

export interface LocaleRepository {
  search(filter: LocaleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Locale>>
  load(id: string): Promise<Locale | null>
  create(locale: Locale): Promise<number>
  update(locale: Locale): Promise<number>
  patch(locale: Partial<Locale>): Promise<number>
  delete(id: string): Promise<number>
}
export interface LocaleService {
  search(filter: LocaleFilter, limit: number, page?: number, fields?: string[]): Promise<SearchResult<Locale>>
  load(id: string): Promise<Locale | null>
  create(locale: Locale): Promise<number>
  update(locale: Locale): Promise<number>
  patch(locale: Partial<Locale>): Promise<number>
  delete(id: string): Promise<number>
}

export const localeModel: Attributes = {
  id: {
    length: 40,
    required: true,
    key: true,
  },
  slug: {
    length: 150,
  },
  title: {
    length: 300,
    q: true,
  },
  description: {
    length: 9800,
  },
  publishedAt: {
    column: "published_at",
    type: "datetime",
  },
  expiredAt: {
    column: "expired_at",
    type: "datetime",
  },
  company: {
    length: 40,
  },
  position: {
    length: 100,
  },
  quantity: {
    type: "integer",
    min: 1,
  },
  location: {
    length: 120,
  },
  applicantCount: {
    column: "applicant_count",
    type: "integer",
  },
  skills: {
    type: "strings",
  },
  minSalary: {
    column: "min_salary",
    type: "integer",
  },
  maxSalary: {
    column: "max_salary",
    type: "integer",
  },

  createdBy: {
    column: "created_by",
    noupdate: true,
  },
  createdAt: {
    column: "created_at",
    type: "datetime",
    noupdate: true,
    createdAt: true,
  },
  updatedBy: {
    column: "updated_by",
  },
  updatedAt: {
    column: "updated_at",
    type: "datetime",
    updatedAt: true
  },
}
