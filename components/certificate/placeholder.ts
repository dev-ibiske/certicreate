import type { CertificateProps } from "./Certificate";

/**
 * Matches blueprint/references/cert-example.png, except the date, which uses
 * the app's DD/MM/YYYY format.
 */
export const PLACEHOLDER_CERTIFICATE: CertificateProps = {
  recipientName: "Student Name",
  courseTitle: "Coding With AI: Planning To Production",
  instructorName: "Brad Traversy",
  date: "13/07/2026",
};

/** Pre-fills the Instructor field until brand settings provide a saved default. */
export const DEFAULT_INSTRUCTOR = "Brad Traversy";
