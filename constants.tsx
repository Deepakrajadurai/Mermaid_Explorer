
import { DiagramExample } from './types';

export const DIAGRAM_EXAMPLES: DiagramExample[] = [
  {
    id: 'flowchart',
    title: 'Flowchart',
    icon: 'GitBranch',
    description: 'Perfect for process flows and decision trees. Use nodes and connectors to map out logic.',
    code: `graph TD
    Start[Start Process] --> Check{Is Valid?}
    Check -->|Yes| Success[Complete]
    Check -->|No| Fix[Fix Issues]
    Fix --> Check`,
    tools: [
      { label: 'New Node', snippet: '\n    Node[New Label]', description: 'Add a standard rectangular node' },
      { label: 'Decision', snippet: '\n    ID{Decision?}', description: 'Add a diamond-shaped decision node' },
      { label: 'Link', snippet: '\n    A --> B', description: 'Create a connection between two nodes' },
      { label: 'Labeled Link', snippet: '\n    A -->|Text| B', description: 'Create a link with descriptive text' },
      { label: 'Subgraph', snippet: '\n    subgraph Name\n      S1 --> S2\n    end', description: 'Group nodes inside a box' }
    ]
  },
  {
    id: 'sequence',
    title: 'Sequence Diagram',
    icon: 'MessageSquare',
    description: 'Illustrate how objects or actors interact over time. Great for API calls and workflows.',
    code: `sequenceDiagram
    participant U as User
    participant S as Server
    U->>S: Request Data
    S-->>U: JSON Response`,
    tools: [
      { label: 'Participant', snippet: '\n    participant P as Name', description: 'Define a new actor' },
      { label: 'Message', snippet: '\n    A->>B: Message', description: 'Synchronous call' },
      { label: 'Async Msg', snippet: '\n    A-)B: Message', description: 'Asynchronous call' },
      { label: 'Note', snippet: '\n    Note over A,B: Description', description: 'Add a note spanning actors' },
      { label: 'Activation', snippet: '\n    activate A\n    A->>B: Work\n    deactivate A', description: 'Show processing time' }
    ]
  },
  {
    id: 'class',
    title: 'Class Diagram',
    icon: 'Box',
    description: 'The standard for software structure modeling. Define classes, attributes, and relationships.',
    code: `classDiagram
    class User {
      +String name
      +save()
    }
    class Admin {
      +manage()
    }
    User <|-- Admin`,
    tools: [
      { label: 'New Class', snippet: '\n    class NewClass {\n      +Type attribute\n      +method()\n    }', description: 'Define a class with fields' },
      { label: 'Inheritance', snippet: '\n    Parent <|-- Child', description: 'Show "is-a" relationship' },
      { label: 'Composition', snippet: '\n    Whole *-- Part', description: 'Show "has-a" relationship' },
      { label: 'Interface', snippet: '\n    class IPlugin <<interface>>', description: 'Define an interface' }
    ]
  },
  {
    id: 'state',
    title: 'State Diagram',
    icon: 'RefreshCw',
    description: 'Visualize the lifecycle of an object or system. Define states and the events that trigger transitions.',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : start
    Processing --> Idle : finish
    Processing --> Error : fail`,
    tools: [
      { label: 'Transition', snippet: '\n    State1 --> State2 : event', description: 'Move from one state to another' },
      { label: 'Composite', snippet: '\n    state Parent {\n      [*] --> Child\n    }', description: 'Nested state machine' },
      { label: 'Choice', snippet: '\n    state choice_node <<choice>>\n    [*] --> choice_node', description: 'Conditional branch' },
      { label: 'Fork/Join', snippet: '\n    state fork_state <<fork>>\n    state join_state <<join>>', description: 'Parallel processing' }
    ]
  },
  {
    id: 'er',
    title: 'ER Diagram',
    icon: 'Database',
    description: 'Design your database schema. Show entities, their attributes, and how they link via cardinality.',
    code: `erDiagram
    USER ||--o{ POST : writes
    USER {
      string username
      string email
    }`,
    tools: [
      { label: 'Entity', snippet: '\n    ENTITY {\n      type name\n    }', description: 'Add a new database table' },
      { label: 'Relationship', snippet: '\n    A ||--o{ B : labels', description: 'One-to-many relationship' },
      { label: 'Many-to-Many', snippet: '\n    A }|..|{ B : labels', description: 'Many-to-many link' }
    ]
  },
  {
    id: 'gantt',
    title: 'Gantt Chart',
    icon: 'BarChart',
    description: 'Plan project timelines and task dependencies visually.',
    code: `gantt
    title Project Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1
    Research :a1, 2024-01-01, 7d
    Design   :after a1, 5d`,
    tools: [
      { label: 'Section', snippet: '\n    section New Section', description: 'Group related tasks' },
      { label: 'Task', snippet: '\n    Task Name :2024-01-10, 3d', description: 'Add a basic task' },
      { label: 'Milestone', snippet: '\n    Milestone :milestone, m1, 2024-01-15, 0d', description: 'Key project event' },
      { label: 'Sequential', snippet: '\n    Next Task :after t1, 4d', description: 'Task starting after another' }
    ]
  },
  {
    id: 'pie',
    title: 'Pie Chart',
    icon: 'PieChart',
    description: 'Display simple comparative data. Use the palette designer above to customize slice colors via themeVariables.',
    code: `%%{init: {"theme": "base", "themeVariables": {"pie1": "#61DAFB", "pie2": "#42B883", "pie3": "#FF3E00", "pie4": "#DD0031", "pie5": "#888888"}, "pie": {"palette0": "#61DAFB", "palette1": "#42B883", "palette2": "#FF3E00", "palette3": "#DD0031", "palette4": "#888888"}}}%%
pie title Tech Stack Usage
    "React" : 45
    "Vue" : 25
    "Svelte" : 15
    "Angular" : 5
    "Other" : 10`,
    tools: [
      { label: 'Data Row', snippet: '\n    "Label" : 10', description: 'Add a new data slice' }
    ]
  }
];
