import { readFileSync } from "fs";
import { join as pjoin } from "path";
import { stem } from "stemr";

const TEST_WORD = null;

describe("porter2", () => {
  const input = readFileSync(pjoin(__dirname, "input.txt")).toString().split("\n");
  const output = readFileSync(pjoin(__dirname, "output.txt")).toString().split("\n");

  input.forEach((a, i) => {
    if (TEST_WORD !== null && TEST_WORD !== a) {
      return;
    }
    const b = output[i];
    it(`${a} => ${b}`, () => {
      expect(stem(a)).toBe(b);
    });
  });
});
