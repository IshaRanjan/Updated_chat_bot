const fs = require("fs");
const path = require("path");
const { createHash } = require("crypto");

const idMap = new Map();

function uuid(seed) {
  if (!idMap.has(seed)) {
    const hash = createHash("sha256").update(`moodscale-faq-v2-${seed}`).digest("hex");
    idMap.set(
      seed,
      `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`
    );
  }
  return idMap.get(seed);
}

function esc(value) {
  return value.replace(/'/g, "''");
}

function sqlVal(value) {
  if (value === null || value === undefined) return "null";
  return `'${esc(value)}'`;
}

function row(seed, parentSeed, nodeType, title, answer, redirectUrl, sortOrder) {
  const id = uuid(seed);
  const parentId = parentSeed ? `'${uuid(parentSeed)}'` : "null";
  const answerSql = answer ? `'${esc(answer)}'` : "null";
  const redirectSql = redirectUrl ? `'${esc(redirectUrl)}'` : "null";
  return `('${id}', ${parentId}, '${nodeType}', '${esc(title)}', ${answerSql}, ${redirectSql}, ${sortOrder}, true)`;
}

const rows = [];

function add(seed, parentSeed, nodeType, title, answer, redirectUrl, sortOrder) {
  rows.push(row(seed, parentSeed, nodeType, title, answer, redirectUrl, sortOrder));
}

const assessments = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../assessment_templates.json"), "utf8").replace(/^\uFEFF/, "")
).data;

const assessmentCategories = {
  anxiety_stress: [
    "gad-7-anxiety-assessment",
    "depression-anxiety-stress-scales-21-dass-21",
    "ptsd-checklist-for-dsm-5-pcl-5",
    "screen-for-child-anxiety-related-disorders-scared",
    "hamilton-anxiety-rating-scale-ham-a",
    "liebowitz-social-anxiety-scale-lsas",
    "panic-disorder-severity-scale-pdss",
  ],
  adhd_attention: ["adult-adhd-self-report-scale-v11"],
  personality: ["big-five-personality-assessment-bfi-10"],
  depression_mood: [
    "patient-health-questionnaire-9-phq-9",
    "beck-depression-inventory-ii-bdi-ii",
    "mood-disorder-questionnaire-mdq",
  ],
  comprehensive: ["comprehensive-anxiety-assessment"],
  other: [
    "eating-attitudes-test-26-eat-26",
    "barratt-impulsiveness-scale-15-bis-15",
    "autism-spectrum-quotient-50-aq-50",
  ],
};

const assessmentBySlug = Object.fromEntries(assessments.map((a) => [a.slug, a]));

// Quick Book
add("quick_book", null, "category", "Quick Book", null, "https://moodscale.in/sessions/book-with-therapist", 0);
add(
  "qb_essential",
  "quick_book",
  "question",
  "Essential",
  "Essential Care at ₹1,199 per session (save 52% from ₹2,500). Includes one 50-minute therapy session, expert therapist matching, 24/7 email support, and post-session guidance. Ideal for trying therapy or addressing a specific concern.",
  "https://moodscale.in/sessions/book-with-therapist",
  0
);
add(
  "qb_premium",
  "quick_book",
  "question",
  "Premium",
  "Premium Journey at ₹3,999 per package (save 67% from ₹12,000). Includes 4 therapy sessions, 1 assessment session, a wellness report, personalised scheduling, and 24/7 priority support. Best for sustained progress over a month.",
  "https://moodscale.in/sessions/book-with-therapist",
  1
);
add(
  "qb_transformative",
  "quick_book",
  "question",
  "Transformative",
  "Transformative Care at ₹12,599 per program (save 50% from ₹25,000). Includes 12 therapy sessions, 4 psychometric assessments, monthly and annual wellness reports, and 24/7 priority support. Designed for deep, long-term mental wellness transformation.",
  "https://moodscale.in/sessions/book-with-therapist",
  2
);

// Services
add("services", null, "category", "Services", null, "https://moodscale.in/#services", 1);

add("svc_therapy", "services", "subcategory", "Therapy Sessions", null, "https://moodscale.in/therapists", 0);
add(
  "svc_find_therapist",
  "svc_therapy",
  "question",
  "Find a Therapist",
  "Browse licensed MoodScale therapists matched to your needs. Filter by expertise, approach, and availability, then book online or in-person sessions.",
  "https://moodscale.in/therapists",
  0
);

add("svc_assessments", "services", "subcategory", "Assessments", null, "https://moodscale.in/open-assessments", 1);

const categoryMeta = [
  ["svc_cat_anxiety", "Anxiety and Stress", 0],
  ["svc_cat_adhd", "ADHD and Attention", 1],
  ["svc_cat_personality", "Personality", 2],
  ["svc_cat_depression", "Depression and Mood", 3],
  ["svc_cat_comprehensive", "Comprehensive", 4],
  ["svc_cat_other", "Other", 5],
];

for (const [seed, title, order] of categoryMeta) {
  add(seed, "svc_assessments", "subcategory", title, null, "https://moodscale.in/open-assessments", order);
}

const slugToCategorySeed = {};
for (const [catKey, slugs] of Object.entries(assessmentCategories)) {
  const seedMap = {
    anxiety_stress: "svc_cat_anxiety",
    adhd_attention: "svc_cat_adhd",
    personality: "svc_cat_personality",
    depression_mood: "svc_cat_depression",
    comprehensive: "svc_cat_comprehensive",
    other: "svc_cat_other",
  };
  const parentSeed = seedMap[catKey];
  slugs.forEach((slug, index) => {
    const a = assessmentBySlug[slug];
    if (!a) return;
    const desc = `${a.description} Takes about ${a.estimated_duration_minutes} minutes. ${a.badge} assessment.`;
    add(`assessment_${slug}`, parentSeed, "question", a.name, desc, `https://moodscale.in/open-assessments/${slug}`, index);
  });
}

add(
  "svc_nature_retreat",
  "services",
  "question",
  "Nature Retreat",
  "Coming Soon",
  "https://moodscale.in/features/nature-retreat",
  2
);
add(
  "svc_wellness_centres",
  "services",
  "question",
  "Wellness Centres",
  "Coming Soon",
  "https://moodscale.in/features/wellness-centers",
  3
);

// FAQs
add("faqs", null, "category", "FAQs", null, "https://moodscale.in/faqs", 2);

add("faq_therapy_details", "faqs", "subcategory", "Therapy Session Details", null, "https://moodscale.in/faqs", 0);
add("faq_pre_session", "faq_therapy_details", "subcategory", "Pre Session FAQs", null, "https://moodscale.in/faqs", 0);
add("faq_post_session", "faq_therapy_details", "subcategory", "Post Session FAQs", null, "https://moodscale.in/faqs", 1);

const preSessionFaqs = [
  [
    "How do I prepare for my first therapy session?",
    "Find a quiet, private space with a stable internet connection for online sessions. Reflect on what you want to discuss and note any questions. Arrive a few minutes early to settle in.",
  ],
  [
    "What should I bring to my session?",
    "Bring any notes about symptoms, goals, or questions. For follow-up sessions, jot down observations since your last visit. No special documents are required for your first session.",
  ],
  [
    "How long is a therapy session?",
    "Standard individual therapy sessions are 50 minutes. Couples sessions may run 60–90 minutes depending on your therapist and plan.",
  ],
  [
    "Can I choose between online and in-person sessions?",
    "Yes. MoodScale offers both online and in-person therapy. You can select your preferred format when booking with your therapist.",
  ],
  [
    "Is my session confidential?",
    "Yes. All sessions are confidential and conducted in a secure environment. MoodScale follows strict privacy standards to protect your information.",
  ],
];

preSessionFaqs.forEach(([title, answer], i) => {
  add(`faq_pre_${i}`, "faq_pre_session", "question", title, answer, "https://moodscale.in/faqs", i);
});

const postSessionFaqs = [
  [
    "What happens after my therapy session?",
    "Your therapist may share insights, coping strategies, or homework to practice before the next session. You will receive guidance on scheduling follow-up sessions as needed.",
  ],
  [
    "Will I receive session notes or a summary?",
    "Depending on your plan, you may receive post-session guidance or wellness notes. Premium and Transformative plans include structured wellness reports.",
  ],
  [
    "How often should I attend therapy?",
    "Most clients begin with weekly or bi-weekly sessions. Your therapist will recommend a frequency based on your goals and progress.",
  ],
  [
    "Can I switch therapists if needed?",
    "Yes. If you feel your current therapist is not the right fit, contact MoodScale support and we will help you find a better match.",
  ],
  [
    "How do I book my next session?",
    "Book your next session through your MoodScale dashboard or the booking page. Premium and Transformative plans include personalised scheduling support.",
  ],
];

postSessionFaqs.forEach(([title, answer], i) => {
  add(`faq_post_${i}`, "faq_post_session", "question", title, answer, "https://moodscale.in/faqs", i);
});

add("faq_assessments_section", "faqs", "subcategory", "Assessments", null, "https://moodscale.in/open-assessments", 1);

const assessmentFaqs = [
  [
    "How do MoodScale assessments work?",
    "Take a scientifically validated assessment, receive a detailed report with insights, and use your results to guide therapy and personal growth.",
  ],
  [
    "Are assessments free or paid?",
    "MoodScale offers free assessments such as GAD-7, PHQ-9, and BFI-10, plus premium assessments for deeper clinical insights.",
  ],
  [
    "How long do assessments take?",
    "Most assessments take 5–20 minutes depending on the tool. Duration is shown on each assessment card before you begin.",
  ],
  [
    "Can I discuss my results with a therapist?",
    "Yes. Share your assessment results with a MoodScale psychologist to build a personalised treatment plan.",
  ],
  [
    "Are MoodScale assessments scientifically validated?",
    "Yes. Our assessments use established psychological frameworks and are designed by mental health professionals.",
  ],
];

assessmentFaqs.forEach(([title, answer], i) => {
  add(`faq_assess_${i}`, "faq_assessments_section", "question", title, answer, "https://moodscale.in/open-assessments", i);
});

add("faq_cancellations", "faqs", "subcategory", "Cancellations and Refunds", null, "https://moodscale.in/policies/refund-policy", 2);

const cancellationFaqs = [
  [
    "What is MoodScale's cancellation policy?",
    "Sessions can be rescheduled or cancelled according to our service delivery policy. Please cancel at least 24 hours before your scheduled session to avoid charges.",
  ],
  [
    "How do I cancel or reschedule a session?",
    "Cancel or reschedule through your MoodScale dashboard or by contacting support at contact@moodscale.in or +91 9145607891.",
  ],
  [
    "Am I eligible for a refund?",
    "Refund eligibility depends on your plan and timing of cancellation. See our Refund Policy for full details.",
  ],
  [
    "What if my therapist cancels the session?",
    "If your therapist cancels, you will receive a full credit or the option to reschedule at no additional cost.",
  ],
  [
    "How long do refunds take to process?",
    "Approved refunds are typically processed within 5–7 business days to your original payment method.",
  ],
];

cancellationFaqs.forEach(([title, answer], i) => {
  add(`faq_cancel_${i}`, "faq_cancellations", "question", title, answer, "https://moodscale.in/policies/refund-policy", i);
});

// Get in Touch
add("get_in_touch", null, "category", "Get in Touch", null, "https://moodscale.in/#contact", 3);
add(
  "git_contact_form",
  "get_in_touch",
  "question",
  "Contact Form",
  "Send us a message through the MoodScale contact form and our team will respond within 24 hours.",
  "https://moodscale.in/#contact",
  0
);
add(
  "git_call_us",
  "get_in_touch",
  "question",
  "Call Us",
  "Speak with our team Monday–Friday, 9:00 AM–8:00 PM at +91 9145607891.",
  "https://moodscale.in/#contact",
  1
);
add(
  "git_email_us",
  "get_in_touch",
  "question",
  "Email Us",
  "Email contact@moodscale.in for inquiries. We respond within 24 hours on business days.",
  "https://moodscale.in/#contact",
  2
);

const sql = `-- MoodScale FAQ Navigator seed data
-- Run after schema.sql

truncate table faq_nodes cascade;

insert into faq_nodes (id, parent_id, node_type, title, answer, redirect_url, sort_order, is_active)
values
${rows.join(",\n")};
`;

const outPath = path.join(__dirname, "../supabase/seed.sql");
fs.writeFileSync(outPath, sql);
console.log(`Generated ${rows.length} rows -> ${outPath}`);
