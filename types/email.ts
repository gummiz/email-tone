export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  body: string;
  snippet: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  emailCount: number;
  lastContact: Date | null;
}
