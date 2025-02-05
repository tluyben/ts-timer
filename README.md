# 🚀 ts-timer

A powerful TypeScript-based code performance measurement tool that automatically instruments your code to track execution times.

## 🎯 Features

- ⚡ Automatic code instrumentation for performance measurement
- 📊 Detailed timing metrics for each code statement
- 🔍 Nested block timing support (up to 5 levels deep)
- 📈 Performance output in JSON format
- 🔄 Works with both JavaScript and TypeScript code
- 🛠️ Zero configuration required

## 📦 Installation

```bash
npm install ts-timer
```

## 🔧 Dependencies

- TypeScript ^5.7.3
- ts-morph ^25.0.1
- @types/node ^22.13.1

## 📝 Usage

### Basic Example

1. Start with your original code:

```javascript
function fibonacci(n) {
  let n1 = 0, n2 = 1, nextTerm;
  console.log("Fibonacci Series:");
  for (let i = 1; i <= n; i++) {
    console.log(n1);
    nextTerm = n1 + n2;
    n1 = n2;
    n2 = nextTerm;
  }
}

fibonacci(10);
```

2. Use ts-timer to instrument your code:

```typescript
import { addTimersTS } from 'ts-timer';

const instrumentedCode = addTimersTS(sourceCode);
```

3. Run your code and get performance measurements:

```json
Performance Measurements:
{
  "line": 1,
  "code": "let n1 = 0, n2 = 1, nextTerm;",
  "start": "2025-02-05T15:08:44.123Z",
  "end": "2025-02-05T15:08:44.124Z",
  "diff": 1
}
```

## 🔬 How It Works

ts-timer automatically:

1. 📌 Injects timing code around each statement in your source code
2. ⏱️ Measures execution time using high-precision timestamps
3. 🎯 Tracks nested block execution times
4. 📊 Generates detailed performance reports

## 🎨 Output Format

The performance measurements are output in JSON format with the following structure:

```typescript
interface TimingMeasurement {
  line: number;        // Source code line number
  code: string;        // The actual code being measured
  start: Date;         // Start timestamp
  end: Date;          // End timestamp
  diff: number;       // Execution time in milliseconds
}
```

## 🚦 Limitations

- Maximum nesting depth of 5 levels for timing blocks
- Timing overhead may affect extremely small operations
- Import/export statements are not timed

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is open source and available under the MIT License.
