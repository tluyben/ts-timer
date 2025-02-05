import * as ts from "typescript";

function createTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
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
            factory.createExpressionStatement(
              factory.createBinaryExpression(
                factory.createIdentifier(`_____sftimer${timerSuffix}`),
                factory.createToken(ts.SyntaxKind.EqualsToken),
                factory.createNewExpression(
                  factory.createIdentifier("Date"),
                  [],
                  []
                )
              )
            ),
            ts.visitEachChild(stmt, (child) => visit(child, sf), context),
            factory.createExpressionStatement(
              factory.createBinaryExpression(
                factory.createIdentifier(`_____eftimer${timerSuffix}`),
                factory.createToken(ts.SyntaxKind.EqualsToken),
                factory.createNewExpression(
                  factory.createIdentifier("Date"),
                  [],
                  []
                )
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
                          sf.getLineAndCharacterOfPosition(stmt.pos).line + 1
                        )
                      ),
                      factory.createPropertyAssignment(
                        "code",
                        factory.createStringLiteral(stmt.getText(sf))
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
                                factory.createIdentifier(
                                  `_____eftimer${timerSuffix}`
                                ),
                                factory.createToken(ts.SyntaxKind.MinusToken),
                                factory.createIdentifier(
                                  `_____sftimer${timerSuffix}`
                                )
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

      // Handle function declarations by wrapping their body with timing code
      if (ts.isFunctionDeclaration(node)) {
        const timerSuffix = "";
        const originalNode = ts.visitEachChild(
          node,
          (child) => visit(child, sf),
          context
        ) as ts.FunctionDeclaration;

        if (!originalNode.body) return originalNode;

        const newBody = factory.createBlock([
          factory.createExpressionStatement(
            factory.createBinaryExpression(
              factory.createIdentifier(`_____sftimer${timerSuffix}`),
              factory.createToken(ts.SyntaxKind.EqualsToken),
              factory.createNewExpression(
                factory.createIdentifier("Date"),
                [],
                []
              )
            )
          ),
          ...originalNode.body.statements,
          factory.createExpressionStatement(
            factory.createBinaryExpression(
              factory.createIdentifier(`_____eftimer${timerSuffix}`),
              factory.createToken(ts.SyntaxKind.EqualsToken),
              factory.createNewExpression(
                factory.createIdentifier("Date"),
                [],
                []
              )
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
                        sf.getLineAndCharacterOfPosition(node.pos).line + 1
                      )
                    ),
                    factory.createPropertyAssignment(
                      "code",
                      factory.createStringLiteral(node.getText(sf))
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
                              factory.createIdentifier(
                                `_____eftimer${timerSuffix}`
                              ),
                              factory.createToken(ts.SyntaxKind.MinusToken),
                              factory.createIdentifier(
                                `_____sftimer${timerSuffix}`
                              )
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
        ]);

        return factory.updateFunctionDeclaration(
          originalNode,
          originalNode.modifiers,
          originalNode.asteriskToken,
          originalNode.name,
          originalNode.typeParameters,
          originalNode.parameters,
          originalNode.type,
          newBody
        );
      }

      return ts.visitEachChild(node, (child) => visit(child, sf), context);
    }

    return (sourceFile: ts.SourceFile) => {
      // Analyze max depth
      const maxDepth = ((node: ts.Node) => {
        let max = 0;
        let current = 0;
        const visit = (node: ts.Node) => {
          if (
            ts.isBlock(node) ||
            ts.isForStatement(node) ||
            ts.isIfStatement(node)
          ) {
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
      })(sourceFile);

      // Create preamble
      const preamble: ts.Statement[] = [
        // Timer array
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
      ];

      // Create timer variables for each depth
      for (let i = 0; i <= maxDepth - 1; i++) {
        const suffix = i === 0 ? "" : `_${i}`;
        preamble.push(
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

      // Add exit handler
      const exitHandler = factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createBlock(
          [
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
          ],
          true
        )
      );

      preamble.push(
        factory.createExpressionStatement(
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("process"),
              factory.createIdentifier("on")
            ),
            undefined,
            [factory.createStringLiteral("exit"), exitHandler]
          )
        )
      );

      // Transform source file statements
      const transformedStatements = sourceFile.statements.flatMap((stmt) => {
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
          factory.createExpressionStatement(
            factory.createBinaryExpression(
              factory.createIdentifier(`_____sftimer${timerSuffix}`),
              factory.createToken(ts.SyntaxKind.EqualsToken),
              factory.createNewExpression(
                factory.createIdentifier("Date"),
                [],
                []
              )
            )
          ),
          visitedStmt,
          factory.createExpressionStatement(
            factory.createBinaryExpression(
              factory.createIdentifier(`_____eftimer${timerSuffix}`),
              factory.createToken(ts.SyntaxKind.EqualsToken),
              factory.createNewExpression(
                factory.createIdentifier("Date"),
                [],
                []
              )
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
                        sourceFile.getLineAndCharacterOfPosition(stmt.pos)
                          .line + 1
                      )
                    ),
                    factory.createPropertyAssignment(
                      "code",
                      factory.createStringLiteral(stmt.getText(sourceFile))
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
                              factory.createIdentifier(
                                `_____eftimer${timerSuffix}`
                              ),
                              factory.createToken(ts.SyntaxKind.MinusToken),
                              factory.createIdentifier(
                                `_____sftimer${timerSuffix}`
                              )
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
        ] as ts.Statement[];
      });

      return factory.updateSourceFile(sourceFile, [
        ...preamble,
        ...transformedStatements,
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
