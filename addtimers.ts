import * as ts from "typescript";

function createTransformer(
  verbose: boolean
): ts.TransformerFactory<ts.SourceFile> {
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
                factory.createIdentifier("_____timerPush"),
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

      // Create _____timerPush function
      const timerPushFunction = factory.createFunctionDeclaration(
        undefined,
        undefined,
        factory.createIdentifier("_____timerPush"),
        undefined,
        [
          factory.createParameterDeclaration(
            [],
            undefined,
            factory.createIdentifier("params"),
            undefined,
            factory.createTypeLiteralNode([
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier("line"),
                undefined,
                factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
              ),
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier("code"),
                undefined,
                factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
              ),
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier("start"),
                undefined,
                factory.createTypeReferenceNode("Date", undefined)
              ),
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier("end"),
                undefined,
                factory.createTypeReferenceNode("Date", undefined)
              ),
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier("diff"),
                undefined,
                factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
              ),
            ])
          ),
        ],
        undefined,
        factory.createBlock(
          [
            factory.createIfStatement(
              verbose ? factory.createTrue() : factory.createFalse(),
              factory.createBlock(
                [
                  factory.createExpressionStatement(
                    factory.createCallExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("_____ptimers"),
                        factory.createIdentifier("push")
                      ),
                      undefined,
                      [factory.createIdentifier("params")]
                    )
                  ),
                ],
                true
              ),
              factory.createBlock(
                [
                  factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList(
                      [
                        factory.createVariableDeclaration(
                          factory.createIdentifier("i"),
                          undefined,
                          undefined,
                          factory.createCallExpression(
                            factory.createPropertyAccessExpression(
                              factory.createIdentifier("_____ptimers"),
                              factory.createIdentifier("findIndex")
                            ),
                            undefined,
                            [
                              factory.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                  factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    factory.createIdentifier("x"),
                                    undefined,
                                    factory.createKeywordTypeNode(
                                      ts.SyntaxKind.AnyKeyword
                                    )
                                  ),
                                ],
                                undefined,
                                factory.createToken(
                                  ts.SyntaxKind.EqualsGreaterThanToken
                                ),
                                factory.createBinaryExpression(
                                  factory.createPropertyAccessExpression(
                                    factory.createIdentifier("x"),
                                    factory.createIdentifier("line")
                                  ),
                                  factory.createToken(
                                    ts.SyntaxKind.EqualsEqualsEqualsToken
                                  ),
                                  factory.createPropertyAccessExpression(
                                    factory.createIdentifier("params"),
                                    factory.createIdentifier("line")
                                  )
                                )
                              ),
                            ]
                          )
                        ),
                      ],
                      ts.NodeFlags.Const
                    )
                  ),
                  factory.createIfStatement(
                    factory.createBinaryExpression(
                      factory.createIdentifier("i"),
                      factory.createToken(ts.SyntaxKind.LessThanToken),
                      factory.createNumericLiteral("0")
                    ),
                    factory.createExpressionStatement(
                      factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("_____ptimers"),
                          factory.createIdentifier("push")
                        ),
                        undefined,
                        [factory.createIdentifier("params")]
                      )
                    ),
                    factory.createBlock(
                      [
                        factory.createExpressionStatement(
                          factory.createBinaryExpression(
                            factory.createPropertyAccessExpression(
                              factory.createElementAccessExpression(
                                factory.createIdentifier("_____ptimers"),
                                factory.createIdentifier("i")
                              ),
                              factory.createIdentifier("diff")
                            ),
                            factory.createToken(ts.SyntaxKind.PlusEqualsToken),
                            factory.createPropertyAccessExpression(
                              factory.createIdentifier("params"),
                              factory.createIdentifier("diff")
                            )
                          )
                        ),
                        factory.createExpressionStatement(
                          factory.createBinaryExpression(
                            factory.createPropertyAccessExpression(
                              factory.createElementAccessExpression(
                                factory.createIdentifier("_____ptimers"),
                                factory.createIdentifier("i")
                              ),
                              factory.createIdentifier("end")
                            ),
                            factory.createToken(ts.SyntaxKind.EqualsToken),
                            factory.createPropertyAccessExpression(
                              factory.createIdentifier("params"),
                              factory.createIdentifier("end")
                            )
                          )
                        ),
                      ],
                      true
                    )
                  ),
                ],
                true
              )
            ),
          ],
          true
        )
      );

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
        // Add _____timerPush function
        timerPushFunction,
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
              factory.createIdentifier("_____timerPush"),
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
