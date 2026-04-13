export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.ImportDeclaration).forEach(path => {
    const importPath = path.node.source.value;

    // Ignore node_modules and already having extension
    if (
      importPath.startsWith('.') &&
      !importPath.endsWith('.js') &&
      !importPath.endsWith('.json')
    ) {
      path.node.source.value = importPath + '.js';
    }
  });

  return root.toSource();
}