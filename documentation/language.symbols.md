### Symbols

Symbols are non-alphanumeric tokens that have special meaning in the language syntax.  

Symbols are context sensitive.

In Utkrisht, symbols are grouped by their role into **operators**, **separators**, **delimiters** and **terminators**.


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

> [!TIP]
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

