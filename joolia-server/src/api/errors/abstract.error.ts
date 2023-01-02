export class AbstractError extends Error {
    public status: number;
    public code?: string;
}
