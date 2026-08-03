import { prisma } from "@/lib/db";
import { PROFILE, PROJECTS, SKILLS, EXPERIENCES } from "@/lib/data";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { getSystemPrompt } from "./prompts";
import { z } from "zod";

// Node 1: Retrieve context data overview from DB
export async function retrieveContext(state: any) {
  if (state.partner !== 'robot') {
    return { contextData: "" };
  }

  try {
    const dbProfile = await prisma.profile.findUnique({ where: { id: '1' } });
    const profileName = dbProfile?.name || PROFILE.name;
    const profileTitle = dbProfile?.title || PROFILE.title;

    const contextData = `Developer Name: ${profileName}, Role: ${profileTitle}. Database tools are active for live querying.`;
    return { contextData };
  } catch (err) {
    const contextData = `Developer Name: ${PROFILE.name}, Role: ${PROFILE.title}. Database tools active.`;
    return { contextData };
  }
}

// Node 2: Call the LLM with Database Query & UI Action Tools
export async function callModel(state: any) {
  const provider = process.env.LLM_PROVIDER || 'openrouter';
  const apiKey = process.env.LLM_API_KEY || process.env.OPENROUTER_API_KEY || '';
  const modelName = process.env.LLM_MODEL || 'google/gemma-4-31b-it:free';
  const apiBaseUrl = process.env.LLM_API_BASE_URL || 'https://openrouter.ai/api/v1';

  // Initialize ChatOpenAI client compatible with OpenRouter / Ollama
  let model: ChatOpenAI;
  if (provider === 'ollama') {
    model = new ChatOpenAI({
      apiKey: 'none',
      configuration: {
        baseURL: `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/v1`,
      },
      model: process.env.OLLAMA_MODEL || 'gemma2',
      temperature: 0.2,
    });
  } else {
    model = new ChatOpenAI({
      apiKey: apiKey || 'none',
      configuration: {
        baseURL: apiBaseUrl,
        defaultHeaders: {
          'HTTP-Referer': 'https://github.com/google-gemini',
          'X-Title': 'PortWindows',
        }
      },
      model: modelName,
      temperature: 0.2,
    });
  }

  const systemMessage = new SystemMessage(getSystemPrompt(state.partner, state.contextData));
  const chatMessages = [systemMessage, ...state.messages];

  // Define full suite of Database Query & UI Action tools for HelperBot
  let finalModel: any = model;
  if (state.partner === 'robot') {
    // --- Database Query Tools ---
    const getProfileInfoTool = {
      name: "get_profile_info",
      description: "Retrieve developer's full profile details (name, title, bio, email, location, GitHub, LinkedIn).",
      schema: z.object({}),
    };

    const listAllProjectsTool = {
      name: "list_all_projects",
      description: "Retrieve a complete list of developer projects stored in the portfolio database.",
      schema: z.object({}),
    };

    const searchProjectsTool = {
      name: "search_projects",
      description: "Search and filter developer projects by keyword (title, description) or tech stack tag (e.g. 'React', 'IoT', 'Next.js', 'Python').",
      schema: z.object({
        query: z.string().describe("Keyword or tech stack tag to search for in projects"),
      }),
    };

    const getProjectDetailsTool = {
      name: "get_project_details",
      description: "Retrieve full details and metadata for a specific project by title or ID.",
      schema: z.object({
        titleOrId: z.string().describe("Title or unique ID of the project"),
      }),
    };

    const listAllSkillsTool = {
      name: "list_all_skills",
      description: "Retrieve all skill categories and technical skills from the database.",
      schema: z.object({}),
    };

    const searchSkillsTool = {
      name: "search_skills",
      description: "Search/filter technical skills by category (e.g. 'Frontend', 'Database') or specific technology keyword.",
      schema: z.object({
        query: z.string().describe("Category or technology keyword to search in skills matrix"),
      }),
    };

    const listAllExperiencesTool = {
      name: "list_all_experiences",
      description: "Retrieve complete work history timeline and career experiences from the database.",
      schema: z.object({}),
    };

    const searchExperiencesTool = {
      name: "search_experiences",
      description: "Filter work history timeline by company, role, or keyword.",
      schema: z.object({
        query: z.string().describe("Company, role, or keyword to search in work experience history"),
      }),
    };

    // --- UI Action Tools ---
    const openWindowTool = {
      name: "open_window",
      description: "Launch desktop applications. Targets: 'projects' (folder), 'bio' (notepad), 'terminal' (shell), 'settings' (control panel), 'projector' (media screen preview). For 'projector', specify the 'projectId' (id or title of the project to preview).",
      schema: z.object({
        target: z.enum(["projects", "bio", "terminal", "settings", "projector"]),
        projectId: z.string().optional().describe("Exact ID or title of the project to preview when target is 'projector'"),
      }),
    };

    const changeWallpaperTool = {
      name: "change_wallpaper",
      description: "Change the desktop background wallpaper gradient. Supported themes: 'default' (blue), 'sunset' (red), 'emerald' (green), 'cyberpunk' (neon).",
      schema: z.object({
        theme: z.enum(["default", "sunset", "emerald", "cyberpunk"]),
      }),
    };

    const openWidgetsTool = {
      name: "open_widgets",
      description: "Slide open the left-side widgets panel (weather, calendar, CPU stats).",
      schema: z.object({}),
    };

    const openLinkTool = {
      name: "open_link",
      description: "Open external profile URLs in a new browser tab (e.g. GitHub or LinkedIn links).",
      schema: z.object({
        url: z.string().describe("The full absolute URL to open"),
      }),
    };

    finalModel = model.bindTools([
      getProfileInfoTool,
      listAllProjectsTool,
      searchProjectsTool,
      getProjectDetailsTool,
      listAllSkillsTool,
      searchSkillsTool,
      listAllExperiencesTool,
      searchExperiencesTool,
      openWindowTool,
      changeWallpaperTool,
      openWidgetsTool,
      openLinkTool,
    ]);
  }

  // Invoke model
  const response = await finalModel.invoke(chatMessages);
  const rawContent = response.content as string;

  return {
    messages: [response],
    output: rawContent,
    action: state.action
  };
}

// Node 3: Execute tool calls and store action payloads / DB Query results
export async function executeTools(state: any) {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = lastMessage.tool_calls || [];
  
  const messages: ToolMessage[] = [];
  let actionJson: any = state.action || null;

  for (const call of toolCalls) {
    let result = "";

    try {
      // --- DB Query Tools Execution ---
      if (call.name === "get_profile_info") {
        const dbProf = await prisma.profile.findUnique({ where: { id: '1' } });
        const data = dbProf || PROFILE;
        result = JSON.stringify(data, null, 2);
      } else if (call.name === "list_all_projects") {
        const dbProjs = await prisma.project.findMany();
        const data = dbProjs.length > 0 ? dbProjs : PROJECTS;
        result = JSON.stringify(data, null, 2);
      } else if (call.name === "search_projects") {
        const q = (call.args.query || "").toLowerCase();
        const dbProjs = await prisma.project.findMany();
        const pool = dbProjs.length > 0 ? dbProjs : PROJECTS;
        const matches = pool.filter((p: any) => {
          const t = (p.title || "").toLowerCase();
          const d = (p.description || "").toLowerCase();
          const tags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : (p.tags || "").toLowerCase();
          return t.includes(q) || d.includes(q) || tags.includes(q);
        });
        result = matches.length > 0 
          ? JSON.stringify(matches, null, 2) 
          : `No projects found matching query '${call.args.query}'. Total projects available: ${pool.length}.`;
      } else if (call.name === "get_project_details") {
        const q = (call.args.titleOrId || "").toLowerCase();
        const dbProjs = await prisma.project.findMany();
        const pool = dbProjs.length > 0 ? dbProjs : PROJECTS;
        const match = pool.find((p: any) => 
          p.id.toLowerCase() === q || 
          p.title.toLowerCase().includes(q) ||
          q.includes(p.title.toLowerCase())
        );
        result = match ? JSON.stringify(match, null, 2) : `Project '${call.args.titleOrId}' not found.`;
      } else if (call.name === "list_all_skills") {
        const dbSkills = await prisma.skill.findMany();
        const data = dbSkills.length > 0 ? dbSkills : SKILLS;
        result = JSON.stringify(data, null, 2);
      } else if (call.name === "search_skills") {
        const q = (call.args.query || "").toLowerCase();
        const dbSkills = await prisma.skill.findMany();
        const pool = dbSkills.length > 0 ? dbSkills : SKILLS;
        const matches = pool.filter((s: any) => {
          const cat = (s.category || "").toLowerCase();
          const items = Array.isArray(s.skills) ? s.skills.join(" ").toLowerCase() : (s.skills || "").toLowerCase();
          return cat.includes(q) || items.includes(q);
        });
        result = matches.length > 0 
          ? JSON.stringify(matches, null, 2) 
          : `No skills found matching query '${call.args.query}'.`;
      } else if (call.name === "list_all_experiences") {
        const dbExp = await prisma.experience.findMany();
        const data = dbExp.length > 0 ? dbExp : EXPERIENCES;
        result = JSON.stringify(data, null, 2);
      } else if (call.name === "search_experiences") {
        const q = (call.args.query || "").toLowerCase();
        const dbExp = await prisma.experience.findMany();
        const pool = dbExp.length > 0 ? dbExp : EXPERIENCES;
        const matches = pool.filter((e: any) => {
          const r = (e.role || "").toLowerCase();
          const c = (e.company || "").toLowerCase();
          const desc = Array.isArray(e.description) ? e.description.join(" ").toLowerCase() : (e.description || "").toLowerCase();
          return r.includes(q) || c.includes(q) || desc.includes(q);
        });
        result = matches.length > 0 
          ? JSON.stringify(matches, null, 2) 
          : `No experiences found matching query '${call.args.query}'.`;
      } 
      // --- UI Action Tools Execution ---
      else if (call.name === "open_window") {
        actionJson = { type: "open_window", target: call.args.target, projectId: call.args.projectId };
        result = `Successfully requested opening window: ${call.args.target}${call.args.projectId ? ` with project ID: ${call.args.projectId}` : ''}`;
      } else if (call.name === "change_wallpaper") {
        actionJson = { type: "change_wallpaper", target: call.args.theme };
        result = `Successfully requested changing wallpaper theme to: ${call.args.theme}`;
      } else if (call.name === "open_widgets") {
        actionJson = { type: "open_widgets" };
        result = "Successfully requested opening widgets board panel on the left.";
      } else if (call.name === "open_link") {
        actionJson = { type: "open_link", target: call.args.url };
        result = `Successfully requested opening external link: ${call.args.url}`;
      }
    } catch (err: any) {
      result = `Error executing tool ${call.name}: ${err?.message || err}`;
    }
    
    messages.push(new ToolMessage({
      content: result,
      tool_call_id: call.id,
      name: call.name
    }));
  }

  return {
    messages,
    action: actionJson
  };
}

// Conditional edge router
export function routeAfterModel(state: any) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "executeTools";
  }
  return "__end__";
}
