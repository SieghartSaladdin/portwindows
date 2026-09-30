import { AIMessage, AIMessageChunk, type BaseMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { z } from "zod";
import { WALLPAPERS } from "@/lib/data";
import { createChatModel, getLlmConfig } from "@/lib/server/llm";
import { loadPortfolio } from "@/lib/server/portfolio";
import { isHttpUrl } from "@/lib/server/validation";
import type { PortfolioData } from "@/lib/types";
import { getSystemPrompt, OPEN_WINDOW_TARGETS } from "./prompts";
import type { AgentState, ChatAction } from "./state";

export class LlmNotConfiguredError extends Error {}

const DATA_UNAVAILABLE =
  "PORTFOLIO DATA UNAVAILABLE: the database could not be reached. Tell the person you are talking to that you cannot access the portfolio details right now and suggest trying again later. Do not guess.";

const WALLPAPER_IDS = WALLPAPERS.map((w) => w.id) as [string, ...string[]];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectLinks(data: PortfolioData): string[] {
  const p = data.profile;
  const urls = [
    p?.githubUrl,
    p?.linkedinUrl,
    p?.websiteUrl,
    ...data.projects.flatMap((proj) => [proj.githubUrl, proj.liveUrl]),
    ...data.certifications.map((c) => c.credentialUrl),
  ];
  return Array.from(new Set(urls.filter((u): u is string => !!u && isHttpUrl(u))));
}

const listOrEmpty = (items: string[], empty: string) => (items.length ? items.join("\n") : empty);

function buildContext(data: PortfolioData): string {
  const p = data.profile;
  const profileLines = p
    ? [
        `Name: ${p.name}`,
        `Title: ${p.title || "(not set)"}`,
        `Location: ${p.location || "(not set)"}`,
        `Email: ${p.email || "(not set)"}`,
        `Phone: ${p.phone || "(not set)"}`,
        `GitHub: ${p.githubUrl || "(not set)"}`,
        `LinkedIn: ${p.linkedinUrl || "(not set)"}`,
        `Website: ${p.websiteUrl || "(not set)"}`,
        `CV / resume available: ${p.resumeUrl ? "yes (in the Bio window)" : "no"}`,
      ].join("\n")
    : "The profile has not been set up yet.";

  return [
    `PROFILE\n${profileLines}`,
    `PROJECTS (${data.projects.length})\n${listOrEmpty(
      data.projects.map((x) => `- ${x.title} [id: ${x.id}]${x.tags.length ? ` (${x.tags.slice(0, 6).join(", ")})` : ""}`),
      "No projects have been added yet.",
    )}`,
    `SKILL GROUPS (${data.skills.length})\n${listOrEmpty(
      data.skills.map((s) => `- ${s.category}: ${s.skills.slice(0, 12).join(", ")}`),
      "No skills have been added yet.",
    )}`,
    `WORK EXPERIENCE (${data.experiences.length})\n${listOrEmpty(
      data.experiences.map((e) => `- ${e.role} at ${e.company} (${e.duration})`),
      "No work experience has been added yet.",
    )}`,
    `EDUCATION (${data.educations.length})\n${listOrEmpty(
      data.educations.map((e) => `- ${e.degree}${e.field ? ` in ${e.field}` : ""}, ${e.institution} (${e.period})`),
      "No education entries have been added yet.",
    )}`,
    `CERTIFICATIONS (${data.certifications.length})\n${listOrEmpty(
      data.certifications.map((c) => `- ${c.name}, ${c.issuer} (${c.date})`),
      "No certifications have been added yet.",
    )}`,
  ].join("\n\n");
}

function getToolCalls(message: BaseMessage | undefined) {
  if (!message) return [];
  if (AIMessage.isInstance(message) || AIMessageChunk.isInstance(message)) return message.tool_calls ?? [];
  return [];
}

const json = (value: unknown) => JSON.stringify(value, null, 2);

function matches(query: string, ...fields: (string | null | undefined | string[])[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => (Array.isArray(f) ? f.join(" ") : f || "").toLowerCase().includes(q));
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part && typeof part === "object" && "text" in part ? String(part.text) : ""))
      .join("");
  }
  return "";
}

// ---------------------------------------------------------------------------
// Tool definitions (HelperBot only)
// ---------------------------------------------------------------------------

const noArgs = z.object({});
const queryArg = (describe: string) => z.object({ query: z.string().max(200).describe(describe) });

const TOOLS = [
  { name: "get_profile_info", description: "Get the developer's profile: name, title, bio, location, email, phone, GitHub, LinkedIn, website and whether a CV is available.", schema: noArgs },
  { name: "list_all_projects", description: "List every project in the portfolio.", schema: noArgs },
  { name: "search_projects", description: "Search projects by keyword (title, description, role) or tech tag (e.g. 'React').", schema: queryArg("Keyword or tech tag") },
  { name: "get_project_details", description: "Get full details of one project by id or title.", schema: z.object({ titleOrId: z.string().max(200).describe("Project id or title") }) },
  { name: "list_all_skills", description: "List all skill groups and skills.", schema: noArgs },
  { name: "search_skills", description: "Search skills by category or technology keyword.", schema: queryArg("Category or technology keyword") },
  { name: "list_all_experiences", description: "List the full work history.", schema: noArgs },
  { name: "search_experiences", description: "Search work history by company, role or keyword.", schema: queryArg("Company, role or keyword") },
  { name: "list_educations", description: "List the developer's education history (schools, degrees, periods).", schema: noArgs },
  { name: "list_certifications", description: "List the developer's certifications (name, issuer, date, credential link).", schema: noArgs },
  {
    name: "open_window",
    description:
      "Open a desktop app: 'bio', 'projects', 'terminal', 'settings', 'frieren', 'admin' (Developer Hub), or 'projector' (preview one project; pass projectId).",
    schema: z.object({
      target: z.enum(OPEN_WINDOW_TARGETS),
      projectId: z.string().max(200).optional().describe("Project id or title, only for target 'projector'"),
    }),
  },
  { name: "change_wallpaper", description: "Change the desktop wallpaper.", schema: z.object({ theme: z.enum(WALLPAPER_IDS) }) },
  { name: "open_widgets", description: "Open the widgets panel on the desktop.", schema: noArgs },
  {
    name: "open_link",
    description: "Open a URL from the portfolio data (profile or project links) in a new tab. Never invent URLs.",
    schema: z.object({ url: z.string().max(2048).describe("An absolute URL taken from the portfolio data") }),
  },
];

// ---------------------------------------------------------------------------
// Graph nodes
// ---------------------------------------------------------------------------

/** Node 1: load a compact snapshot of the portfolio for the system prompt. */
export async function retrieveContext(state: AgentState) {
  if (state.partner !== "robot") return { contextData: "", allowedLinks: [] };
  try {
    const data = await loadPortfolio();
    return { contextData: buildContext(data), allowedLinks: collectLinks(data) };
  } catch (err) {
    console.error("[chat] could not load portfolio context:", err instanceof Error ? err.message : err);
    return { contextData: DATA_UNAVAILABLE, allowedLinks: [] };
  }
}

/** Node 2: call the LLM (HelperBot gets the data + UI tools). */
export async function callModel(state: AgentState) {
  const config = getLlmConfig();
  if (!config) throw new LlmNotConfiguredError("LLM is not configured");
  const model = createChatModel(config);

  const chatMessages = [new SystemMessage(getSystemPrompt(state.partner, state.speaker, state.contextData)), ...state.messages];
  const runnable = state.partner === "robot" ? model.bindTools(TOOLS) : model;
  const response = await runnable.invoke(chatMessages);

  return { messages: [response], output: contentToText(response.content) };
}

async function runDataTool(name: string, args: Record<string, unknown>): Promise<string> {
  let data: PortfolioData;
  try {
    data = await loadPortfolio();
  } catch {
    return DATA_UNAVAILABLE;
  }
  const q = typeof args.query === "string" ? args.query : "";

  switch (name) {
    case "get_profile_info": {
      if (!data.profile) return "The profile has not been set up yet.";
      const { avatarUrl, resumeUrl, ...rest } = data.profile;
      return json({ ...rest, hasAvatar: !!avatarUrl, hasResume: !!resumeUrl });
    }
    case "list_all_projects":
      return data.projects.length ? json(data.projects) : "No projects have been added to the portfolio yet.";
    case "search_projects": {
      if (!data.projects.length) return "No projects have been added to the portfolio yet.";
      const found = data.projects.filter((p) => matches(q, p.title, p.description, p.role, p.tags));
      return found.length ? json(found) : `No projects match '${q}'. The portfolio has ${data.projects.length} project(s).`;
    }
    case "get_project_details": {
      const key = (typeof args.titleOrId === "string" ? args.titleOrId : "").trim().toLowerCase();
      const found = key
        ? data.projects.find((p) => p.id.toLowerCase() === key || p.title.toLowerCase() === key) ||
          data.projects.find((p) => p.title.toLowerCase().includes(key) || key.includes(p.title.toLowerCase()))
        : undefined;
      return found ? json(found) : `No project named '${args.titleOrId}' exists in the portfolio.`;
    }
    case "list_all_skills":
      return data.skills.length ? json(data.skills) : "No skills have been added to the portfolio yet.";
    case "search_skills": {
      if (!data.skills.length) return "No skills have been added to the portfolio yet.";
      const found = data.skills.filter((s) => matches(q, s.category, s.skills));
      return found.length ? json(found) : `No skills match '${q}'.`;
    }
    case "list_all_experiences":
      return data.experiences.length ? json(data.experiences) : "No work experience has been added to the portfolio yet.";
    case "search_experiences": {
      if (!data.experiences.length) return "No work experience has been added to the portfolio yet.";
      const found = data.experiences.filter((e) => matches(q, e.role, e.company, e.description));
      return found.length ? json(found) : `No work experience matches '${q}'.`;
    }
    case "list_educations":
      return data.educations.length ? json(data.educations) : "No education entries have been added to the portfolio yet.";
    case "list_certifications":
      return data.certifications.length ? json(data.certifications) : "No certifications have been added to the portfolio yet.";
    default:
      return `Unknown tool '${name}'.`;
  }
}

/** Node 3: execute tool calls; UI tools record an action for the client. */
export async function executeTools(state: AgentState) {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = getToolCalls(lastMessage);
  const messages: ToolMessage[] = [];
  let action: ChatAction | null = state.action ?? null;

  for (const call of toolCalls) {
    const args = (call.args ?? {}) as Record<string, unknown>;
    let result: string;
    try {
      if (call.name === "open_window") {
        const target = String(args.target ?? "");
        if (!(OPEN_WINDOW_TARGETS as readonly string[]).includes(target)) {
          result = `Refused: '${target}' is not a desktop app.`;
        } else {
          const projectId = typeof args.projectId === "string" && args.projectId ? args.projectId : undefined;
          action = { type: "open_window", target, ...(projectId ? { projectId } : {}) };
          result = `Opening the '${target}' window${projectId ? ` for project '${projectId}'` : ""}.`;
        }
      } else if (call.name === "change_wallpaper") {
        const theme = String(args.theme ?? "");
        if (!WALLPAPER_IDS.includes(theme)) {
          result = `Refused: unknown wallpaper '${theme}'.`;
        } else {
          action = { type: "change_wallpaper", target: theme };
          result = `Changing the wallpaper to '${theme}'.`;
        }
      } else if (call.name === "open_widgets") {
        action = { type: "open_widgets" };
        result = "Opening the widgets panel.";
      } else if (call.name === "open_link") {
        const url = String(args.url ?? "").trim();
        if (!isHttpUrl(url) || !state.allowedLinks.includes(url)) {
          result = "Refused: that link is not part of the portfolio data. Only links from the profile or projects can be opened.";
        } else {
          action = { type: "open_link", target: url };
          result = `Opening ${url} in a new tab.`;
        }
      } else {
        result = await runDataTool(call.name, args);
      }
    } catch (err) {
      console.error(`[chat] tool ${call.name} failed:`, err instanceof Error ? err.message : err);
      result = `The tool '${call.name}' failed. Tell the visitor this information is unavailable right now.`;
    }

    messages.push(new ToolMessage({ content: result, tool_call_id: call.id ?? call.name, name: call.name }));
  }

  return { messages, action };
}

/** Conditional edge: keep looping while the model asks for tools. */
export function routeAfterModel(state: AgentState) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (getToolCalls(lastMessage).length > 0) {
    return "executeTools";
  }
  return "__end__";
}
