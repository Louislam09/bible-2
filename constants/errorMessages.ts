export const ERROR_MESSAGES = {
    // Validation errors
    INVALID_NAME: 'El nombre no es válido',
    INVALID_EMAIL: 'El correo electrónico no es válido',
    EMPTY_FIELDS: 'Por favor completa todos los campos',

    // Request status errors
    EMAIL_EXISTS: 'Este correo ya tiene una solicitud pendiente',
    REQUEST_NOT_FOUND: 'No se encontraron solicitudes para este correo',
    
    // Status update errors
    INVALID_STATUS: 'Estado de solicitud no válido',
    REQUEST_STATUS_NOT_FOUND: 'Solicitud no encontrada',

    // Server errors
    SERVER_ERROR: 'Error en el servidor, por favor intenta más tarde',
    CREATE_REQUEST_ERROR: 'Error al crear la solicitud',
    FETCH_REQUESTS_ERROR: 'Error al obtener las solicitudes',
    CHECK_STATUS_ERROR: 'Error al verificar el estado',
    UPDATE_STATUS_ERROR: 'Error al actualizar el estado',
    DELETE_REQUEST_ERROR: 'Error al eliminar la solicitud',

    // Network errors
    NETWORK_ERROR: 'Error de conexión, verifica tu internet',

    // Success messages
    REQUEST_CREATED: 'Solicitud enviada correctamente',
    REQUEST_UPDATED: 'Solicitud actualizada correctamente',
    REQUEST_DELETED: 'Solicitud eliminada correctamente'
} as const;
