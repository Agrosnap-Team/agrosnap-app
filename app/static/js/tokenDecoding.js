import { jwtDecode } from "/node_modules/jwt-decode/build/esm/index.js";
function decodeToken(encodedToken) {
        // decode the token 
        const decodedData = jwtDecode(encodedToken);
        console.log(decodedData);
        localStorage.setItem("user_data",JSON.stringify(decodedData));
        return decodedData;

  }

function getUserIdFromToken(token) {
    const userData = decodeToken(token);
    return userData.user_id;
  }

function getUserUsernameFromToken(token){
    const userData = decodeToken(token);
    return userData.username;
}


export default{
    decodeToken,
    getUserIdFromToken,
    getUserUsernameFromToken
}
