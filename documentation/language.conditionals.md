### Conditionals
Conditionals control which block will be executed based on a **condition**. The condition must be a boolean value, Utkrisht does not have truthy or falsy values. 


#### Conditional statement
```
when age < 13 
    write "You're a child"
else age > 19
    write "You're an adult"
else
    write "You're a teen"
```

#### Conditional expression
Multiline
```
status = 
    when age < 13 
        "child"
    else age > 19
        "adult"
    else
        "teen"
```
Single line
```
status = when (age < 13) "child" else (age > 19) "adult" else "teen"
```

#### Conditional comprehension
```
user = [
    when age < 13 
        role = "child"
        restricted = yes
    else age > 19
        role = "adult"
        restricted = no
    else
        role = "teen"
        restricted = yes
]
```
