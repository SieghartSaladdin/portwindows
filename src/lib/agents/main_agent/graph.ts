import { StateGraph } from "@langchain/langgraph";
import { GraphState } from "./state";
import { retrieveContext, callModel, executeTools, routeAfterModel } from "./nodes";

// Create the workflow builder
const workflow = new StateGraph(GraphState)
  .addNode("retrieveContext", retrieveContext)
  .addNode("callModel", callModel)
  .addNode("executeTools", executeTools)
  .addEdge("__start__", "retrieveContext")
  .addEdge("retrieveContext", "callModel")
  .addConditionalEdges("callModel", routeAfterModel)
  .addEdge("executeTools", "callModel");

// Compile the graph
export const graph = workflow.compile();
