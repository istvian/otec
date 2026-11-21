import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.RESEND;

const resend = new Resend(secret);
export interface CorreoType {
  id?: number;
  from: string;
  to: string;
  date: string;
  asunto: string;
  contenido: string;
}

export async function GetMails() {
  const { data, error } = await resend.emails.receiving.list({ limit: 10 });
  console.log(data);
  if (error) return [];
  if (data?.data) {
    const correos = data.data;
    const mails: CorreoType[] = [];
    for (let i = 0; i < correos.length; i++) {
      const mail = correos[i];
      const correoUnico = await resend.emails.receiving.get(mail.id);
      console.log(mail);
      console.log(mail.to);
      mails.push({
        from: mail.from,
        asunto: mail.subject,
        to: mail.to[0],
        date: correoUnico.data?.created_at || "",
        contenido: correoUnico.data?.text || "",
      });
    }
    return mails;
  }
}
