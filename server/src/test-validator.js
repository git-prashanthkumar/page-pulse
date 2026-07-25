import { isValidUrl } from "./utils/validators.js";

//testing the url
console.log(isValidUrl('https://example.com'));
console.log(isValidUrl('not-a-url'));            
console.log(isValidUrl('file:///etc/passwd'));