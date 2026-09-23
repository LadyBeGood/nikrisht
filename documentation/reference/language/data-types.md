### Data types
Nikrisht has **7 data types**.

| Data Type     | Passed by | Clonable | Accessible | Mutable | Callable | Hashable          |
|---------------|-----------|----------|------------|---------|----------|-------------------|
| **Null**      | Value     | Yes      | No         | No      | No       | Yes               |
| **String**    | Value     | Yes      | Yes        | No      | No       | Yes               |
| **Number**    | Value     | Yes      | No         | No      | No       | Yes<sup>[1]</sup> |
| **Boolean**   | Value     | Yes      | No         | No      | No       | Yes               |
| **Function**  | Reference | No       | No         | No      | Yes      | Yes               |
| **Array**     | Reference | Yes      | Yes        | Yes     | No       | Yes               |
| **Object**    | Reference | Yes      | Yes        | Yes     | No       | Yes               |

> [!NOTE]  
> [1] All numbers including `nan` are hashable and can be used as keys. 
> Object uses the algorithm [SameValueZero](https://tc39.github.io/ecma262/#sec-samevaluezero) to test keys for equivalnce. 
> So here `nan` is considered equal to `nan`.



#### String
Strings are used to store textual data. 

Strings can be created using double quotes:
```
# Single line strings
"This is a single line string.";

# Multiline string
"This 
is a multiline
string";
```

To get the number of characters in a string, use the count function:
```
write(count("hi"));          # 2
write(count("goodbye"));     # 7
write(count(""));            # 0
```

To get a character at a specific position, use `[`...`]` brackets. Indexing starts from **1**:
```
write("hello"[1]);        # h
write("hello"[5]);        # o
```

Strings are immutable and cannot be changed:
```
const name = "nki";
name[1] = "u";            # Error
```

You can concatenate (join) two string using `+` operator:
```
const name = "Jane";
const age = 20;

write("My name is " + name + ", I am " + toString(age) + " years old.");
     # My name is Jane, I am 20 years old.
```

Instead of joining strings with `+`, you can embed expressions directly inside a string using `{`...`}`.
```
write("My name is {name}, I am {age} years old."); 
     # My name is Jane, I am 20 years old.
     # Note how age, a number, was automatically converted to string for embedding.
```


A string is represented internally a sequence of UTF-16 code units, identical to JavaScript strings, and thus share the same quirks.
```
write(count("😼"));       # 2
write("😼"[1]);           # \ud83d

write(count("é"));        # 1 (é)
write(count("é"));        # 2 (e and "́")
write("é" = "é");         # false (no normalization)

write(count("👨‍👩‍👧‍👦"));       # 11
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
write(123 == 123.0);             # true

write(0 == 0);                   # true
write(-0 == -0);                 # true
write(0 == -0);                  # true

write(infinity == infinity);     # true
write(infinity == -infinity);    # false
write(-infinity == -infinity);   # true

write(nan == nan);               # false (This is not a typo)
write(nan != nan);               # true (This is also not a typo)

write(isFinite(123));             # true
write(isFinite(infinity));        # false
write(isFinite(-infinity));       # false
write(isNan(nan));                # true
```

```
write(0.1 + 0.2 == 0.3);         # false
write(0.1 + 0.2);                # 0.30000000000000004

write(0.1 * 10);                 # 1
write(0.14 * 100);               # 14.000000000000002

write(1.0000000000000001);       # 1
write(9999999999999999);         # 10000000000000000
```

#### Boolean
Boolean literals are represented by the keywords `true` and `false`.

 There are no *truthy* or *falsy* values.


...

