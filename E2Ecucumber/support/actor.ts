export class Actor {
  name: string;
  private abilities: Map<string, any> = new Map();
  lastResponse: any = undefined;

  constructor(name: string) {
    this.name = name;
  }

  whoCan(key: string, ability: any) {
    this.abilities.set(key, ability);
    return this;
  }

  abilityTo<T>(key: string): T {
    return this.abilities.get(key) as T;
  }

  async attemptsTo(task: { performAs: (actor: Actor) => Promise<any> }) {
    return task.performAs(this);
  }
}
