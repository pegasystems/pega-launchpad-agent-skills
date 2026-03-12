---
name: launchpad-custom-function
description: Extend LaunchPad functionality with rule that implements logic using High Level Language (HLL). 
tags: [launchpad, custom-function, jar, python, nodejs]
---

## Custom Function

Custom Function is a type Function that enables the user to extend the capability of LaunchPad with code written in High Level Languages (HLL) like Java.
This feature is typically reserved for functionality that cannot be implemented in another rule type, i.e. Automation. 
To use this feature you upload the HLL artifacts, i.e. Jar or Python file, and reference the method you want to invoke when the Custom Function is called.
The signature of Custom Function MUST match that of the HLL method so that the Custom Function can invoke it.


### Example:
- Parsing an Excel file that you uploaded and extrac the results into a user defined data structure.


## High Level Language
At the time of this writting, LaunchPad supports writting code in NodeJs 20, Java 11 and Python 3.12.

### Handler naming conventions
#### Python
The function handler name defined 
- The name of the file
- The name of the Python handler function



### Java
If you prefer Java for the implementation of the Custom Function, create a static method

### Example
```java
class UplusCalculator {
    public static int compute(int lhs, int rhs){

    }
}
```

If you intend to pass a Page from LaunchPad to the Custom Function, you need to define an equivalent object in your Jar
to represent the LaunchPad object. When defining the Object users MUST use the `@Field` annotation to decorate fields in the 
Java class that will come from LaunchPad.

``` java
public class UplusLoan {
    /** 
    *  Unique identifier for the loan
    */
    @Field(ID = "ID", namespace = "UPlus") 
    String ID;


    /**
    *  Amount the loan is being requested for
    */
    @Field(ID="amount", namespace="UPlus")
    double amount;

}
```

In the above example the `@Field` annotation contains
- ID: name of the Field in LaunchPad
- namespace: RuleSet or Application the rule is defined in


NOTE: if you override a rule from a different application, it's namespace does not change

