### Identifiers
Identifiers are names given to different entities in Utkrisht to uniquely identify them within the source code. Identifiers can be used in various places:

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


Valid Identifiers:
```
name
user-123
p16
file-path
data-set-3
a1-b2
```

Invalid Identifiers:
```
myName       # contains uppercase letter
1080p        # starts with a number
-webkit      # starts with a hyphen, will be interpreted as negation
value-       # ends with a hyphen
my--var      # contains consecutive hyphens
user_name    # contains underscore
```


