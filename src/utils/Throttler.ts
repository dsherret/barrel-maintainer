export class Throttler {
    private timeout: NodeJS.Timer | undefined;

    constructor(private readonly delay: number, private readonly action: () => void) {
    }

    run() {
        if (this.timeout != null)
            return;

        this.timeout = setTimeout(() => {
            this.action();
            this.timeout = undefined;
        }, this.delay);
    }
}
