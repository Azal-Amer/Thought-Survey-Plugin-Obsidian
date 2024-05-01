// make an object with a seed as a property, that logs the seed on init
//
import { hex_sha1 } from "./sha1";

export function hexToDecimal(seed: string): number[] {
	const hexString = hex_sha1(seed);
    console.log("hexString: ", hexString);
    console.log("seed: ", seed);
	if (!/^[0-9a-fA-F]+$/.test(hexString)) {
		throw new Error("Invalid hexadecimal input.");
	}
	// Convert each hexadecimal digit to a decimal number and store in an array
	const decimalConv = hexString
		.split("")
		.map((hexDigit) => parseInt(hexDigit, 16));
	// normalize the above, divide by 16
	return decimalConv.map((decimalDigit) => decimalDigit / 16);
}
export class RNG {
    private seed: string;
    randomNumbers: number[];
    nextRandom: number;
    nextRandomIndex: number;

    constructor(seed: string) {
        this.seed = seed;
        this.randomNumbers=hexToDecimal(seed);
        console.log("Random Numbers", this.randomNumbers);
        this.nextRandom = this.randomNumbers[0];
        this.nextRandomIndex = 0;
    }
    next(): number {
        const rawNext = this.nextRandom;
        this.nextRandomIndex = this.nextRandomIndex+1; // Correct for JavaScript's number representation
        this.nextRandom = this.randomNumbers[this.nextRandomIndex];
        return rawNext;
    }
    // if I ask for the next number, I should get the next number in the array each time
}

