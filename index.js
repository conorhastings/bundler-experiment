const program = require('commander');
const fs = require('fs');
const parser = require('acorn');
const escodegen = require('escodegen');
const path = require('path');
const mkdirp = require('mkdirp');

function parseTree(filePath, bundleArray = [], alreadyImported = new Set()) {
  const file = fs.readFileSync(filePath, 'utf8');
  const ast = parser.parse(file, { sourceType: 'module'});
  ast.body.forEach(node => {
    if (node.type === 'ImportDeclaration') {
      const fp = filePath.split('/').slice(0, filePath.split('/').length - 1).join('/');
      const fileLocation = `${node.source.value}.js`;
      const location = path.resolve(fp, fileLocation);
      if (!alreadyImported.has(location)) {
        alreadyImported.add(location);
        const code = parseTree(location, [], alreadyImported);
        bundleArray.push(code);
      }
    } 
    else if (node.type === 'ExportDefaultDeclaration') {
      const name = filePath.split('/')[filePath.split('/').length - 1].replace('.js', '');
      const code = escodegen.generate(node.declaration);
      bundleArray.push(`var ${name} = ${code};`);
    }
    else {
      const code = escodegen.generate(node);
      bundleArray.push(code);
    }
  });
  return bundleArray.join('');
}

program
  .option('-e, --entry [value]', 'entry point')
  .option('-o, --output [value]', 'output')
  .parse(process.argv);

if (!program.entry || !program.output) {
  throw new Error('must have entry and output');
}
else {
  const code = parseTree(program.entry);
  mkdirp(program.output.split('/').slice(0, program.output.split('/').length - 1).join('/'), function(err) {
    if (!err) {
      fs.writeFile(program.output, code, err => {
        if(err) {
          throw new Error('could not write output');
        } 
      });
    }
    else {
      throw new Error('could not write output');
    }
  });
}
