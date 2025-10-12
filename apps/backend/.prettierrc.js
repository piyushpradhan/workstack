module.exports = {
    // Basic formatting
    semi: true,
    singleQuote: false,
    quoteProps: 'as-needed',
    trailingComma: 'es5',

    // TypeScript specific
    parser: 'typescript',

    // Code style
    tabWidth: 2,
    useTabs: false,
    printWidth: 80,
    endOfLine: 'lf',

    // Object and array formatting
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',

    // Import organization
    importOrder: ['^@/(.*)$', '^[./]'],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,

    // TypeScript specific formatting
    typescript: {
        semi: true,
        singleQuote: false,
        trailingComma: 'es5',
    },
};
