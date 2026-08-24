### Loops
Loop is a type sensitive construct. Therefore the behaviour of the loop depends upon the type of the data following it.

#### Loop statement
Loop keyword not followed by any data type loops infinitely:
```
loop
    write "hello"

    # loops infinitely

    # hello
    # hello
    # hello
    # ...
```

Loop keyword followed by a boolean loops infinitely if `yes`, doesn't loop if `no`:
```
loop yes
    write "hello"
    
    # loops infinitely

    # hello
    # hello
    # hello
    # ...


loop no
    write "hello"

    # does not loop
```

Loop keyword followed by a number loops that many times:
```
loop 5
    write "hello"

    # loops 5 times

    # hello
    # hello
    # hello
    # hello
    # hello
```

Loop keyword followed by a string or structure loops `count iterable` times:
```
loop "uki"
    write "hello"

    # loops 3 times 
    # because there are 3 characters in "uki": 
    # "u", "k" and "i"

    # hello
    # hello
    # hello


loop [id = 567, "orange"] 
    write "hello"

    # loops 2 times 
    # because there are 2 entries inside the structure:
    # `id = 567` and `"orange"`

    # hello
    # hello
```

Loop keyword followed by a procedure loops till the procedure returns a value. The loop statement internally calls the procedure:
```
loop {return 0}
    write "hello"

    # loops infinitely

    # hello
    # hello
    # hello
    # ...

loop {write "Hello, World"}
    write "hello"

    # Does not loop but logs "Hello, World" 
    # because the prodecure was called once internally by the loop
```

This can be used with closures to create iterator based loops:
```
range start, end, gap: 1 = {
    current = start
    step = when (start <= end) gap else -gap

    return {
        when (step > 0 & current > end) | (step < 0 & current < end)
            return
        
        value = current
        current ~ current + step
        return value
    }
}

loop range 1, 9, 3
    write "hello"

    # loops 3 times
    # the values returned by the closure returned by the range procedure are:
    # 1, 4 and 7

    # "hello"
    # "hello"
    # "hello"
```

Utkrisht provides a neat literal syntax for creating sunch ranges:
```
loop 1..9..3
    write "hello"

    # behaves similarly to the custom `range` procedure

    # "hello"
    # "hello"
    # "hello"

# By default, gap is equal to 1 and end is inclusive. If you want to exclude the end, use `..<` or `..>` instead of `..`
loop 1..<4
    write "hello"

    # loops 3 times
    # the values returned by the closure returned by the range literal are:
    # 1, 2 and 3 

    # "hello"
    # "hello"
    # "hello"

loop 4..>1
    write "hello"

    # loops 3 times
    # the values returned by the closure returned by the range literal are:
    # 4, 3, and 2

    # "hello"
    # "hello"
    # "hello"
```

with statement declares a loop variable 
```
loop 5 with i 
    write i

    # here 
    # `i` is the loop variable
    # `i` starts at 1 and ends at 5

    # 1
    # 2
    # 3
    # 4
    # 5

loop 10..<20..2 with i
    write i

    # 10
    # 12
    # 14
    # 16
    # 18

fruits = ["apple", "mango", "banana"]

loop fruits with fruit
    write "I love |fruit|"
    
    # I love apple
    # I love mango
    # I love banana


loop fruits with [i, fruit]
    write "|i|. I love |fruit|"
    
    # 1. I love apple
    # 2. I love mango 
    # 3. I love banana


loop "hi" with [index, character]
    write "The character at position |index| is |character|"

    # The character at position 1 is h
    # The character at position 2 is i
```


`exit` statement, exits the loop
```
loop 50 with i
    when i = 4
        exit
    write i
    
    # 1 
    # 2 
    # 3
```

`skip` statement, skips the iteration
``` 
loop 4 with i
    when i = 2
        skip
    write i
    
    # 1
    # 3
    # 4

```

Iteration variables can be used as labels in nested loops for skip and exit statements
```
loop 3 with i
    loop 3 with j
        when i = 2
            skip i
        write "|i| |j|"
    
    # 1 1
    # 1 2
    # 1 3
    # 3 1
    # 3 2
    # 3 3
```

#### Loop comprehension
Multiline
```
doubled = [
    loop numbers with number
        number * 2
]
```

Single line
```
doubled = [loop (numbers with number) number * 2]
```

