## Object input
Assuming a Field rule of the form [assets/field.json](../assets/Field.json), it is uniquely identifable by
- RuleResolutionID
- Namespace
- AppliesTo

When input is passed as an object to a Custom Function the object is of the type defined by the **AppliesTo**.
To reference the Field from the object you MUST specify BOTH
- RuleResoluTionID
- Namespace


### UI
UI representation of keys defined JSON.

| Key in JSON       | UI        |
| ----------------- | --------- |    
| Namespace         | RuleSet   |
| RuleResolutionID  | ID        |
| AppliesTo         | Scope     |


### Record types
LaunchPad Field with mode of `SingleRecord` or `ListOfRecord` are object or colection inputs. To determine the set of 
Fields that can be accessed see the Fields defined in the Field's RecordClass 

## Formats
Since the reference to the LaunchPad field comes as JSON key you MUST combine them using one of the following formats:
- CAMEL_CASE
    - lowercase Namespace
    - lowercase RuleResolutionID with the first letter capitalized
- DOUBLE_UNDERSCORE
    - Namespace
    - __ delimiter
    - RuleResolutionID


`identifierFormat` environment variable captures which format to use.

### Default Format
The DOUBLE_UNDERSCORE is the default format.

### JVM
Use `@Field` annotation for Java based languages

