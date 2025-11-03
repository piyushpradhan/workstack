export class AuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly field?: string;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    field?: string,
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.statusCode = statusCode;
    this.field = field;
  }
}

export const handleAuthError = async (response: Response): Promise<never> => {
  let errorData: any;

  try {
    errorData = await response.json();
  } catch {
    errorData = { message: "An unexpected error occurred" };
  }

  const { message, code, field } = errorData;

  const errorCode = code || getErrorCodeFromStatus(response.status);

  throw new AuthError(
    message || getDefaultMessage(response.status),
    errorCode,
    response.status,
    field,
  );
};

const getErrorCodeFromStatus = (status: number): string => {
  switch (status) {
    case 400:
      return "VALIDATION_ERROR";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "UNPROCESSABLE_ENTITY";
    case 429:
      return "RATE_LIMITED";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    default:
      return "UNKNOWN_ERROR";
  }
};

const getDefaultMessage = (status: number): string => {
  switch (status) {
    case 400:
      return "Invalid request";
    case 401:
      return "Authentication required";
    case 403:
      return "Access denied";
    case 404:
      return "Resource not found";
    case 409:
      return "Resource already exists";
    case 422:
      return "Validation failed";
    case 429:
      return "Too many requests";
    case 500:
      return "Internal server error";
    default:
      return "An unexpected error occurred";
  }
};
