import ts from "typescript";

/**
 * Finds the closest parent structure (function, lambda, or source file) of a given node
 * @param node The node to find the parent structure for
 * @returns The parent function, arrow function, or source file node
 */
export function findParentStructure(node: ts.Node): ts.Node {
  let current = node;

  while (current.parent) {
    // console.log(ts.SyntaxKind[current.kind]);

    // Stop at function declarations
    if (ts.isFunctionDeclaration(current.parent)) {
      return current;
    }

    // Stop at arrow functions
    if (ts.isArrowFunction(current.parent)) {
      return current;
    }

    // Stop at source file (root)
    if (ts.isSourceFile(current.parent)) {
      return current;
    }

    if (ts.isBlock(current.parent)) {
      return current;
    }

    current = current.parent;
  }

  // If no parent is found (shouldn't happen in valid TS/JS), return the original node
  return current;
}
