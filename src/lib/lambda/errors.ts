export class LambdaSyntaxError extends Error {
  constructor(message: string) {
    super("Syntax Error: " + message);
    this.name = "LambdaSyntaxError";
  }
}

export class LambdaLexingError extends Error {
  constructor(message: string) {
    super("Lexing Error: " + message);
    this.name = "LambdaLexingError";
  }
}

export class LambdaExecutionTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LambdaExecutionTimeoutError";
  }
}
