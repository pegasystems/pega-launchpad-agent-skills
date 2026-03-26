## NodeJS
LaunchPad support NodeJS 20

## Code Bundle
A zip file containing all the Node file(s).

### Example
Typical zip example
```
|-- index.mjs
```

### Example 2
Typical zip example
```
|-- index.js
```



# Example
Base 64 encoding of event
``` js
export const processInput = async (event) => {
    try {
         const BASE64_OUTPUT = Buffer.from(event.input, 'utf-8').toString('base64');
         return BASE64_OUTPUT;
     } catch (error) {
         console.log("Error encoding input to Base64");
    }
  };

```



