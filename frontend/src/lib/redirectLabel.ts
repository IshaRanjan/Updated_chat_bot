export function getRedirectLabel(title: string, url: string): string {
  const titleLower = title.toLowerCase();
  const urlLower = url.toLowerCase();

  if (titleLower.includes("book")) return "Book Session";
  if (titleLower.includes("browse")) return "Browse Therapists";
  if (titleLower.includes("take assessment") || titleLower.includes("start the assessment")) {
    return "Take Assessment";
  }
  if (titleLower.includes("pricing") || titleLower.includes("cost") || titleLower.includes("plan")) {
    return "View Pricing";
  }
  if (titleLower.includes("contact") || titleLower.includes("support")) return "Contact Support";
  if (titleLower.includes("privacy")) return "Privacy Policy";
  if (titleLower.includes("refund")) return "Refund Policy";
  if (titleLower.includes("about") || titleLower.includes("mission")) return "About MoodScale";

  if (urlLower.includes("/therapists") || urlLower.includes("book-with-therapist")) {
    return "Browse Therapists";
  }
  if (urlLower.includes("/assessments")) return "Take Assessment";
  if (urlLower.includes("pricing")) return "View Pricing";
  if (urlLower.includes("/about-us")) return "About MoodScale";
  if (urlLower.includes("/faqs")) return "View FAQs";
  if (urlLower.includes("/support")) return "Contact Support";
  if (urlLower.includes("/contact")) return "Contact Support";

  return "Visit Page";
}
