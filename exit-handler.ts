import ts from "typescript";

export function createExitHandler(factory: ts.NodeFactory): ts.Statement {
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

  return factory.createExpressionStatement(
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("process"),
        factory.createIdentifier("on")
      ),
      undefined,
      [factory.createStringLiteral("exit"), exitHandler]
    )
  );
}
