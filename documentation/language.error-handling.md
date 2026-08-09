### Error Handling
Utkrisht uses explicit try, fix, and crash blocks to manage runtime errors. Errors do not silently fail; they must be intercepted or thrown explicitly.
```
# Intentional disruption using crash
divide a, b = {
    when b = 0
        crash "Division by zero"
    return a / b
}

# Catching anomalies using try and fix
try 
    result = divide 10, 0
    write result
fix error
    write "An error occurred: |error|"
```
The fix block exposes an identifier containing the payload passed to the crash statement.
