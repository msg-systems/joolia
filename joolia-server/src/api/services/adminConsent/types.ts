export class AdminConsentRequest {
    constructor(
        public locale: string,
        public message: string,
        public senderName: string,
        public recipientEmail: string,
        public url: string
    ) {}
}
