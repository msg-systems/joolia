/**
 * JWT Authorization Token Response
 */
export class JWTResponse {
    public static readonly attrs = ['token', 'expires'];

    public constructor(public token: string, public expires: string) {}
}
