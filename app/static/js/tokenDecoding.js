import { jwtDecode } from "/node_modules/jwt-decode/build/esm/index.js";


function decodeToken(encodedToken) {
        // decode the token 
        try{
        const decodedData = jwtDecode(encodedToken);
        console.log(decodedData);
        localStorage.setItem("user_data",JSON.stringify(decodedData));
        return decodedData;
        }
        catch(error){
            console.log(error);
            return error;
        }

  }

function getUserIdFromToken(token) {
    try{
    const userData = decodeToken(token);
    return userData.user_id;
    }
    catch(e){
        return error;

    }
  }

function getUserUsernameFromToken(token){
    try{
    const userData = decodeToken(token);
    return userData.username;
    }
    catch(e){
        return error;

    }
}


export default{
    decodeToken,
    getUserIdFromToken,
    getUserUsernameFromToken
}
