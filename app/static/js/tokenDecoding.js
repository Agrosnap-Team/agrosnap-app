import { jwtDecode } from "/node_modules/jwt-decode/build/esm/index.js";
export function decodeToken(encodedToken) {
        // decode the token 
        const decodedData = jwtDecode(encodedToken);
        console.log(decodedData);
        localStorage.setItem("user_data",JSON.stringify(decodedData));
        return decodedData;

  }