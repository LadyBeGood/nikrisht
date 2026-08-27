
import { elements } from "./elements.js";

export const colors = {
    red: (text) => 
        `<span class="console-red">${text}</span>`,
    yellow: (text) => 
        `<span class="console-yellow">${text}</span>`,
    blue: (text) => 
        `<span class="console-blue">${text}</span>`,
    bold: (text) => 
        `<span class="console-bold">${text}</span>`,
    dim: (text) => 
        `<span class="console-dim">${text}</span>`,
}


export const logger = (message) => {
    elements.screenDisplay.innerHTML += message + "\n";
    console.log(JSON.stringify(elements.screenDisplay.innerHTML));
};


export function escape(text) {
    return (
        String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;")
    );
}