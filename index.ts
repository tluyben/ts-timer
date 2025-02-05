import { addTimers } from './addtimers';
import { addAny } from './addany';

export { addTimers, addAny };

export function addTimersTS(sourceCode: string): string {
    return addAny(addTimers(sourceCode));
}
