export type ParamKind =
  | "ior-real"
  | "ior-complex"
  | "thickness"
  | "length"
  | "period"
  | "roughness"
  | "anisotropy"
  | "albedo"
  | "density"
  | "extinction"
  | "scattering-coeff"
  | "weight"
  | "count"
  | "angle"
  | "wavelength"
  | "temperature"
  | "spectral-power"
  | "phase-function"
  | "illuminant"
  | "observer"
  | "lobe";

export type Parameter = {
  id: string;
  kind: ParamKind;
  unit: string;
  value?: number;
  vector?: number[];
  complex?: { n: number; k: number };
  spectral?: { wavelengthsNm: number[]; samples: number[] };
  enum?: string;
  range?: [number, number];
  notes?: string;
};

export type Field = {
  id: string;
  kind: ParamKind;
  unit: string;
  domain: "surface" | "volume" | "spectral" | "angular" | "temporal";
  source: {
    type: "constant" | "procedural" | "analytic" | "sampled";
    generator?: string;
    octaves?: number;
    frequency?: number;
    value?: number;
    peaksNm?: number[];
    bandwidthNm?: number;
  };
  range?: [number, number];
  notes?: string;
};

export type Binding = { param?: string; field?: string };

export type RecipeNode = {
  id: string;
  operator: string;
  bind: Record<string, Binding>;
};

export type Recipe = {
  id: string;
  version: string;
  title: string;
  taxonomyIds: string[];
  summary: string;
  phenomena?: string[];
  fields: Field[];
  parameters: Parameter[];
  nodes: RecipeNode[];
  graph: { output: string; edges: { from: string; to: string }[] };
  evaluation?: { illuminant?: string; observer?: string };
  notes?: string;
};

export type OperatorSlot = {
  kind: ParamKind;
  unit?: string;
  required: boolean;
  field?: "forbidden" | "allowed" | "required";
  enumValues?: string[];
  notes?: string;
};

export type Operator = {
  id: string;
  title: string;
  family: string;
  reusable: boolean;
  description: string;
  outputs: string[];
  references?: string[];
  slots: Record<string, OperatorSlot>;
};

export type Taxonomy = {
  version: string;
  id: string;
  principle: string;
  families: {
    id: string;
    title: string;
    description: string;
    members: { id: string; operators: string[] }[];
  }[];
  aliases: Record<string, string[]>;
  specimens: Record<string, { primary: string[]; secondary: string[] }>;
};

export type GrammarBundle = {
  version: string;
  operators: Operator[];
  recipes: Recipe[];
  taxonomy: Taxonomy;
  coverage: Record<string, string[]>;
  report: {
    passed: boolean;
    generatedAt: string;
    reuse: Record<string, number>;
    criteria: Record<string, boolean>;
    findings: { level: string; code: string; message: string }[];
  };
};
