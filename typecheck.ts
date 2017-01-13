import * as ts from 'typescript';
import * as _ from 'lodash';
import { scanAllTokens } from 'tslint';

const [,, tsFile] = process.argv;

const options: ts.CompilerOptions = {};
const host = ts.createCompilerHost(options, true);

const program = ts.createProgram([tsFile], options, host);

const checker = program.getTypeChecker();

const source = program.getSourceFile(tsFile);
const scanner = ts.createScanner(
    ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, source.getFullText());

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
  error?: ts.Diagnostic;
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

const nodedAssertions = collectNodes(source, assertions);

let allDiagnostics = ts.getPreEmitDiagnostics(program);

for (const diagnostic of allDiagnostics) {
  const pos = diagnostic.start;

  const nodedAssertion = _.find(nodedAssertions, na => (pos >= na.node.pos && pos <= na.node.end));
  if (nodedAssertion) {
    nodedAssertion.error = diagnostic;
  }
  // let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  //
  // console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
}

let numFailures = 0;
let numSuccesses = 0;
for (const {node, assertion, type, error} of nodedAssertions) {
  const { line, character } = source.getLineAndCharacterOfPosition(node.pos);
  if (assertion.kind === 'error') {
    if (!error) {
      console.error(`${tsFile}:${line}: No error but expected ${assertion.pattern}\n`)
      numFailures++;
    } else {
      const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
      if (message.indexOf(assertion.pattern) === -1) {
        console.error(`${tsFile}:${line}: Expected error\n  ${assertion.pattern}\nbut got:\n  ${message}\n`);
        numFailures++;
      } else {
        numSuccesses++;
      }
    }
  } else if (assertion.kind === 'type') {
    const typeString = checker.typeToString(type);
    if (typeString !== assertion.type) {
      console.error(`${tsFile}:${line}: Expected type\n  ${assertion.type}\nbut got:\n  ${typeString}\n`);
      numFailures++;
    } else {
      numSuccesses++;
    }
  }

  // console.log(assertion);
  // console.log(node.kind, `${node.pos}-${node.end}`, node.getText());
  // console.log(checker.typeToString(type));
  // if (error) {
  //   let message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
  //   console.log('Error:', message);
  // }
  // console.log('---');
}

console.log(`Successes: ${numSuccesses}`);
console.log(`Failures: ${numFailures}`);

process.exit(numFailures);
