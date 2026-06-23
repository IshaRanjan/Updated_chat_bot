/**
 * redirectLabel.ts
 *
 * Maps a node title + redirect_url to the correct CTA button label.
 *
 * Priority order:
 *  1. URL-path rules  — most deterministic
 *  2. Title keywords  — fallback for ambiguous URLs
 *  3. Default         — "Visit Page"
 *
 * Rules are ordered from most-specific to least-specific so the first
 * match wins.
 */

export function getRedirectLabel(title: string, url: string): string {
  const t = title.toLowerCase();
  const u = url.toLowerCase();

  // ── Booking flow ──────────────────────────────────────────────────────────
  // Must come before /therapists so the booking path wins.
  if (
    u.includes("book-with-therapist") ||
    u.includes("/sessions/book") ||
    u.includes("/book-session")
  ) {
    return "Book Session";
  }

  // ── Therapist listing / browse ────────────────────────────────────────────
  if (
    u.includes("/therapists") ||
    t.includes("browse therapist") ||
    t.includes("find a therapist") ||
    t.includes("find therapist")
  ) {
    return "Browse Therapists";
  }

  // ── Assessments ───────────────────────────────────────────────────────────
  if (
    u.includes("/assessments") ||
    u.includes("/open-assessments") ||
    t.includes("take assessment") ||
    t.includes("start the assessment") ||
    t.includes("start assessment")
  ) {
    return "Start Assessment";
  }

  // ── Pricing ───────────────────────────────────────────────────────────────
  if (
    u.includes("pricing") ||
    t.includes("pricing") ||
    t.includes("cost") ||
    t.includes("plan")
  ) {
    return "View Pricing";
  }

  // ── Support / Contact ─────────────────────────────────────────────────────
  if (
    u.includes("/support") ||
    u.includes("/contact") ||
    u.includes("#contact") ||
    t.includes("contact") ||
    t.includes("support")
  ) {
    return "Contact Us";
  }

  // ── Policies ──────────────────────────────────────────────────────────────
  if (u.includes("refund") || t.includes("refund")) {
    return "Refund Policy";
  }

  if (u.includes("privacy") || t.includes("privacy")) {
    return "Privacy Policy";
  }

  // ── Feature / info pages ──────────────────────────────────────────────────
  if (u.includes("/features/nature-retreat") || t.includes("nature retreat")) {
    return "Learn More";
  }

  if (u.includes("/features/wellness") || t.includes("wellness centre")) {
    return "Learn More";
  }

  // ── About / Mission ───────────────────────────────────────────────────────
  if (
    u.includes("/about") ||
    t.includes("about") ||
    t.includes("mission")
  ) {
    return "About MoodScale";
  }

  // ── FAQs ──────────────────────────────────────────────────────────────────
  if (u.includes("/faqs") || t.includes("faq")) {
    return "View FAQs";
  }

  // ── Default ───────────────────────────────────────────────────────────────
  return "Visit Page";
}