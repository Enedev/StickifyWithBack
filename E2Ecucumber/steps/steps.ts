import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';
import { Login } from '../tasks/login';
import { SignUp } from '../tasks/signUp';



// Steps duplicados eliminados. Usar solo los steps de common.steps.ts y los steps específicos de cada acción.
