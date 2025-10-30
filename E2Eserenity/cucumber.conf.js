const { configure } = require('@serenity-js/core');

configure({
    crew: [
        [ '@serenity-js/serenity-bdd', { outputDirectory: './target/site/serenity' } ],
        [ '@serenity-js/console-reporter', { theme: 'auto' } ]
    ]
});