## Java
LaunchPad supports Java code compiled using Java 11 code or earlier. 
Code written with later version of the JDK will not execute, LaunchPad only support Java 11 JVM.

## Code Bundle
The Code Bundle refers to the Java JAR file.

## Function handle
LaunchPad's function handle when using Java takes the form of
- The package name
- The Class name
- :: delimiter
- The method name


## Input
For Java methods that require an Object as input you MUST use the @Field annotation on the 
variables defined on the Object. Using Jackson the annotation helps map the LaunchPad field to the
appropriate Java variable and visa versa.
``` java

/**
 * Marker annotation that can be used to define a non-static method
 * as a "setter" or "getter" for a logical property (depending on its signature),
 * or non-static object field to be used (serialized, deserialized) as a logical property.
 */
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@JsonProperty
@JacksonAnnotationsInside
public @interface Field {
    /**
     * The Application or RuleSet that the Field was created, typically referred
     * to as the namespace.
     */
    String namespace();

    /**
     * Identifier that the {@link Field} uniquely identified by.
     */
    String ID();
}

```

### SDK
If an SDK is not provided for the Field annotation, create the annotation in your project in the appropriate package.


## Example
An implementation that computes a value based on some input

``` java
package com.pega.uplus
class UPlusCalculator {

    /**
    * computes company sensitive ratio
    */
    int compute(int rhs, int lhs){
        ...
    }
}
```

The LaunchPad function handler would be defined as
```
    com.pega.uplus.UPlusCalculator::compute
```


## Example 2
An accepts an Object as input

``` java

class UPlusAgency{
    @Field(namespace = "UPlus", ID = "Code")
    String code;

    @Field(namespace = "UPlus", ID = "Size")
    String size;

}

```


``` java
package com.pega.uplus.obj
class UPlusCalculator {

    /**
    * computes company sensitive ratio using Object
    */
    int compute(UPlusAgency agency, int factor){
        ...
    }
}
```

The LaunchPad function handler would be defined as
```
    com.pega.uplus.obj.UPlusCalculator::compute
```
