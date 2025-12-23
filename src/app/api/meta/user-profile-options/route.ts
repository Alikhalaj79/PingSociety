import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

const CANDIDATE_ENDPOINTS = [
  "/meta/user-profile-options",
  "/meta/profile-options",
  "/meta/options",
  "/users/meta",
];

export async function GET(_req: NextRequest) {
  for (const ep of CANDIDATE_ENDPOINTS) {
    try {
      const url = `${API_CONFIG.BASE_URL}${ep}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      });
      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        continue;
      }
      if (!res.ok) continue;

      // Expecting structure like { fieldOfActivity: [...], source: [...] }
      const fieldOfActivity =
        json.fieldOfActivity || json.field_of_activity || json.activities || [];
      const source = json.source || json.sources || [];

      return NextResponse.json({ success: true, fieldOfActivity, source });
    } catch {
      // try next endpoint
      continue;
    }
  }

  // Fallback defaults
  return NextResponse.json({
    success: true,
    fieldOfActivity: [
      { value: "software_development", label: "Software Development" },
      { value: "frontend_developer", label: "Frontend Developer" },
      { value: "design_ux", label: "Design / UX" },
      { value: "product_management", label: "Product Management" },
      { value: "data_science", label: "Data Science" },
      { value: "devops", label: "DevOps" },
      { value: "cybersecurity", label: "Cybersecurity" },
      { value: "ai_ml", label: "AI / ML" },
      { value: "blockchain", label: "Blockchain" },
      { value: "cloud_computing", label: "Cloud Computing" },
      { value: "mobile_development", label: "Mobile Development" },
      { value: "game_development", label: "Game Development" },
      { value: "qa_testing", label: "QA / Testing" },
      { value: "it_management", label: "IT Management" },
      { value: "sales_marketing", label: "Sales / Marketing" },
      { value: "others", label: "Others" },
    ],
    source: [
      { value: "website", label: "وب‌سایت" },
      { value: "linkedin", label: "LinkedIn" },
      { value: "instagram", label: "Instagram" },
      { value: "word_of_mouth", label: "دوستان و آشنایان" },
      { value: "others", label: "سایر" },
    ],
  });
}
