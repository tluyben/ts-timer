import { Project } from "ts-morph";

export function addAny(sourceCode: string) {
  const project = new Project();
  const sourceFile = project.createSourceFile("temp.ts", sourceCode, {overwrite: true});

  // Add :any to function parameters
  sourceFile.getFunctions().forEach((func) => {
    func.getParameters().forEach((param) => {
      if (!param.getTypeNode()) param.setType("any");
    });
    if (!func.getReturnTypeNode()) func.setReturnType("any");
  });

  // Add :any to variables
  sourceFile.getVariableDeclarations().forEach((variable) => {
    if (!variable.getTypeNode()) variable.setType("any");
  });

  // Add :any to class properties
  sourceFile.getClasses().forEach((cls) => {
    cls.getProperties().forEach((prop) => {
      if (!prop.getTypeNode()) prop.setType("any");
    });

    // Add :any to class methods
    cls.getMethods().forEach((method) => {
      method.getParameters().forEach((param) => {
        if (!param.getTypeNode()) param.setType("any");
      });
      if (!method.getReturnTypeNode()) method.setReturnType("any");
    });
  });

  return sourceFile.getFullText();
}

// addAny("test.js");
