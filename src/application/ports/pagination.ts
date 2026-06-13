export interface Keyset { name: string; id: string }
export interface PageQuery { limit: number; after: Keyset | null }
export interface RepoPage<T> { items: T[]; hasMore: boolean }
