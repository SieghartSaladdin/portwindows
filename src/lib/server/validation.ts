import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitive rules
// ---------------------------------------------------------------------------

/** Files served by GET /api/uploads/[name]. */
export const UPLOAD_PATH_REGEX =
  /^\/api\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp|gif|pdf)$/;

/** True for absolute http(s) URLs or a path to a file uploaded through /api/upload. */
export function isAllowedUrl(value: string): boolean {
  if (UPLOAD_PATH_REGEX.test(value)) return true;
  return isHttpUrl(value);
}

/** True only for absolute http:// or https:// URLs. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && !!url.hostname;
  } catch {
    return false;
  }
}

const URL_MESSAGE = 'Must be an http(s) URL or an uploaded file path (/api/uploads/...)';

/** Required-when-present URL string. */
export const urlString = z
  .string()
  .trim()
  .max(2048, 'URL is too long')
  .refine(isAllowedUrl, URL_MESSAGE);

/**
 * Optional nullable text: `undefined` stays `undefined` (field untouched on update),
 * `null` / empty string become `null`.
 */
export function optionalText(max: number) {
  return z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === null ? null : v.trim() || null))
    .refine((v) => v === undefined || v === null || v.length <= max, `Must be at most ${max} characters`);
}

/** Optional nullable URL with the same empty → null rule as optionalText. */
export const optionalUrl = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === null ? null : v.trim() || null))
  .refine((v) => v === undefined || v === null || (v.length <= 2048 && isAllowedUrl(v)), URL_MESSAGE);

function requiredText(label: string, max: number) {
  return z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);
}

/** String array; also accepts a newline/comma separated string for convenience. */
function stringList(options: { maxItems: number; maxLength: number; separator: RegExp }) {
  return z.preprocess(
    (v) => (typeof v === 'string' ? v.split(options.separator) : v),
    z
      .array(z.string().max(options.maxLength, `Each item must be at most ${options.maxLength} characters`))
      .max(options.maxItems, `At most ${options.maxItems} items`)
      .transform((items) => items.map((s) => s.trim()).filter(Boolean)),
  );
}

const orderField = z.number().int().min(0).max(100000).optional();

// ---------------------------------------------------------------------------
// Entity schemas. `*CreateSchema` for POST, `*UpdateSchema` (all optional) for PUT.
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  name: requiredText('Name', 100),
  title: z.string().trim().max(150).optional(),
  location: z.string().trim().max(150).optional(),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === '' || z.email().safeParse(v).success, 'Must be a valid email address')
    .optional(),
  bio: z.string().trim().max(10000).optional(),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  websiteUrl: optionalUrl,
  phone: optionalText(50),
  avatarUrl: optionalUrl,
  resumeUrl: optionalUrl,
});

const projectShape = {
  title: requiredText('Title', 200),
  description: requiredText('Description', 5000),
  tags: stringList({ maxItems: 30, maxLength: 50, separator: /,/ }),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  images: z.array(urlString).max(20, 'At most 20 images'),
  featured: z.boolean(),
  role: optionalText(150),
  period: optionalText(100),
  order: orderField,
};
export const projectCreateSchema = z.object({
  ...projectShape,
  tags: projectShape.tags.optional(),
  images: projectShape.images.optional(),
  featured: projectShape.featured.optional(),
});
export const projectUpdateSchema = z.object(projectShape).partial();

const skillShape = {
  category: requiredText('Category', 100),
  skills: stringList({ maxItems: 100, maxLength: 60, separator: /,/ }),
  order: orderField,
};
export const skillCreateSchema = z.object(skillShape);
export const skillUpdateSchema = z.object(skillShape).partial();

const experienceShape = {
  role: requiredText('Role', 150),
  company: requiredText('Company', 150),
  duration: requiredText('Duration', 100),
  description: stringList({ maxItems: 30, maxLength: 1000, separator: /\r?\n/ }),
  order: orderField,
};
export const experienceCreateSchema = z.object({
  ...experienceShape,
  description: experienceShape.description.optional(),
});
export const experienceUpdateSchema = z.object(experienceShape).partial();

const educationShape = {
  institution: requiredText('Institution', 200),
  degree: requiredText('Degree', 150),
  field: optionalText(150),
  period: requiredText('Period', 100),
  description: optionalText(2000),
  order: orderField,
};
export const educationCreateSchema = z.object(educationShape);
export const educationUpdateSchema = z.object(educationShape).partial();

const certificationShape = {
  name: requiredText('Name', 200),
  issuer: requiredText('Issuer', 150),
  date: requiredText('Date', 50),
  credentialUrl: optionalUrl,
  order: orderField,
};
export const certificationCreateSchema = z.object(certificationShape);
export const certificationUpdateSchema = z.object(certificationShape).partial();

export const REORDER_ENTITIES = ['projects', 'skills', 'experiences', 'educations', 'certifications'] as const;
export type ReorderEntity = (typeof REORDER_ENTITIES)[number];

export const reorderSchema = z.object({
  entity: z.enum(REORDER_ENTITIES, { error: `entity must be one of: ${REORDER_ENTITIES.join(', ')}` }),
  ids: z
    .array(z.string().min(1).max(100))
    .min(1, 'ids must not be empty')
    .max(500)
    .refine((ids) => new Set(ids).size === ids.length, 'ids must be unique'),
});

export const contactSchema = z.object({
  name: requiredText('Name', 100),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .max(200, 'Email must be at most 200 characters')
    .pipe(z.email('Please enter a valid email address')),
  message: z
    .string({ error: 'Message is required' })
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters'),
  /** Honeypot: real visitors never fill this in. */
  website: z.string().max(500).optional(),
});

export const messagePatchSchema = z.object({
  read: z.boolean({ error: 'read must be a boolean' }),
});

export const loginSchema = z.object({
  username: z.string({ error: 'Username is required' }).min(1, 'Username is required').max(100),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required').max(200),
});

export const CHAT_PARTNERS = ['robot', 'stark', 'fern'] as const;
export type ChatPartner = (typeof CHAT_PARTNERS)[number];

/** Who is talking: Frieren (the visitor pressed E and plays her) or the plain visitor. */
export const CHAT_SPEAKERS = ['frieren', 'visitor'] as const;
export type ChatSpeaker = (typeof CHAT_SPEAKERS)[number];

/** Fern and Stark have always treated the speaker as Frieren; HelperBot treats them as a visitor. */
export function defaultSpeaker(partner: ChatPartner): ChatSpeaker {
  return partner === 'robot' ? 'visitor' : 'frieren';
}

export const chatSchema = z.object({
  message: z
    .string({ error: 'message is required' })
    .trim()
    .min(1, 'message is required')
    .max(2000, 'message must be at most 2000 characters'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4000, 'history items must be at most 4000 characters'),
      }),
    )
    .max(20, 'history must have at most 20 items')
    .optional()
    .default([]),
  partner: z.enum(CHAT_PARTNERS).optional().default('robot'),
  speaker: z.enum(CHAT_SPEAKERS).optional(),
});

// ---------------------------------------------------------------------------
// Error formatting
// ---------------------------------------------------------------------------

/** Flattens zod issues to `{ "field.path": "message" }` (first message per field). */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.map(String).join('.') : '_';
    if (!details[key]) details[key] = issue.message;
  }
  return details;
}
