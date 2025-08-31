import { ScholarshipApplicantSubmitPage } from "@/features/v2/scholarship/pages/applicant-submit";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/scholarships/$id/applicant-submit")({
  component: ScholarshipApplicantSubmitPage,
  validateSearch: (record) => {
    return {
      scholarshipData:
        typeof record?.scholarshipData === "string"
          ? record.scholarshipData
          : "{}",
    };
  },
});
