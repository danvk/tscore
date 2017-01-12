import * as ts from 'typescript';
import * as _ from 'lodash';
import { SyntaxWalker } from 'tslint';
import { scanAllTokens } from 'tslint';

class TypeCheckWalker extends SyntaxWalker {
  protected visitSingleLineCommentTrivia(node: ts.Node) {
    console.log('single-line comment node');
    console.log(node.getFullText());
  }

  protected visitMultiLineCommentTrivia(node: ts.Node) {
    console.log('multi-line comment node');
    console.log(node.getFullText());
  }

  protected visitNode(node: ts.Node) {
    console.log(node.kind, node.getText().slice(0, 100));
    switch (node.kind) {
      case ts.SyntaxKind.SingleLineCommentTrivia:
        this.visitSingleLineCommentTrivia(node);
        break;

      case ts.SyntaxKind.MultiLineCommentTrivia:
        this.visitMultiLineCommentTrivia(node);
        break;

      default:
        super.visitNode(node);
    }
  }
}

const walker = new SyntaxWalker();

const [,, tsFile] = process.argv;

const options: ts.CompilerOptions = {};
const host = ts.createCompilerHost(options, true);

const program = ts.createProgram([tsFile], options, host);

// console.log(program);

const checker = program.getTypeChecker();

const source = program.getSourceFile(tsFile);
const scanner = ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, source.getFullText());

interface TypeAssertion {
  kind: 'type';
  type: string;
  pos: number;
}

interface ErrorAssertion {
  kind: 'error';
  pattern: string;
  pos: number;
}

type Assertion = TypeAssertion | ErrorAssertion;

interface NodedAssertion {
  assertion: Assertion;
  node: ts.Node;
  type: ts.Type;
}

const assertions = [] as Assertion[];
scanAllTokens(scanner, () => {
  if (scanner.getToken() === ts.SyntaxKind.SingleLineCommentTrivia) {
    const commentText = scanner.getTokenText();
    const m = commentText.match(/^\/\/ \$Expect(Type|Error) (.*)/);
    if (!m) return;

    const pos = scanner.getTokenPos() + scanner.getTokenText().length + 1;

    const [, kind, text] = m;
    if (kind === 'Type') {
      assertions.push({ kind: 'type', type: text, pos });
    } else if (kind === 'Error') {
      assertions.push({ kind: 'error', pattern: text, pos });
    }
  }
});

// console.log(assertions);

function collectNodes(node: ts.Node, assertions: Assertion[], nodedAssertions: NodedAssertion[] = []): NodedAssertion[] {
  const pos = node.getStart();

  const assertion = _.find(assertions, {pos});
  if (assertion && node.kind === ts.SyntaxKind.ExpressionStatement) {
    const type = checker.getTypeAtLocation(node.getChildren()[0]);
    nodedAssertions.push({ node, assertion, type });
  }

  ts.forEachChild(node, child => {
    collectNodes(child, assertions, nodedAssertions)
  });
  return nodedAssertions;
}

// console.log(collectNodes(source, assertions));

for (const node of collectNodes(source, assertions)) {
  console.log(node.assertion);
  console.log(node.node.kind, node.node.getText());
  console.log(checker.typeToString(node.type));
  console.log('---');
}

// for (const assertion of assertions) {
//   if (assertion.kind === 'type') {
//       const {pos, type} = assertion;
//       checker.getTypeAtLocation()
//   }
// }

// const visitor = new TypeCheckWalker();
// visitor.walk(source);

// console.log()
