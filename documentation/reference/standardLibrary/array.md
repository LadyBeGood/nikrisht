### Array

#### `count(target)`
Returns the number of elements in an array or the number of characters in a string or the number of key-value pairs in an object.
- **Parameters**: `target` (`array` | `string` | `object`)
- **Returns**: `number`

#### `slice(target, start, end?)`
Extracts a section of an array or string based on 1-indexed boundaries.
- **Parameters**: 
    - `target` (`array` | `string`)
    - `start` (`number`) 1-based start index.
    - `end` (`number`, optional) Defaults to the end of the   sequence.
- **Returns**: `array` | `string`

#### `includes(array, value)`
Determines whether an array contains a specific value.
- **Parameters**: 
    - `array` (`array`)
    - `value` (`any`)
- **Returns**: `boolean`

#### `put(array, item)`
Appends an item to the end of an array (mutates target).
- **Parameters**: 
    - `array` (`array`)
    - `item` (`any`)
- **Returns**: `number` Count of the elements in the new array

#### `pop(array)`
Removes and returns the last element from an array.
- **Parameters**: `array` (`array`)
- **Returns**: `any` | `null`

#### `join(array, separator)`
Joins all elements of an array into a single string separated by the given delimiter.
- **Parameters**: 
    - `array` (`array`)
    - `separator` (`string`)
- **Returns**: `string`

#### `sort(array)`
Returns a new sorted copy of a numeric array in ascending order.
- **Parameters**: `array` (`array` of `number`)
- **Returns**: `array`

#### `reverse(array)`
Returns a reversed copy of an array.
- **Parameters**: `array` (`array`)
- **Returns**: `array`

#### `min(array)`
Finds the lowest value in a numeric array.
- **Parameters**: `array` (`array` of `number`)
- **Returns**: `number`

#### `max(array)`
Finds the highest value in a numeric array.
- **Parameters**: `array` (`array` of `number`)
- **Returns**: `number`

#### `sum(array)`
Calculates the sum of all numbers in an array.
- **Parameters**: `array` (`array` of `number`)
- **Returns**: `number`
