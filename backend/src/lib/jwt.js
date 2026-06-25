import jwt from "jsonwebtoken"


function CreateJwtToken(payload) {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
}


export { CreateJwtToken }