/**
 * Structured error handling for download operations
 * Provides user-friendly error messages and recovery strategies
 */

export enum DownloadErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    DISK_SPACE_ERROR = 'DISK_SPACE_ERROR',
    CORRUPTED_FILE = 'CORRUPTED_FILE',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    UNZIP_ERROR = 'UNZIP_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    UNKNOWN = 'UNKNOWN',
}

export class DownloadError extends Error {
    code: DownloadErrorCode;
    recoverable: boolean;
    userMessage: string;
    originalError?: Error;

    constructor(code: DownloadErrorCode, originalError?: Error, customMessage?: string) {
        super(originalError?.message || customMessage || 'Download error');
        this.name = 'DownloadError';
        this.code = code;
        this.originalError = originalError;
        this.recoverable = this.isRecoverable(code);
        this.userMessage = customMessage || this.getUserMessage(code);

        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DownloadError);
        }
    }

    private isRecoverable(code: DownloadErrorCode): boolean {
        switch (code) {
            case DownloadErrorCode.NETWORK_ERROR:
            case DownloadErrorCode.CORRUPTED_FILE:
                return true; // Can retry these
            case DownloadErrorCode.DISK_SPACE_ERROR:
            case DownloadErrorCode.PERMISSION_DENIED:
                return false; // User needs to take action
            default:
                return false;
        }
    }

    private getUserMessage(code: DownloadErrorCode): string {
        switch (code) {
            case DownloadErrorCode.NETWORK_ERROR:
                return "Problema de conexión. Reintentaremos automáticamente.";
            case DownloadErrorCode.DISK_SPACE_ERROR:
                return "Espacio insuficiente. Libera espacio e intenta de nuevo.";
            case DownloadErrorCode.CORRUPTED_FILE:
                return "Archivo corrupto detectado. Descargando de nuevo...";
            case DownloadErrorCode.PERMISSION_DENIED:
                return "Permisos insuficientes. Verifica los permisos de la app.";
            case DownloadErrorCode.FILE_NOT_FOUND:
                return "Archivo no encontrado en el servidor.";
            case DownloadErrorCode.UNZIP_ERROR:
                return "Error al descomprimir el archivo. Reintentando...";
            case DownloadErrorCode.DATABASE_ERROR:
                return "Error al procesar la base de datos.";
            default:
                return "Error inesperado. Intenta de nuevo más tarde.";
        }
    }

    /**
     * Get retry delay in milliseconds based on error type and retry count
     */
    getRetryDelay(retryCount: number): number {
        if (!this.recoverable) return 0;

        // Exponential backoff: 2s, 4s, 8s
        return Math.min(2000 * Math.pow(2, retryCount), 8000);
    }
}

/**
 * Classify an error into a DownloadError
 */
export function classifyDownloadError(error: any): DownloadError {
    // Network errors
    if (
        error?.message?.includes('network') ||
        error?.message?.includes('Network request failed') ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.message?.includes('ETIMEDOUT')
    ) {
        return new DownloadError(DownloadErrorCode.NETWORK_ERROR, error);
    }

    // Disk space errors
    if (
        error?.message?.includes('disk') ||
        error?.message?.includes('ENOSPC') ||
        error?.message?.includes('space')
    ) {
        return new DownloadError(DownloadErrorCode.DISK_SPACE_ERROR, error);
    }

    // Permission errors
    if (
        error?.message?.includes('permission') ||
        error?.message?.includes('EACCES') ||
        error?.message?.includes('EPERM')
    ) {
        return new DownloadError(DownloadErrorCode.PERMISSION_DENIED, error);
    }

    // File not found
    if (
        error?.message?.includes('404') ||
        error?.message?.includes('not found') ||
        error?.message?.includes('ENOENT')
    ) {
        return new DownloadError(DownloadErrorCode.FILE_NOT_FOUND, error);
    }

    // Unzip errors
    if (
        error?.message?.includes('unzip') ||
        error?.message?.includes('zip') ||
        error?.message?.includes('extract')
    ) {
        return new DownloadError(DownloadErrorCode.UNZIP_ERROR, error);
    }

    // Database errors
    if (
        error?.message?.includes('database') ||
        error?.message?.includes('SQLite') ||
        error?.message?.includes('disk I/O error')
    ) {
        return new DownloadError(DownloadErrorCode.DATABASE_ERROR, error);
    }

    // Corrupted file (checksum mismatch, invalid format, etc.)
    if (
        error?.message?.includes('corrupted') ||
        error?.message?.includes('invalid') ||
        error?.message?.includes('malformed')
    ) {
        return new DownloadError(DownloadErrorCode.CORRUPTED_FILE, error);
    }

    // Unknown error
    return new DownloadError(DownloadErrorCode.UNKNOWN, error);
}

/**
 * Format error for logging/debugging
 */
export function formatErrorForLogging(error: DownloadError): Record<string, any> {
    return {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        recoverable: error.recoverable,
        stack: error.stack,
        originalError: error.originalError?.message,
    };
}

