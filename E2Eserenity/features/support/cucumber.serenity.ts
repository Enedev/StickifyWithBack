import { AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';

setDefaultTimeout(60000);

BeforeAll(async () => {
    // Setup global configuration if needed
});

AfterAll(async () => {
    // Cleanup if needed
});