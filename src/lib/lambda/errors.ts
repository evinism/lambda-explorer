export class LambdaSyntaxError extends Error {
    constructor(message){
        super('Syntax Error: ' + message);
        this.name = 'LambdaSyntaxError';
    }
}

export class LambdaLexingError extends Error {
    constructor(message){
        super('Lexing Error: ' + message);
        this.name = 'LambdaLexingError';
    }
}

export class LambdaExecutionTimeoutError extends Error {
    constructor(message){
        super(message);
        this.name = 'LambdaExecutionTimeoutError';
    }
}
