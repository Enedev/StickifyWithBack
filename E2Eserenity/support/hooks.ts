import { Before, After } from '@cucumber/cucumber';
import { CustomWorld } from './world';

Before(function (this: CustomWorld) {
    // Reset state before each scenario
    this.credentials = undefined;
    this.lastResponse = undefined;
    this.token = undefined;
    this.user = undefined;
});