export class JSendFail extends Error {
  paramKeys?: string[];

  constructor(message: string, paramKeys?: string[]) {
    super(message);
    Object.setPrototypeOf(this, JSendFail.prototype);
    this.name = "JSendFail";
    this.paramKeys = paramKeys;
  }
}

export class ServiceError extends Error {
  statusCode: number | undefined;
  code: string | undefined;
  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
