import ts from "typescript";
import { createTimerPushBlock } from "./timer-push";
import { findParentStructure } from "./helper";

export function handleReturnStatement(
  node: ts.Node,
  factory: ts.NodeFactory,
  depth: number,
  sourceFile: ts.SourceFile,
  context: ts.TransformationContext
): ts.Statement[] {
  const timerSuffix = depth > 0 ? `_${depth}` : "";

  // Visit the return statement's expression if it exists
  const visitedNode = ts.visitEachChild(
    node,
    (child) =>
      ts.visitNode(child, (node) =>
        ts.visitEachChild(node, (child) => child, context)
      ),
    context
  ) as ts.ReturnStatement;

  //   const returnNode = node;

  const tmpIdentifier = factory.createIdentifier("____tmp");
  const timerBlock = createTimerPushBlock(
    factory,
    timerSuffix,
    sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
    findParentStructure(node).getText(sourceFile),
    undefined,
    false
  );

  const wrappedReturn = factory.createReturnStatement(
    factory.createCallExpression(
      factory.createParenthesizedExpression(
        factory.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          factory.createBlock(
            [
              // Store result in temp variable
              factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                  [
                    factory.createVariableDeclaration(
                      tmpIdentifier,
                      undefined,
                      undefined,
                      visitedNode.getChildAt(1) as ts.Expression
                    ),
                  ],
                  ts.NodeFlags.Const
                )
              ),
              // Timer instrumentation
              ...timerBlock,
              // Return the stored result
              factory.createReturnStatement(tmpIdentifier),
            ],
            true
          )
        )
      ),
      undefined,
      []
    )
  );

  return [wrappedReturn];

  //   return createTimerPushBlock(
  //     factory,
  //     timerSuffix,
  //     sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
  //     findParentStructure(node).getText(sourceFile),
  //     visitedNode,
  //     false
  //   );
}
