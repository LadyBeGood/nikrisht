### Type

#### `type(value)`
Returns the runtime data type of the given value.
- **Parameters**: `value` (`any`)
- **Returns**: `string` (`"null"`, `"array"`, `"object"`, `"function"`, `"string"`, `"number"`, or `"boolean"`)

#### `toString(value, quoteStrings?)`
Converts a given value into its string representation.
- **Parameters**: 
  - `value` (`any`)
  - `quoteStrings` (`boolean`, optional) Wraps string output in quotes if `true`.
- **Returns**: `string`

#### `toNumber(value)`
Casts a value to a numeric type.
- **Parameters**: `value` (`any`)
- **Returns**: `number`

#### `toBoolean(value)`
Casts a value to a boolean type using standard truthiness rules.
- **Parameters**: `value` (`any`)
- **Returns**: `boolean`