#!/usr/bin/env node

// @ts-check

import "../interpreter/types.js";
import { runFile } from "./runFile.js";


export async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.error("Usage: nki <input.nki>");
        process.exit(1);
    }

    runFile(args[0]);
}


main()
