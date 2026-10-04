// Replace these with the real destinations before launch.
export const site = {
  name: "Moraje3",
  requestAccessUrl: "#request-access", // TODO: form, WhatsApp link or mailto
  loginUrl: "#login", // TODO: app login URL
  privacyUrl: "#privacy",
  termsUrl: "#terms",
};

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
