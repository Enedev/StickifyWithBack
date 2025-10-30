import { Before, After } from '@cucumber/cucumber';

Before(async function() {
    // Set up before each scenario
    this.testUser = 'Test User';
});

After(async function() {
    // Clean up after each scenario
});