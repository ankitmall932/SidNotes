import { HydratedDocument } from "mongoose";
import { IUser } from "../models/user.model";

declare global
{
    namespace Express
    {
        interface Request
        {
            user?: HydratedDocument<IUser>;
            token?: string;
        }
    }
}

export { };