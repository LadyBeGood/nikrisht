
import { elements } from "../elements.js";

const exampleFiles = ["prime", "frequencies", "fibonacci", "merge-sort", "flatten"];

export const examples = {}

for (const exampleFile of exampleFiles) {
    const option = document.createElement("option");
    option.value = exampleFile;
    option.selected = exampleFile === "prime-finder";
    option.innerText = exampleFile[0].toUpperCase() + exampleFile.replaceAll("-", " ").slice(1);
    elements.examples.appendChild(option);

    examples[exampleFile] = await (await fetch("./documentation/examples/" + exampleFile + ".nki")).text();
}

for (const example of Object.keys(examples)) {
    examples[example] = examples[example].replaceAll("    ", "\t");
}
