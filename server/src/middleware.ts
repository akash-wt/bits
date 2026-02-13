import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "./config.js";



export function authMiddleware(req: Request, res: Response, next: NextFunction): void {

    const authHeader = req.headers.authorization;
 


    if (!authHeader) {
        res.status(403).json({ message: "You are not logged in" });
        return;
    }
    try {
        const token = authHeader.split(" ")[1];
        console.log(token);
        
        const payload = jwt.verify(token, JWT_PASSWORD);
        if (payload) {
            // @ts-ignore
            req.id = payload.id
        }
        next();
    }
    catch (e) {
        res.status(403).json({
            message: "You are not log in"
        })

    }

} 