---
name: launchpad-custom-function

description: Custom Functions are a type of Function that extends LaunchPad with code written in Java 11, Python 3.12, or Node.js 20 via AWS Lambda. Use this skill whenever the user asks what is a custom function, what types of functions exist, how to create or extend Launchpad with custom logic, or when troubleshooting handler naming conventions (Java package.Class::method, Python file.function), signature mismatches, AWS Lambda execution limits, or timezone/null handling in date or list functions. Use when the user needs to parse Excel files, perform advanced date manipulations, integrate external libraries, or handle specialized data transformations. Use when user asks for Callable rules.

tags: [Python, Java, Node, Function, Method, Subroutine, Composable, Testable, Runable, Callable]
---

## Custom Function
Custom Functions are rules that enables the user to extend the capability of LaunchPad with code written in High Level Languages (HLL) like Java.
This feature is typically reserved for functionality that cannot be implemented in another rule type, i.e. Automation. 
To use this feature you upload the HLL artifacts, i.e. Jar or Python file, and reference the method you want to invoke when the Custom Function is called.
The signature of Custom Function MUST match that of the HLL method so that the Custom Function can invoke it.

Like Functions Custom Function are sideeffect free and should not assume any shared state between requests. 
They perform the task or computation required the same way each time they are invoked.

**Supported Languages:**
- [Java 11](references/java.md)
- [Python 3.12](references/python.md)
- [Node.js 20](references/node.md)


### How to create
1. Write your code in a supported High Level Language (HLL)
2. Create JAR (Java) or ZIP (Python, Node.js) of code, as known as Code Bundle
3. Create a Function Rule
  - Be sure to specify Function uses a Code Bundle
4. Upload Code Bundle
5. Define Custom Function's inputs parameters and output
  - MUST signature of method defined in Code Bundle 

### Inputs
Inputs are also known as arguments to a Function. The input type MUST be compatible
with the LaunchPad type otherwise user may have issues accessing the data associated with the input.

### Gotchas

- **Timezone Awareness:** Date Functions use GMT by default; use `TodayWithTimeZone` for specific timezones
- **Custom Function Limits:** AWS Lambda execution limits apply to custom Functions
- Arguments defined in HLL method MUST be defined in the same order as the Custom Function
- Return type of HLL method MUST be compatible with the return type of the Custom Function
- [Using objects as input](references/field-reference.md) requires special handling for LaunchPad Field

## Best Practices

- Use built-in Functions before creating custom function
- Test Custom Function with various input values
- Document custom Functions thoroughly


# Example
- Parsing an Excel file that you uploaded and extract the results into a user defined data structure.
- Advanced date manipulations
- Complex mathematical calculations
- Integration with external libraries
- Specialized data transformations
