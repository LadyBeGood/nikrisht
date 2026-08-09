### Packages

A package is a reusable unit of code that organizes logic into separate files and folders. 

A package can *import* other packages and *export* its variables for other packages.

> [!NOTE]
> In an Utkrisht project, in order to be imported and compiled
> - all file and folder names must be valid identifiers.
> - a folder must not contain a file and folder of same name.

There are two types of packages:
1. **File Package**: Any Utkrisht file which is not inside a folder package.
2. **Folder Package**: Any folder having a Utkrisht file of same name as a direct child.

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
