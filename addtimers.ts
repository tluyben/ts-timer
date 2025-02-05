import * as ts from "typescript";

function analyzeNestingDepth(node: ts.Node): number {
  let maxDepth = 0;
  let currentDepth = 0;

  function visit(node: ts.Node) {
    if (ts.isBlock(node)) {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
      ts.forEachChild(node, visit);
      currentDepth--;
    } else {
      ts.forEachChild(node, visit);
    }
  }

  visit(node);
  return maxDepth;
}

function createTimerDeclarations(maxDepth: number): ts.Statement[] {
  const factory = ts.factory;
  const declarations: ts.Statement[] = [];

  for (let depth = 0; depth <= maxDepth; depth++) {
    const suffix = depth === 0 ? "" : `_${depth}`;
    declarations.push(
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier(`_____sftimer${suffix}`),
              undefined,
              undefined,
              undefined
            ),
          ],
          ts.NodeFlags.Let
        )
      ),
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier(`_____eftimer${suffix}`),
              undefined,
              undefined,
              undefined
            ),
          ],
          ts.NodeFlags.Let
        )
      )
    );
  }
  return declarations;
}

function createTimingWrapper(
  node: ts.Statement,
  sourceFile: ts.SourceFile,
  depth: number = 0
): ts.Statement[] {
  const factory = ts.factory;
  const timerSuffix = depth > 0 ? `_${depth}` : "";

  return [
    factory.createExpressionStatement(
      factory.createBinaryExpression(
        factory.createIdentifier(`_____sftimer${timerSuffix}`),
        factory.createToken(ts.SyntaxKind.EqualsToken),
        factory.createNewExpression(factory.createIdentifier("Date"), [], [])
      )
    ),
    node,
    factory.createExpressionStatement(
      factory.createBinaryExpression(
        factory.createIdentifier(`_____eftimer${timerSuffix}`),
        factory.createToken(ts.SyntaxKind.EqualsToken),
        factory.createNewExpression(factory.createIdentifier("Date"), [], [])
      )
    ),
    factory.createExpressionStatement(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("_____ptimers"),
          factory.createIdentifier("push")
        ),
        [],
        [
          factory.createObjectLiteralExpression(
            [
              factory.createPropertyAssignment(
                "line",
                factory.createNumericLiteral(
                  sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
                )
              ),
              factory.createPropertyAssignment(
                "code",
                factory.createStringLiteral(node.getText(sourceFile))
              ),
              factory.createPropertyAssignment(
                "start",
                factory.createIdentifier(`_____sftimer${timerSuffix}`)
              ),
              factory.createPropertyAssignment(
                "end",
                factory.createIdentifier(`_____eftimer${timerSuffix}`)
              ),
              factory.createPropertyAssignment(
                "diff",
                factory.createCallExpression(
                  factory.createPropertyAccessExpression(
                    factory.createParenthesizedExpression(
                      factory.createBinaryExpression(
                        factory.createIdentifier(`_____eftimer${timerSuffix}`),
                        factory.createToken(ts.SyntaxKind.MinusToken),
                        factory.createIdentifier(`_____sftimer${timerSuffix}`)
                      )
                    ),
                    factory.createIdentifier("valueOf")
                  ),
                  [],
                  []
                )
              ),
            ],
            true
          ),
        ]
      )
    ),
  ];
}

function createTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const factory = ts.factory;

    return (sourceFile: ts.SourceFile) => {
      // First pass: analyze nesting depth
      const maxDepth = analyzeNestingDepth(sourceFile);
      let currentDepth = 0;

      function visit(node: ts.Node): ts.Node {
        if (ts.isBlock(node)) {
          currentDepth++;
          const statements = (node as ts.Block).statements.flatMap((stmt) => {
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
            return createTimingWrapper(
              stmt as ts.Statement,
              sourceFile,
              currentDepth
            );
          });
          currentDepth--;
          return factory.createBlock(statements, true);
        }

        return ts.visitEachChild(node, visit, context);
      }

      const transformedSourceFile = ts.visitNode(
        sourceFile,
        visit
      ) as ts.SourceFile;

      const preamble = [
        factory.createVariableStatement(
          undefined,
          factory.createVariableDeclarationList(
            [
              factory.createVariableDeclaration(
                factory.createIdentifier("_____ptimers"),
                undefined,
                undefined,
                factory.createArrayLiteralExpression([])
              ),
            ],
            ts.NodeFlags.Const
          )
        ),
        ...createTimerDeclarations(maxDepth),
        factory.createExpressionStatement(
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("process"),
              factory.createIdentifier("on")
            ),
            undefined,
            [
              factory.createStringLiteral("exit"),
              factory.createArrowFunction(
                undefined,
                undefined,
                [],
                undefined,
                factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                factory.createBlock([
                  factory.createExpressionStatement(
                    factory.createCallExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("console"),
                        factory.createIdentifier("log")
                      ),
                      undefined,
                      [factory.createStringLiteral("Performance Measurements:")]
                    )
                  ),
                  factory.createExpressionStatement(
                    factory.createCallExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("console"),
                        factory.createIdentifier("log")
                      ),
                      undefined,
                      [
                        factory.createCallExpression(
                          factory.createPropertyAccessExpression(
                            factory.createIdentifier("JSON"),
                            factory.createIdentifier("stringify")
                          ),
                          undefined,
                          [
                            factory.createIdentifier("_____ptimers"),
                            factory.createNull(),
                            factory.createNumericLiteral(2),
                          ]
                        ),
                      ]
                    )
                  ),
                ])
              ),
            ]
          )
        ),
      ];

      const statements = transformedSourceFile.statements.flatMap((stmt) => {
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
        return createTimingWrapper(stmt as ts.Statement, sourceFile, 0);
      });

      return factory.updateSourceFile(transformedSourceFile, [
        ...preamble,
        ...statements,
      ]);
    };
  };
}

export function addTimers(sourceCode: string): string {
  const sourceFile = ts.createSourceFile(
    "source.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const result = ts.transform(sourceFile, [createTransformer()]);
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
    omitTrailingSemicolon: false,
  });

  return printer.printFile(result.transformed[0]);
}
