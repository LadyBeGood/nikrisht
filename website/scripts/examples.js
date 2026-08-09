
export const examples = {
    "prime-finder": `
# Checks if a number is prime
is-prime number = {
    when number < 2
        return false

    loop 2..<number with i
        when remainder number, i = 0
            return false

    return true
}

write is-prime 117

`,

    "merge-sort": `
# Sorts an array using Merge Sort algorithm.
merge-sort array = {
    # Base case, an array of 0 or 1 elements is already sorted
    when count array <= 1
        return array

    # Split
    middle = floor (count array) / 2
    left = slice array, 1, middle
    right = slice array, middle + 1

    # Merges two already sorted arrays into a single sorted array.
    merge left, right = {
        result = []
     
        i = 1  # Pointer for left array
        j = 1  # Pointer for right array
     
        loop i <= count left & j <= count right
            when left.(i) < right.(j)
                insert result, left.(i)
                i ~ i + 1
            else
                insert result, right.(j)
                j ~ j + 1
     
        # Concatenate any leftover elements 
        # (one array might finish before the other)
        return [...result, ...(slice left, i), ...(slice right, j)]
    }

    # Merge
    return merge (merge-sort left), merge-sort right
}


write merge-sort [10, -1, 2, 5, 0, 9]

`,

    "fibonacci": `
fibonacci number = {
    when has cache, number
        return cache.(number)
    
    when number <= 1
        return number
    
    cache.(number) = (fibonacci number - 1) + fibonacci number - 2
    return cache.(number)
}

write fibonacci 8

`

}


for (const example of Object.keys(examples)) {
    examples[example] = examples[example].replaceAll("    ", "\t");
}
