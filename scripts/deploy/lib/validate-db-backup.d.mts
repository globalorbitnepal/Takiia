export declare function detectPostgresBackupFormat(header: string): 'pg_custom' | 'pg_plain' | 'unknown';
export declare function postgresBackupContentsLookRestorable(listOrDumpText: string): boolean;
export declare function postgresBackupIsEmptyCustomCatalog(listOrDumpText: string): boolean;
