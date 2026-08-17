// @ts-check

import { ImplementationError } from "./errors";

/**
 * Substitutes {0}, {1}, ... placeholders in a template with args.
 *
 * @param {string} template
 * @param {*[]} args
 * @returns {string}
 * @throws {ImplementationError} if the number of args length doesn't match the number of placeholders in the template.
 */
export function formatTemplate(template, args) {
    const usedIndices = new Set();

    const result = template.replace(/\{(\d+)\}/g, (_, indexString) => {
        const index = Number(indexString);
        usedIndices.add(index);

        if (index >= args.length) {
            throw new ImplementationError(`Number of arguments given for template is less than the number of placeholder position present.\nTemplate: ${template}.\nExpected argument length: ${index + 1}\nGiven arguments length: ${args.length}.`);
        }

        return String(args[index]);
    });

    if (args.length > usedIndices.size) {
        throw new ImplementationError(`Number of arguments given for template is more than the number of placeholder position present.\nTemplate: ${template}.\nExpected argument length: ${usedIndices.size}\nGiven arguments length: ${args.length}.`);
    }

    return result;
}