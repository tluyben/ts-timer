import ts from "typescript";
import { createPreamble } from "./preamble";
import { createExitHandler } from "./exit-handler";
import { createVisitor, transformSourceFileStatements, calculateMaxDepth } from "./transformer";

function createTransformer(
  verbose: boolean
): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const factory = ts.factory;
    const visit = createVisitor(context);

    return (sourceFile: ts.SourceFile) => {
      // Analyze max depth
      const maxDepth = calculateMaxDepth(sourceFile);

      // Transform source file statements
      const transformedStatements = transformSourceFileStatements(sourceFile, visit, factory);

      return factory.updateSourceFile(sourceFile, [
        ...createPreamble(factory, maxDepth, verbose),
        ...transformedStatements,
        createExitHandler(factory),
      ]);
    };
  };
}

export function addTimers(
  sourceCode: string,
  verbose: boolean = false
): string {
  const sourceFile = ts.createSourceFile(
    "source.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const result = ts.transform(sourceFile, [createTransformer(verbose)]);
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
    omitTrailingSemicolon: false,
  });

  return printer.printFile(result.transformed[0]);
}
