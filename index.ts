import { addTimers } from './add-timers';
import { addAny } from './add-any';

export { addTimers, addAny };

export function addTimersTS(sourceCode: string): string {
    return addAny(addTimers(sourceCode));
}
