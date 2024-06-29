import { validateToken } from "../services/authentication.js";

function checkForAuthenticationCookie(cookieName) {
    return (req,res,next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if(!tokenCookieValue) return next();
        
        try{
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload;
            // console.log("🚀 ~ return ~ req.user:", req.user)
        }catch(err){

        };  
        return next();
    };
}

export { checkForAuthenticationCookie };