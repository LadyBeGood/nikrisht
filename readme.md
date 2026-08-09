
<div align="center">

# Nikrisht

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fladybegood.github.io%2Fnikrisht&up_message=online&up_color=22c55e&label=playground)](https://ladybegood.github.io/nikrisht)
![Repo Size](https://img.shields.io/github/repo-size/ladybegood/nikrisht?color=3b82f6)
![Last Commit](https://img.shields.io/github/last-commit/ladybegood/nikrisht?color=8b5cf6)

<!-- *Statically typed. Dynamically written.* -->
*profound tagline goes here*

</div>

## Introduction
Nikrisht (uki) is a clean, indentation-based procedural language that compiles to JavaScript, designed for simplicity and visual clarity.



## Getting Started

### Playground
You can try Nikrisht instantly in your browser without any installation or setup.

### Installation

```bash
npm install -g nikrisht
```

To compile an `input.uki` file to `output.js` file, run:

```bash
uki input.uki output.js
```

### Editor setup
For the best development experience, install the official **Nikrisht VS Code Extension** to get full syntax highlighting, error checking, and code snippets:

1. Open VS Code.
2. Open the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for **Nikrisht** by **LadyBeGood**
4. Click Install.


## Reference

### Comments
Comments are non-executable tokens used to annotate code.

#### Regular Comments
Regular comments begin with `#` followed by whitespace and continue until the end of the line. 

```
# This is a regular comment
```

#### Block Comments
Block comments begin and end with matching sequences of two or more `#` characters. The opening delimiter must be followed by whitespace, and the closing delimiter must be preceded by whitespace.

```
## This is a block comment.
   It can span multiple lines. ##

name = ## They can also be used inline ## "Nikrisht"
```


Different delimiter lengths allow block comments to be nested.
```
#### 
The comment starts here

## contains a nested comment ##

and ends here. 
####
```



#### Documentation Comments
Documentation comments are used to document variables.

They are written using regular single-line comments placed directly above the declaration. Their contents are treated as plain text and do not require any special syntax.

> [!TIP]
> You can use Markdown, XML, or any other format supported by your IDE or documentation tool inside documentation comments.

```
# A unique identifier for the current user session that is
# used by the server to track session state.
session-id = "usr_9x82j1"


# Divide 2 numbers
# 
# ### Parameters
# - `a`: Numerator
# - `b`: Denominator
#
# ### Returns
# Result of the division
#
# ### Crashes
# When denominator is `0`
divide a, b = {
    when b = 0
        crash "Division by zero"
    return a / b
}
```

### Keywords

Keywords are predefined words used by the language to perform internal operations or represent built-in behavior. 

Nikrisht has **12 keywords**. All of them are reserved and cannot be used as [identifiers](#identifiers).

| Keywords                    | Description                |
|-----------------------------|----------------------------|
| `when` `else`               | Conditional branching      |
| `loop` `with` `exit` `skip` | Looping and loop control   |
| `try` `fix` `crash`         | Error handling             |
| `return`                    | Returning from a procedure |
| `import` `export`           | Package import and export  |



### Symbols

Symbols are non-alphanumeric tokens that have special meaning in the language syntax.  

Symbols are context sensitive.

In Nikrisht, symbols are grouped by their role into **operators**, **separators**, **delimiters** and **terminators**.



#### Operators

Operators are symbols used to perform operations on values.


| Operator          | Position | Description     |
|-------------------|----------|-----------------|
| `=`               | Infix    | Declaration     |
| `~`               | Infix    | Assignment      |
| `=`               | Infix    | Equal           |
| `<`               | Infix    | Less Than       |
| `>`               | Infix    | More Than       |
| `!=`              | Infix    | Not Equal       |
| `<=`              | Infix    | Less Than Equal |
| `>=`              | Infix    | More Than Equal |
| `+`               | Infix    | Addition        |
| `-`               | Infix    | Subtraction     |
| `*`               | Infix    | Multiplication  |
| `/`               | Infix    | Division        |
| `-`               | Prefix   | Unary Minus     |
| `+`<sup>[1]</sup> | Prefix   | Unary Plus      |
| `&`               | Infix    | And             |
| `\|`              | Infix    | Or              |
| `!`               | Prefix   | Not             |
| `.`               | Postfix  | Accessor        |
| `()`              | Postfix  | Call            |
| `/`               | Prefix   | Specifier       |
| `:`               | Infix    | Label           |
| `..`              | Infix    | Range           |
| `...`             | Prefix   | Spread          |

<!-- | `\`               | Prefix   | Escape          | -->
<!-- | `$`               | Prefix   | Reactivity      | -->
<!-- | `@`               | Prefix   | Async           | -->
<!-- | `#`               | Prefix   | Meta            | -->

> [1] Unary Plus does not perform any operation. It is simply there for symmetry with unary minus.  

#### Separators

Separators are symbols used to divide syntactic elements without performing an operation.

| Separator | Separates                                                    |
|-----------|--------------------------------------------------------------|
| `,`       | Arguments, Parameters, Properties                            |
| NewLine   | Arguments, Parameters, Properties (non-terminating contexts) |



#### Delimiters

Delimiters mark the beginning and end of syntactic constructs.

| Delimiter                    | Delimits                                       |
|------------------------------|------------------------------------------------|
| `(` ... `)`                  | Expression groups                              |
| `{` ... `}`                  | Procedures                                     |
| `[` ... `]`                  | Structures                                     |
| `"` ... `"`                  | Strings                                        |
| `/` ... `/`                  | Regular expressions                            |
| `\|` ... `\|`                | String Interpolation                           |
| `#` ... NewLine or EndOfFile | Comments                                       |
| Indent ... Dedent            | Expressions, Procedures, Arguments, Parameters |


#### Terminators
Terminators mark the end of a statement or declaration.

| Terminator | Terminates                                  |
|------------|---------------------------------------------|
| NewLine    | Statements, Comments (terminating contexts) |
| EndOfFile  | Statements, Comments                        |


### Identifiers
Identifiers are names given to different entities in Nikrisht to uniquely identify them within the source code. Identifiers can be used in various places:

```
# variables
message = "hi"

# structure keys
[name = "Uki"]

# packages
import components/footer
```

A valid identifier:

- contains only lowercase letters (`a–z`), numbers (`0–9`), and `-`
- starts with a lowercase letter
- ends with a lowercase letter or number
- does not contain consecutive hyphens (`--`, `---` etc.)


Valid Identifiers
```
name
user-123
p16
file-path
data-set-3
a1-b2
```

Invalid Identifiers
```
myName       # contains uppercase letter
1080p        # starts with a number
-webkit      # starts with a hyphen, will be interpreted as negation
value-       # ends with a hyphen
my--var      # contains consecutive hyphens
user_name    # contains underscore
```



### Data types
Nikrisht has **5 data types**.

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
write "é" = "é"        # false (no normalization)

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
(123 = 123.0)             # true

(0 = 0)                   # true
(-0 = -0)                 # true
(0 = -0)                  # true

(infinity = infinity)     # true
(infinity = -infinity)    # false
(-infinity = -infinity)   # true

(nan = nan)               # false (This is not a typo)
(nan != nan)              # true (This is also not a typo)

is-finite 123             # true
is-finite infinity        # false
is-finite -infinity       # false
is-nan nan                # true
```

```
write 0.1 + 0.2 = 0.3         # false
write 0.1 + 0.2               # 0.30000000000000004

write 0.1 * 10                # 1
write 0.14 * 100              # 14.000000000000002

write 1.0000000000000001      # 1
write 9999999999999999        # 10000000000000000
```

#### Boolean
Boolean literals are represented by the keywords `true` and `false`. There are no *truthy* or *falsy* values.

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
    is-admin = true
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
user.is-admin = false
fruits.2 = "orange"
```


To find out how many elements (both values and properties) exist in a structure, use the count procedure:

```
user = [id = 1, name = "Sam"]
write count user      # 2
```


### Variables
Variables are identifiers used to store data. All variables are mutable and can be reassigned.



Declare a variable using `=`
```
message = "Hello World"
```
Reassign a value using `~`
```
quantity = 34

quantity ~ 65
quantity ~ "high" # Data type of the value does not matter
```
 

### Conditionals
Conditionals control which block will be executed based on a **condition**. The condition must be a boolean value, Nikrisht does not have truthy or falsy values. 


#### Conditional statement
```
when age < 13 
    write "You're a child"
else age > 19
    write "You're an adult"
else
    write "You're a teen"
```

#### Conditional expression
Multiline
```
status = 
    when age < 13 
        "child"
    else age > 19
        "adult"
    else
        "teen"
```
Single line
```
status = when (age < 13) "child" else (age > 19) "adult" else "teen"
```

#### Conditional comprehension
```
user = [
    when age < 13 
        role = "child"
        restricted = true
    else age > 19
        role = "adult"
        restricted = false
    else
        role = "teen"
        restricted = true
]
```


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

Loop keyword followed by a boolean loops infinitely if `true`, doesn't loop if `false`:
```
loop true
    write "hello"
    
    # loops infinitely

    # hello
    # hello
    # hello
    # ...


loop false
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

Nikrisht provides a neat literal syntax for creating sunch ranges:
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


### Error Handling
Nikrisht uses explicit try, fix, and crash blocks to manage runtime errors. Errors do not silently fail; they must be intercepted or thrown explicitly.
```
# Intentional disruption using crash
divide a, b = {
    when b = 0
        crash "Division by zero"
    return a / b
}

# Catching anomalies using try and fix
try 
    result = divide 10, 0
    write result
fix error
    write "An error occurred: |error|"
```
The fix block exposes an identifier containing the payload passed to the crash statement.

### Packages

A package is a reusable unit of code that organizes logic into separate files and folders. 

A package can *import* other packages and *export* its variables for other packages.

> [!NOTE]
> In an Nikrisht project, in order to be imported and compiled
> - all file and folder names must be valid identifiers.
> - a folder must not contain a file and folder of same name.

There are two types of packages:
1. **File Package**: Any Nikrisht file which is not inside a folder package.
2. **Folder Package**: Any folder having a Nikrisht file of same name as a direct child.

#### Import
A package can be imported using the `import` keyword followed by its path:
```
import utilities 
import components/footer
import ../assets/icons
```
When you write an import like `import abc`, the compiler looks for:
- a file named `abc.uki`, or
- a folder named `abc` that contains a file named `abc.uki`.

Imported variables can be mutated, but not reassigned.
```
# in colours.uki file

export colour-palette = [
    red = "F00"
    green = "0F0"
    blue = "00F"
]
```

```
import colours

colour-palette.red = "EE4B2B"  # Works fine
colour-palette ~ []            # Error
```

#### Export
Use the `export` keyword to make the variable available to other packages that import it:
```
export message = "hi"
export multiply a, b = {
    return a * b
}
```

## Frequently Asked Questions
### Why use 1-based indexing for strings and structures?
Humans start counting at 1.


### Why use `~` for assignment instead of `=`?
Nikrisht uses `=` for declarations because declarations are far more common than reassignment, and `=` is the most visually natural symbol for introducing a value.

Nikrisht wants declaration and reassignment to be distinct operations. Using `~` keeps reassignment explicit and unambiguous.

### Why use `|` ... `|` for string interpolation?
It provides a clean, high-visibility delimiter that is rarely used in standard text, reducing the need for complex escape sequences inside strings.

### Why are there no truthy or falsy values?
Nikrisht, unlike JavaScript, prioritizes explicit logic over "magic" coercion to prevent common bugs.

### Why use `kebab-case` instead of `camelCase` or `snake_case`?
`kebab-case` is highly readable and easy to write, and aligns with HTML/CSS naming conventions.

### Why use custom keywords like `when`, `exit` and `fix`?
The keywords in Nikrisht were chosen based on visual symmetry and linguistic clarity:

- **Visual symmetry**: `when` and `else` have the same character count (4). 
    This creates a perfectly aligned vertical "gutter" in your code, making blocks easier for the eyes to scan compared to the uneven `if`, `else` and `else if`. 
    Similarly, `try` and `fix` share the same 3-letter width.

- **Linguistic clarity**: Traditional keywords like `break`, `continue`, `throw` and `catch` are abstract. 
    Nikrisht uses `exit`, `skip`, `crash` and `fix` because they describe exactly what is happening: You 
    - "exit" a loop 
    - "skip" an iteration
    - "crash" the program, or
    - "fix" the error

### Why no `const` (unreassignable variables)?
As a long-time JavaScript developer who faithfully follows "everything is `const` by default" philosophy, I've found it to be pretty useless in practice. 

I have never, not even once in my life, "accidently" reassigned a variable I wasn't supposed to. 
On the contrary, nearly every time I code in JS, I mistakenly declare a variable as `const`, realize it needs to change as my logic evolves, and have to back up and rewrite it to `let`.

Nikrisht saves you from this guessing game.

### Why did Nikrisht decide to not support functional or OOP paradigms?
Both paradigms promise cleaner code but deliver complexity. OOP makes you learn classes, inheritance, interfaces, and design patterns before writing anything meaningful. FP trades that for currying, composition, immutability, and referential transparency, different complexity, not less. 

OOP and FP introduce abstractions that work against Nikrisht's goal of being simple and immediately usable. The language constructs it provides, expressions, closures, structures, comprehensions, are expressive enough that the abstractions OOP and FP offer simply are not needed.

### Why does Nikrisht not have Uniform Function Call Syntax (UFCS)?
Utkirsht tries to only offer one way to do things, to improve clarity.

`x.f(y)` meaning `f(x, y)` is ambiguous as `x` may have a field called `f`. It is not at all clear what this means.





## Acknowledgements

### Foundations
- [Robert Nystrom's Crafting Interpreters](https://craftinginterpreters.com) - The definitive blueprint for anyone building a language from scratch. 
    - [Rockcavera's Nlox](https://github.com/rockcavera/nim-nlox/) - Nim implementation of the Lox programming language.
    - [David Timms' Loxdown](https://github.com/DavidTimms/loxdown) - A TypeScript implementation of a statically-typed variant of the Lox programming language.
- [Microsoft's TypeScript Compiler](https://github.com/microsoft/TypeScript/) - A very well-written codebase to study for transpiler design. 
    - [Nathan Shively-Sanders' Mini- & Centi-TypeScript](https://github.com/sandersn/mini-typescript) - Miniature models of the TypeScript compiler.
    - [Orta Therox's TypeScript compiler guide](https://youtu.be/X8k_4tZ16qU?si=hYu4txp-OmW-iW5f) - A YouTube presentation exploring the inner workings of the TypeScript compiler.
    - [Simone Poggiali's The Concise TypeScript Book](https://github.com/gibbok/typescript-book) - An incredibly informative TypeScript guide.
- [Tyler Laceby's Programming Language Guide](https://youtube.com/playlist?list=PL_2VhOvlMk4UHGqYCLWc6GO8FaPl8fQTh&si=ROqcOk6DfMtiqsNP) - An excellent YouTube playlist on building a custom scripting language in TypeScript.
- [Meriyah](https://github.com/meriyah/meriyah/) - A 100% compliant, self-hosted JavaScript parser.
- [Michael L. Scott's Programming Language Pragmatics](http://www.r-5.org/files/books/computers/compilers/theory/Michael_L_Scott-Programming_Language_Pragmatics-EN.pdf) - The study of how real-world context and human design choices affect how programming languages are actually used.

### Inspirations
- [Arturo](https://arturo-lang.io/) - The `|expression|` syntax for string interpolation.
- [Python](https://www.python.org/) - Use of the `#` symbol for comments.
- [SASS](https://sass-lang.com/) - Indentation-based syntax and using `:` for named arguments
- [Lua](https://www.lua.org/) - The concept of a unified `Structure` data type that handles both lists and maps.
- [CoffeeScript](https://coffeescript.org/) - Omission of round bracket as delimiters in procedure calls when arguments are present.
- [Nim](https://nim-lang.org/) - Import behavior where all exported variables from an imported file are automatically pulled.

<!-- - [SASS](https://sass-lang.com/) - Indentation-based syntax, using `:` for named arguments and syntax for components. -->
<!-- - [Ripple](https://www.ripple-ts.com/) - Components constructing UI directly instead of returning UI objects. -->
<!-- - [Svelte 4](https://v4.svelte.dev/) - Using `$` for the compiler based reactivity system. -->
<!-- - [QML](https://doc.qt.io/qt-6/qmlreference.html) - The `property.subproperty: value` syntax used for grouped properties. -->


### Resources
- [AST Explorer](https://astexplorer.net/) - A web tool to explore the ASTs generated by various parsers.
- [Syntax across languages](https://rigaux.org/language-study/syntax-across-languages.html) - A comparison of syntax across many programming languages. 
- [regex101](https://regex101.com/) - Regex editor for testing and learning regular expressions. Very helpful while creating syntax-highlighting patterns for the VSCode extension and website playground.
- [Matt Neuburg's guide on writing TextMate grammar](https://www.apeth.com/nonblog/stories/textmatebundle.html) - A comprehensive reference for understanding TextMate grammar internals and syntax highlighting behavior. You will have a very hard time dealing with TextMate if you don't digest this guide first.


## License
Licensed under AGPL-3.0. See [license.txt](./license.txt).