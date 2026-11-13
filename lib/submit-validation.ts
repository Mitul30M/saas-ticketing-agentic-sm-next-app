export interface SubmitValues {
  from_name: string;
  from_email: string;
  subject: string;
  body: string;
}

export type SubmitField = keyof SubmitValues;

export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const NAME_LIMIT = 200;
export const EMAIL_LIMIT = 320;
export const SUBJECT_LIMIT = 200;
export const BODY_LIMIT = 10_000;

/** Mirrors the backend's POST /api/tickets constraints (guide §4.2). */
export function validateSubmit(values: SubmitValues): Partial<Record<SubmitField, string>> {
  const errors: Partial<Record<SubmitField, string>> = {};
  const name = values.from_name.trim();
  const email = values.from_email.trim();
  const subject = values.subject.trim();
  const body = values.body.trim();

  if (name.length > NAME_LIMIT) errors.from_name = "Use 200 characters or fewer.";
  if (!email) errors.from_email = "Enter an email address so we can reply.";
  else if (!EMAIL_PATTERN.test(email) || email.length < 3 || email.length > EMAIL_LIMIT) {
    errors.from_email = "Enter a valid email address.";
  }
  if (!subject) errors.subject = "Add a short subject.";
  else if (subject.length > SUBJECT_LIMIT) errors.subject = "Use 200 characters or fewer.";
  if (!body) errors.body = "Tell us what you need help with.";
  else if (body.length > BODY_LIMIT) errors.body = "Use 10,000 characters or fewer.";

  return errors;
}
