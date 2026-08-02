import { type JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload
{
    id: string;
}