import { addTimersTS } from './index';
import * as fs from 'fs';

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Error: Input file is required');
    console.error('Usage: ts-node cli.ts <input-file> [output-file]');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

try {
    const sourceCode = fs.readFileSync(inputFile, 'utf-8');
    const processedCode = addTimersTS(sourceCode);
    
    if (outputFile) {
        fs.writeFileSync(outputFile, processedCode);
        console.log(`Processed code written to ${outputFile}`);
    } else {
        console.log(processedCode);
    }
} catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
}
