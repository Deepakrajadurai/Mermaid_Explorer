
export type DiagramType = 
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'state'
  | 'er'
  | 'gantt'
  | 'pie';

export interface DiagramTool {
  label: string;
  snippet: string;
  description?: string;
}

export interface DiagramExample {
  id: DiagramType;
  title: string;
  description: string;
  code: string;
  icon: string;
  tools: DiagramTool[];
}
