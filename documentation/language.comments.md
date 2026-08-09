
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

name = ## They can also be used inline ## "Utkrisht"
```


Different delimiter lengths allow block comments to be nested.
```
#### 
The comment starts here

## contains a nested comment ##

and ends here. 
####
```
> [!WARNING]
> Nested comments and block comments using three or more `#` characters are 
> not highlighted correctly in the playground due to technical limitations. 
> The code itself works correctly.


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
