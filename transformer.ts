import ts from "typescript";
import { createTimerPushBlock } from "./timer-push";

export function createVisitor(context: ts.TransformationContext) {
  const factory = ts.factory;
  let depth = 0;

  function visit(node: ts.Node, sf: ts.SourceFile): ts.Node {
    // Handle blocks and control flow statements
    if (ts.isBlock(node)) {
      depth++;
      const statements = (node as ts.Block).statements.flatMap((stmt) => {
        if (
          ts.isImportDeclaration(stmt) ||
          ts.isExportDeclaration(stmt) ||
          (ts.isVariableStatement(stmt) &&
            stmt.declarationList.declarations.some((d) =>
              d.name.getText(sf).startsWith("_____")
            ))
        ) {
          return [stmt];
        }

        const timerSuffix = depth > 0 ? `_${depth}` : "";
        return [
          ...createTimerPushBlock(
            factory,
            timerSuffix,
            sf.getLineAndCharacterOfPosition(stmt.getStart()).line + 1,
            stmt.getText(sf),
            ts.visitEachChild(stmt, (child) => visit(child, sf), context)
          ),
        ];
      });
      depth--;
      return factory.createBlock(statements, true);
    }

    if (ts.isForStatement(node) || ts.isIfStatement(node)) {
      depth++;
      const result = ts.visitEachChild(
        node,
        (child) => visit(child, sf),
        context
      );
      depth--;
      return result;
    }

    // Handle function declarations
    if (ts.isFunctionDeclaration(node)) {
      const originalNode = ts.visitEachChild(
        node,
        (child) => visit(child, sf),
        context
      ) as ts.FunctionDeclaration;

      if (!originalNode.body) return originalNode;

      return factory.updateFunctionDeclaration(
        originalNode,
        originalNode.modifiers,
        originalNode.asteriskToken,
        originalNode.name,
        originalNode.typeParameters,
        originalNode.parameters,
        originalNode.type,
        originalNode.body
      );
    }

    return ts.visitEachChild(node, (child) => visit(child, sf), context);
  }

  return visit;
}

export function transformSourceFileStatements(
  sourceFile: ts.SourceFile,
  visit: (node: ts.Node, sf: ts.SourceFile) => ts.Node,
  factory: ts.NodeFactory
): ts.Statement[] {
  return sourceFile.statements.flatMap((stmt) => {
    if (
      ts.isImportDeclaration(stmt) ||
      ts.isExportDeclaration(stmt) ||
      (ts.isVariableStatement(stmt) &&
        stmt.declarationList.declarations.some((d) =>
          d.name.getText(sourceFile).startsWith("_____")
        ))
    ) {
      return [stmt];
    }

    const timerSuffix = "";
    const visitedStmt = ts.visitNode(stmt, (node) =>
      visit(node, sourceFile)
    ) as ts.Statement;

    return [
      ...createTimerPushBlock(
        factory,
        timerSuffix,
        sourceFile.getLineAndCharacterOfPosition(stmt.getStart()).line + 1,
        stmt.getText(sourceFile),
        visitedStmt
      ),
    ];
  });
}

export function calculateMaxDepth(node: ts.Node): number {
  let max = 0;
  let current = 0;
  const visit = (node: ts.Node) => {
    if (ts.isBlock(node) || ts.isForStatement(node) || ts.isIfStatement(node)) {
      current++;
      max = Math.max(max, current);
      ts.forEachChild(node, visit);
      current--;
    } else {
      ts.forEachChild(node, visit);
    }
  };
  visit(node);
  return max;
}
