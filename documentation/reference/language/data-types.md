### Data types
Utkrisht has **5 data types**.

| Data Type     | Passed by | Clonable | Accessible | Mutable | Callable | Hashable          |
|---------------|-----------|----------|------------|---------|----------|-------------------|
| **String**    | Value     | Yes      | Yes        | No      | No       | Yes               |
| **Number**    | Value     | Yes      | No         | No      | No       | Yes<sup>[1]</sup> |
| **Boolean**   | Value     | Yes      | No         | No      | No       | Yes               |
| **Procedure** | Reference | No       | No         | No      | Yes      | Yes               |
| **Structure** | Reference | Yes      | Yes        | Yes     | No       | Yes               |

> [!NOTE]  
> [1] All numbers including `nan` are hashable and can be used as keys. 
> Structure uses the algorithm [SameValueZero](https://tc39.github.io/ecma262/#sec-samevaluezero) to test keys for equivalnce. 
> So here `nan` is considered equal to `nan`.



#### String
Strings are used to store textual data. 

Strings can be created using double quotes:
```
# Single line strings
"This is a single line string."

# Multi line string
"
    This is a multiline string.
    * These strings are allowed to span multiple lines.
    * They need to be properly indented.
    * Indentation spaces, spaces and the newline after starting quote and the newline after ending quote are all ignored.
"
```

To get the number of characters in a string, use the count procedure:
```
count "hi"          # 2
count "goodbye"     # 7
count ""            # 0
```

To get a character at a specific position, use `.` operator. Indexing starts from **1**:
```
"webapp".1        # w
"webapp".4        # a
```

Strings are immutable and cannot be changed:
```
name = "uki"
name.1 = "n"    # Error
```

Strings allow you to embed expressions inside them, by wrapping them in `|`...`|`:
```
name = "Jane"
age = 20

write "My name is |name|, I am |age| years old."  
      # My name is Jane, I am 20 years old.
      # Note how age, a number, was automatically converted to string for embedding.
```

Special characters
| Character | Description     |
|-----------|-----------------|
| `\n`      | New Line        |
| `\r`      | Carriage Return |
| `\"`      | Quote           |
| `\\`      | Backslash       |
| `\t`      | Tab             |

A string is represented internally a sequence of UTF-16 code units, identical to JavaScript strings, and thus share the same quirks.
```
write count "😼"       # 2
write "😼".1           # \ud83d

write count "é"        # 1 (é)
write count "é"        # 2 (e and "́")
write "é" = "é"        # no (no normalization)

write count "👨‍👩‍👧‍👦"       # 11
```

#### Number
Number is represented in the double-precision 64-bit floating point format (IEEE 754), just like JavaScript's number type.
```
123            # one hundred and twenty three
123.0          # same as above

0              # zero
-0             # same as above

infinity
-infinity    
1 / 0          # infinity
-1 / 0         # -infinity
1 / -0         # -infinity
-1 / -0        # infinity

nan                   # stands for "not a number", but this is also a number 
-nan                  # same as above
0 / 0                 # nan
-0 / 0                # nan
0 / -0                # nan
-0 / -0               # nan
infinity / infinity   # nan
infinity - infinity   # nan
0 * infinity          # nan
-0 * infinity         # nan
```

```
(123 = 123.0)             # yes

(0 = 0)                   # yes
(-0 = -0)                 # yes
(0 = -0)                  # yes

(infinity = infinity)     # yes
(infinity = -infinity)    # no
(-infinity = -infinity)   # yes

(nan = nan)               # no (This is not a typo)
(nan != nan)              # yes (This is also not a typo)

is-finite 123             # yes
is-finite infinity        # no
is-finite -infinity       # no
is-nan nan                # yes
```

```
write 0.1 + 0.2 = 0.3         # no
write 0.1 + 0.2               # 0.30000000000000004

write 0.1 * 10                # 1
write 0.14 * 100              # 14.000000000000002

write 1.0000000000000001      # 1
write 9999999999999999        # 10000000000000000
```

#### Boolean
Boolean literals are represented by the keywords `yes` and `no`. There are no *truthy* or *falsy* values.

#### Procedure
Procedures are callable units of code. A procedure body is delimited by `{` ... `}`.

```
# A procedure literal
{write "Hello, World"}

# Call it using `()` 
{write "Hello, World"}()    # Hello, World
```
Procedures can accept arbitrary data called *arguments*.

When a procedure is called with arguments, the call is implicit and does not require `()` operator.
```
{write "Hi |arguments.1|"} "Happy"          # Hi Happy 
{write arguments.1 + arguments.2} 2, 3      # 5 
```



Storing them inside variables allows for code reuse. 
```
show-message = {
    write "Hello, World"
}

show-message()     # Hello, World
show-message()     # Hello, World
show-message()     # Hello, World
```

It also allows giving names to arguments the procedure accepts. These names are called parameters.

```
# Here `divide` is the name of procedure
# and `numerator` and `denominator` are its parameters
divide numerator, denominator = {
    return numerator / denominator
}

divide 10, 5        # 2
divide 9, 6         # 1.5
```
You can also add default values for parameters
```
# `message` parameter has the default value of "Good morning"
# The procedure will use this value when no argument is passed to message parameter
greet name, message: "Good morning" = {
    write "|message|, |name|"
}

greet "Dmitri"                    # Good morning, Dmitri
greet "Ilya", "Happy holidays"    # Happy holidays, Ilya
```

#### Structure

A Structure is an ordered collection of key-value pairs and standalone values. 

It can act as both, a dynamic array and a hash map.

```
# Empty structure
empty-struct = []

# A structure acting as a dynamic array
fruits = ["apple", "banana", "mango"]

# A structure acting as a hashmap
user = [
    id = 101,
    name = "Alex",
    is-admin = yes
]

# A mixed structure containing both positional values and named properties
mixed = ["first-item", status = active, 42]
```

You can access values using the . operator. Positional elements are accessed using 1-based index numbers.
```
# Accessing named properties
write user.name       # Alex

# Accessing positional elements
write fruits.1        # apple

# Modifying elements
user.is-admin = no
fruits.2 = "orange"
```


To find out how many elements (both values and properties) exist in a structure, use the count procedure:

```
user = [id = 1, name = "Sam"]
write count user      # 2
```
