import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export type ChatPartner = 'robot' | 'stark' | 'fern';

/** UI action the client may perform after a HelperBot reply. */
export type ChatAction =
  | { type: 'open_window'; target: string; projectId?: string }
  | { type: 'open_widgets' }
  | { type: 'open_link'; target: string }
  | { type: 'change_wallpaper'; target: string };

export const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  partner: Annotation<ChatPartner>(),
  contextData: Annotation<string>(),
  /** Absolute http(s) URLs present in the portfolio data; the only links open_link may open. */
  allowedLinks: Annotation<string[]>({
    reducer: (_x, y) => y,
    default: () => [],
  }),
  action: Annotation<ChatAction | null>({
    reducer: (_x, y) => y,
    default: () => null,
  }),
  output: Annotation<string>(),
});

export type AgentState = typeof GraphState.State;
