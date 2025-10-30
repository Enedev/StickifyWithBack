import { apiSignUp } from './login';

/**
 * Create a user using the API sign-up endpoint.
 * Returns the superagent response.
 */
export async function createUser(username: string, email: string, password: string) {
    return apiSignUp(username, email, password);
}

// The older cucumber step placeholders were removed in favour of programmatic tasks
// used by step definitions under ../steps.