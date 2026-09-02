### Symbols

Symbols are non-alphanumeric tokens that have special meaning in the language syntax.  

In Nikrisht, symbols are grouped by their role into **operators**, **separators**, **delimiters** and **terminators**.


#### Operators

Operators are symbols used to perform operations on values.


| Operator          | Position | Description     |
|-------------------|----------|-----------------|
| `=`               | Infix    | Assignment      |
| `==`              | Infix    | Equal           |
| `!=`              | Infix    | Not Equal       |
| `<`               | Infix    | Less Than       |
| `<=`              | Infix    | Less Than Equal |
| `>`               | Infix    | More Than       |
| `>=`              | Infix    | More Than Equal |
| `+`               | Infix    | Addition        |
| `-`               | Infix    | Subtraction     |
| `*`               | Infix    | Multiplication  |
| `/`               | Infix    | Division        |
| `+`<sup>[1]</sup> | Prefix   | Unary Plus      |
| `-`               | Prefix   | Unary Minus     |
| `&`               | Infix    | And             |
| `\|`              | Infix    | Or              |
| `!`               | Prefix   | Not             |
| `.`               | Infix    | Accessor        |
| `..`              | Infix    | Range           |

> [!TIP]
> [1] Unary Plus does not perform any operation. It is simply there for symmetry with unary minus.  

#### Separators

Separators are symbols used to divide syntactic elements without performing an operation.

| Separator | Separates                                                    |
|-----------|--------------------------------------------------------------|
| `,`       | Arguments, Parameters, Properties                            |

> [!TIP]
> Trailing commas are allowed.

#### Delimiters

Delimiters mark the beginning and end of syntactic constructs.

| Delimiter                    | Delimits                                       |
|------------------------------|------------------------------------------------|
| `(` ... `)`                  | Expression groups                              |
| `[` ... `]`                  | Arrays                                         |
| `{` ... `}`                  | Objects                                     |
| `"` ... `"`                  | Strings                                        |
| `#` ... NewLine or EndOfFile | Regular comments                               |
| `#*` ... `*#`                | Block comments                                 |


#### Terminators
Terminators mark the end of a statement or declaration.

| Terminator   | Terminates                                  |
|--------------|---------------------------------------------|
| `;`          | Statements                                  |
| NewLine      | Regular comments                            |
| EndOfFile    | Regular comments                            |

