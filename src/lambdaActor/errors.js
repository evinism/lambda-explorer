export class FreeVarInDefinitionError extends Error {
    constructor(message){
        super(message);
        this.name = 'FreeVarInDefinitionError';
    }
}