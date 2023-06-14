import { MiddlewareFn } from 'type-graphql'
import pkg from "jsonwebtoken";
const { verify } = pkg
import { Response, Request } from 'express';
import { enviroment } from '../config/enviroment';

export interface IContext {
    req: Request,
    res: Response,
    payload: {
        userId: string,
        id: string,
        token: string
    }
}

export const isAuth: MiddlewareFn<IContext> = ({ context }, next) => {
    try {
        const bearerToken: string = context.req.headers.authorization.split(' ')[1]
        if (!bearerToken) {
            throw new Error();
        }
        const payload = verify(bearerToken, enviroment.JWT_SECRET)
        console.log(payload)
        context.payload = payload as any
        return next()
    } catch (error) {
        console.log('error', error)
        throw new Error(error.message)
    }
}
