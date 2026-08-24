### Identifiers
Identifiers are names given to different entities in Nikrisht to uniquely identify them within the source code. Identifiers can be used in various places:

```
# variables
const message = "hi"

# functions
func setup_config() {}

# property access
user.name
```

A valid identifier:

- contains only uppercase letters (`A–Z`), lowercase letters (`a–z`), numbers (`0–9`), and underscores (`_`)
- does not start with a number (`0-9`)


Valid Identifiers:
```
name
userName
User_123
_privateVar
MAX_SPEED
a1_b2
```

Invalid Identifiers:
```
1080p        # starts with a number
user-name    # contains hyphen
file.path    # contains dot, will be interpreted as accessor
data set     # contains space
user@mail    # contains special character
```


