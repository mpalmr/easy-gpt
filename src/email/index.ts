import path from 'node:path';
import fs from 'node:fs/promises';
import nodemailer, { SentMessageInfo } from 'nodemailer';
import Handlebars from 'handlebars';
import mjml from 'mjml';
import type { Logger } from 'winston';
import {
  SMTP_SECURE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_DEFAULT_FROM,
} from '../env';

const TEMPLATE_PATH = path.join(__dirname, 'templates');
const INCLUDES_PATH = path.join(__dirname, 'includes');

type SendEmail<ViewData> = (viewData: ViewData) => Promise<SentMessageInfo>;

export interface Emails {
  verify: SendEmail<{ verifyUrl: string }>;
}

const TEMPLATE_NAMES: Array<keyof Emails> = [
  'verify',
];

export default async function createEmail(logger: Logger): Promise<Emails> {
  const transport = nodemailer.createTransport({
    secure: SMTP_SECURE,
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  async function compileTemplate<ViewData>(templateName: keyof Emails) {
    const templatePath = path.join(TEMPLATE_PATH, `${templateName}.hbs`);
    const contents = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile<ViewData>(contents);

    return async (to: string, viewData: ViewData) => transport.sendMail({
      to,
      from: SMTP_DEFAULT_FROM,
      html: mjml(template(viewData), { filePath: INCLUDES_PATH }).html,
    })
      .catch((ex) => {
        logger.error(`Email Failure: ${templateName} -> ${to}`, ex);
        return Promise.reject(ex);
      });
  }

  return Object.fromEntries(await Promise.all(TEMPLATE_NAMES
    .map((name) => compileTemplate(name)
      .then((send) => [name, send]))));
}
