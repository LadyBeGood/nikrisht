### String 

#### `count(target)`
Returns the number of elements in an array or the number of characters in a string.
- **Parameters**: `target` (`array` | `string`)
- **Returns**: `number`

#### `slice(target, start, end?)`
Extracts a section of an array or string based on 1-indexed boundaries.
- **Parameters**: 
  - `target` (`array` | `string`)
  - `start` (`number`) 1-based start index.
  - `end` (`number`, optional) Defaults to the end of the sequence.
- **Returns**: `array` | `string`


#### `split(text, separator)`
Splits a string into an array of substrings using a specified separator.
- **Parameters**: 
    - `text` (`string`)
    - `separator` (`string`)
- **Returns**: `array`

#### `startsWith(text, prefix)`
Checks whether a string begins with a specific substring.
- **Parameters**: `text` 
    - (`string`)
    - `prefix` (`string`)
- **Returns**: `boolean`

#### `endsWith(text, suffix)`
Checks whether a string ends with a specific substring.
- **Parameters**: 
    - `text` (`string`)
    - `suffix` (`string`)
- **Returns**: `boolean`

#### `lowercase(text)`
Converts all characters in a string to lowercase.
- **Parameters**: `text` (`string`)
- **Returns**: `string`

#### `uppercase(text)`
Converts all characters in a string to uppercase.
- **Parameters**: `text` (`string`)
- **Returns**: `string`

#### `capitalise(text)`
Capitalizes the first character of a string and lowercases the remainder.
- **Parameters**: `text` (`string`)
- **Returns**: `string`

#### `titlecase(text)`
Capitalizes the first letter of every word in a string.
- **Parameters**: `text` (`string`)
- **Returns**: `string`

#### `trim(text, direction?)`
Trims whitespace from a string.
- **Parameters**: 
  - `text` (`string`)
  - `direction` (`string`, optional) Accepts `"left"` or `"right"`. Trims both sides if omitted.
- **Returns**: `string`