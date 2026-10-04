// TypeScript mirror of schemas/content-spec.schema.json (only what the video engine reads).
export type ComponentName =
  | "TitleCard"
  | "ListCard"
  | "CodePanel"
  | "DataTable"
  | "RowHighlight"
  | "JoinMatcher"
  | "WindowFrame"
  | "FlowGraph"
  | "PartitionGrid"
  | "Comparison"
  | "Timeline"
  | "Callout"
  | "EndCard";

export type CodeLang = "sql" | "python" | "dax" | "yaml" | "bash" | "text";

export interface CodeBlock {
  lang: CodeLang;
  dialect?: string;
  setup?: string;
  code: string;
  expected_output?: string;
  verified?: boolean;
  needs_manual_check?: boolean;
}

export interface Scene {
  id: string;
  chapter?: string;
  duration_sec: number;
  beat?: string;
  on_screen_text: string[];
  narration?: string;
  component?: ComponentName;
  props?: Record<string, unknown>;
  code_block?: number;
}

export interface Spec {
  id: string;
  slug: string;
  title: string;
  format: "reel-animated" | "reel-list" | "longform" | "short";
  pillar: string;
  status: string;
  scheduled_for: string;
  history: unknown[];
  scenes?: Scene[];
  code_blocks?: CodeBlock[];
  [key: string]: unknown;
}
