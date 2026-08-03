import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export interface AgentState {
  messages: BaseMessage[];
  partner: 'robot' | 'stark' | 'fern';
  contextData: string;
  action: any;
  output: string;
}

export const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  partner: Annotation<'robot' | 'stark' | 'fern'>(),
  contextData: Annotation<string>(),
  action: Annotation<any>(),
  output: Annotation<string>(),
});
