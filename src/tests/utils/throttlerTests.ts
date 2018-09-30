import { expect } from "chai";
import { Throttler, asyncTimeout } from "./../../utils";

describe("Throttler", () => {
    describe("#run()", () => {
        it("should only run once within the throttle time", async () => {
            let increment = 0;
            const throttler = new Throttler(50, () => increment++);
            for (let i = 0; i < 10; i++)
                throttler.run();
            await asyncTimeout(100);
            for (let i = 0; i < 10; i++)
                throttler.run();
            await asyncTimeout(100);
            throttler.run();
            expect(increment).to.equal(2); // final throttle should not have executed yet
        });
    });
});
