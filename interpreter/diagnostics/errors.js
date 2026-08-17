// @ts-check

/*=========================================*/
/* Phase Errors                            */
/*=========================================*/
export class LexingError {}
export class ParsingError {}
export class ResolvingError {}
export class ExecutionError {}


/*=========================================*/
/* Implementation error                    */
/*=========================================*/
export class ImplementationError extends Error {}