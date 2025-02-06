import ts from "typescript";

export function createTimerPushBlock(
  factory: ts.NodeFactory,
  timerSuffix: string,
  line: number,
  code: string,
  children: ts.Statement | undefined,
  start = true
): ts.Statement[] {
  let block: ts.Statement[] = [
    factory.createExpressionStatement(
      factory.createBinaryExpression(
        factory.createIdentifier(`_____eftimer${timerSuffix}`),
        factory.createToken(ts.SyntaxKind.EqualsToken),
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier("performance"),
            factory.createIdentifier("now")
          ),
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
                factory.createNumericLiteral(line)
              ),
              factory.createPropertyAssignment(
                "code",
                factory.createStringLiteral(code)
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
  if (children) {
    block.unshift(children);
  }
  if (start) {
    block.unshift(
      factory.createExpressionStatement(
        factory.createBinaryExpression(
          factory.createIdentifier(`_____sftimer${timerSuffix}`),
          factory.createToken(ts.SyntaxKind.EqualsToken),
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("performance"),
              factory.createIdentifier("now")
            ),
            [],
            []
          )
        )
      )
    );
  }
  return block;
}
