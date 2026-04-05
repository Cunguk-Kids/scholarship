import { Hono } from "hono";
import { programsRoute } from "./programs.route";
import { applicantsRoute } from "./applicants.route";
import { scholarsRoute } from "./scholars.route";
import { milestonesRoute } from "./milestones.route";
import { votesRoute } from "./votes.route";
import { disputesRoute } from "./disputes.route";
import { reputationRoute } from "./reputation.route";
import { dashboardRoute } from "./dashboard.route";
import { adminRoute } from "./admin.route";

/**
 * v4 REST API — all routes mounted under /v4/ prefix.
 *
 * GET /v4/programs              → list programs (with filters)
 * GET /v4/programs/:id          → single program detail
 * GET /v4/applicants?wallet=    → applicants by wallet
 * GET /v4/programs/:id/applicants → applicants for a program
 * GET /v4/scholars?wallet=      → scholars by wallet
 * GET /v4/programs/:id/scholars → scholars for a program
 * GET /v4/milestones?scholar=   → milestones by scholar wallet
 * GET /v4/programs/:id/milestones → milestones for a program
 * GET /v4/votes?voter=          → votes by voter
 * GET /v4/programs/:id/votes    → votes for a program
 * GET /v4/disputes              → list disputes
 * GET /v4/disputes/:id          → single dispute detail
 * GET /v4/programs/:id/disputes → disputes for a program
 * GET /v4/reputation/:address   → REP balance for address
 * GET /v4/dashboard/:wallet     → aggregated dashboard for a wallet
 */
export const v4Routes = new Hono();

v4Routes.route("/programs", programsRoute);
v4Routes.route("/applicants", applicantsRoute);
v4Routes.route("/scholars", scholarsRoute);
v4Routes.route("/milestones", milestonesRoute);
v4Routes.route("/votes", votesRoute);
v4Routes.route("/disputes", disputesRoute);
v4Routes.route("/reputation", reputationRoute);
v4Routes.route("/dashboard", dashboardRoute);
v4Routes.route("/admin", adminRoute);
