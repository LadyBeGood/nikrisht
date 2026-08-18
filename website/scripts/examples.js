
export const examples = {
    "prime-finder": `
# Checks if a number is prime
func isPrime(number) {
    if (number < 2) {
        return false;
    }

    loop (2..<number with i) {
        if (remainder(number, i) == 0) {
            return false;
        }
    }

    return true;
}

write(isPrime(117));
`,

    "merge-sort": `
# Sorts an array using Merge Sort algorithm
func mergeSort(array) {
    # Base case, an array of 0 or 1 elements is already sorted
    if (count(array) <= 1) {
        return array;
    }

    # Split the array into two halves
    const middle = floor(count(array) / 2);

    # Sort both halves, recursively
    const left = mergeSort(slice(array, 1, middle));
    const right = mergeSort(slice(array, middle + 1, count(array)));

    # Merge the two sorted halves
    const result = [];
    var i = 1;
    var j = 1;

    loop (i <= count(left) & j <= count(right)) {
        if (left[i] <= right[j]) {
            put(result, left[i]);
            i = i + 1;
        } else {
            put(result, right[j]);
            j = j + 1;
        }
    }

    # Add any remaining elements from the left half.
    loop (i <= count(left)) {
        put(result, left[i]);
        i = i + 1;
    }

    # Add any remaining elements from the right half.
    loop (j <= count(right)) {
        put(result, right[j]);
        j = j + 1;
    }

    return result;
}

write(mergeSort([10, -1, 2, 5, 0, 9]));

`,

    "fibonacci": `
const cache = {};

func fibonacci(number) {
    if (cache[number] != null) {
        return cache[number];
    }

    if (number <= 1) {
        return number;
    }

    cache[number] = fibonacci(number - 1) + fibonacci(number - 2);
    return cache[number];
}

write(fibonacci(8));

`

}


for (const example of Object.keys(examples)) {
    examples[example] = examples[example].replaceAll("    ", "\t");
}
