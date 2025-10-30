import { World, setWorldConstructor } from '@cucumber/cucumber';

export class CustomWorld extends World {
    public credentials?: { username: string; password: string; email: string };
    public lastResponse?: any;
    public token?: string;
    public user?: any;

    constructor(options: any) {
        super(options);
        this.credentials = undefined;
        this.lastResponse = undefined;
        this.token = undefined;
        this.user = undefined;
    }
}

setWorldConstructor(CustomWorld);