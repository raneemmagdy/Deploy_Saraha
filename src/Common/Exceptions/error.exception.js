export const ApplicationException = ({
  message = "Something went wrong",
  options = { cause: { status: 500 } },
}) => {
  throw new Error(message, options);
};

export const NotFoundException = ({
  message = "Not found",
  options = { cause: { status: 404 } },
}) => {
  throw ApplicationException({ message, options });
};
export const BadRequestException = ({
  message = "Bad request",
  options = { cause: { status: 400, errors: undefined } },
}) => {
  throw ApplicationException({ message, options });
};

export const UnauthorizedException = ({
  message = "Unauthorized", //401 Unauthorized → The user is not authenticated / we don't know who they are.
  options = { cause: { status: 401 } },
}) => {
  throw ApplicationException({ message, options });
};

export const ForbiddenException = ({
  message = "Forbidden", //403 Forbidden → The user is authenticated, but they don't have permission to perform the action.
  options = { cause: { status: 403 } },
}) => {
  throw ApplicationException({ message, options });
};

export const ConflictException = ({
  message = "Conflict",
  options = { cause: { status: 409 } },
}) => {
  throw ApplicationException({ message, options });
};

export const InternalServerException = ({
  message = "Internal server error",
  options = { cause: { status: 500 } },
}) => {
  throw ApplicationException({ message, options });
};
