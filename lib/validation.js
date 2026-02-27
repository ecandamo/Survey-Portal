import { z } from "zod";

export const SurveySchema = z.object({
  role: z.enum(["Sales Rep", "Marketing", "Sales Operations", "Other"]),
  overallValue: z.number().int().min(1).max(5),
  pipelineValue: z.number().int().min(1).max(5),
  huddleValue: z.number().int().min(1).max(5),
  timeInvestment: z.enum(["Too much time", "Slightly too much time", "About right", "Too little time"]),
  pipelineChanges: z.array(z.string()).max(2),
  pipelineOther: z.string().max(500).optional().or(z.literal("")),
  huddleChanges: z.array(z.string()).max(2),
  huddleOther: z.string().max(500).optional().or(z.literal("")),
  meetingTiming: z.enum(["Works well", "Somewhat challenging", "Very challenging"]),
  improveOneThing: z.string().max(1500).optional().or(z.literal("")),
  anythingElse: z.string().max(1500).optional().or(z.literal(""))
});
