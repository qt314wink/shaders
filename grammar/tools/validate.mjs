#!/usr/bin/env node
/**
 * Shader Grammar v0.1 validator.
 *
 * Passing JSON Schema is necessary and not sufficient. This gate also
 * proves the ontology generalizes: every specimen is a composition of
 * catalog operators, no material-named flags exist, and every operator
 * is reused by at least two specimens.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { parse as parseYaml } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WORKSPACE = path.resolve(ROOT, "..");
const SPECIMEN_IDS = [
  "oil-slick",
  "soap-film",
  "nacre",
  "labradorite",
  "butterfly-structural-color",
  "holographic-foil",
  "bismuth-oxide",
  "molten-chrome",
  "caustic-water",
  "cloud",
  "nebula",
  "opalescent-glass",
];

const FORBIDDEN_KEY =
  /^(is|has|use|enable|flag)?[-_]?((oil[-_]?slick)|(soap[-_]?film)|nacre|labradorite|(butterfly)|(holographic[-_]?foil)|(bismuth[-_]?oxide)|(molten[-_]?chrome)|(caustic[-_]?water)|cloud|nebula|(opalescent[-_]?glass)|(pearlescent)|(iridescent)|(holographic))$/i;

const findings = [];
let failed = false;

function fail(code, message, extra = {}) {
  failed = true;
  findings.push({ level: "error", code, message, ...extra });
}
function warn(code, message, extra = {}) {
  findings.push({ level: "warning", code, message, ...extra });
}
function note(code, message, extra = {}) {
  findings.push({ level: "info", code, message, ...extra });
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}
function readYaml(rel) {
  return parseYaml(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function collectKeys(value, acc = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, acc);
    return acc;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      acc.push(k);
      collectKeys(v, acc);
    }
  }
  return acc;
}

function loadAjv(schemas) {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    validateSchema: true,
  });
  for (const schema of schemas) ajv.addSchema(schema);
  return ajv;
}

const parameterSchema = readJson("schemas/parameter.schema.json");
const fieldSchema = readJson("schemas/field.schema.json");
const operatorSchema = readJson("schemas/operator.schema.json");
const recipeSchema = readJson("schemas/recipe.schema.json");
const operators = readJson("catalog/operators.json");
const taxonomy = readYaml("taxonomy/material-taxonomy.yaml");

const recipeFiles = fs
  .readdirSync(path.join(ROOT, "recipes"))
  .filter((f) => f.endsWith(".json"))
  .sort();
const recipes = recipeFiles.map((f) => ({
  file: `recipes/${f}`,
  data: readJson(`recipes/${f}`),
}));

const validExample = readJson("examples/valid/minimal-thin-film.json");
const invalidExample = readJson("examples/invalid/named-effect.json");

const ajv = loadAjv([parameterSchema, fieldSchema, operatorSchema, recipeSchema]);
const validateOperator = ajv.getSchema(operatorSchema.$id);
const validateRecipe = ajv.getSchema(recipeSchema.$id);
const validateField = ajv.getSchema(fieldSchema.$id);
const validateParameter = ajv.getSchema(parameterSchema.$id);

if (!validateOperator || !validateRecipe || !validateField || !validateParameter) {
  fail("schema-compile", "Failed to compile one or more schemas.", {
    errors: ajv.errors,
  });
}

const operatorById = new Map();
for (const op of operators) {
  if (operatorById.has(op.id)) fail("dup-operator", `Duplicate operator id ${op.id}`);
  operatorById.set(op.id, op);
  if (validateOperator && !validateOperator(op)) {
    fail("operator-schema", `Operator ${op.id} failed schema.`, {
      errors: validateOperator.errors,
    });
  }
  if (op.reusable !== true) {
    fail("operator-not-reusable", `Operator ${op.id} must declare reusable: true.`);
  }
  if (SPECIMEN_IDS.includes(op.id)) {
    fail("operator-named-material", `Operator id ${op.id} collides with a specimen.`);
  }
}

const taxonomyIds = new Set();
for (const family of taxonomy.families ?? []) {
  for (const member of family.members ?? []) taxonomyIds.add(member.id);
}

for (const specimenId of SPECIMEN_IDS) {
  if (!taxonomy.specimens?.[specimenId]) {
    fail("taxonomy-missing-specimen", `Taxonomy has no entry for ${specimenId}.`);
  }
}

const coverage = {};
for (const op of operators) coverage[op.id] = [];

const recipeById = new Map();

function checkRecipe(rec, file, { allowInvalid = false } = {}) {
  const localFails = [];
  const push = (code, message, extra) => {
    localFails.push({ code, message, ...extra });
    if (!allowInvalid) fail(code, message, { file, ...extra });
  };

  if (validateRecipe && !validateRecipe(rec)) {
    push("recipe-schema", `${file} failed recipe.schema.`, {
      errors: validateRecipe.errors,
    });
  }

  const keys = collectKeys(rec);
  for (const key of keys) {
    if (FORBIDDEN_KEY.test(key) && key !== "id") {
      push("named-effect-key", `Forbidden material/effect key "${key}" in ${file}.`);
    }
  }
  if (typeof rec.oilSlick === "boolean" || typeof rec.effect === "string") {
    push("named-effect-flag", `${file} encodes a named effect flag.`);
  }

  const fieldIds = new Set((rec.fields ?? []).map((f) => f.id));
  const paramIds = new Set((rec.parameters ?? []).map((p) => p.id));

  for (const field of rec.fields ?? []) {
    if (validateField && !validateField(field)) {
      push("field-schema", `Field ${field.id} in ${file} failed field.schema.`, {
        errors: validateField.errors,
      });
    }
  }
  for (const param of rec.parameters ?? []) {
    if (validateParameter && !validateParameter(param)) {
      push("parameter-schema", `Parameter ${param.id} in ${file} failed parameter.schema.`, {
        errors: validateParameter.errors,
      });
    }
  }

  for (const taxId of rec.taxonomyIds ?? []) {
    if (!taxonomyIds.has(taxId)) {
      push("unknown-taxonomy", `${file} references unknown taxonomy id "${taxId}".`);
    }
  }

  const usedOps = [];
  for (const node of rec.nodes ?? []) {
    const op = operatorById.get(node.operator);
    if (!op) {
      push("unknown-operator", `${file} node ${node.id} uses unknown operator "${node.operator}".`);
      continue;
    }
    usedOps.push(op.id);
    const slots = op.slots ?? {};
    for (const slotName of Object.keys(node.bind ?? {})) {
      if (!slots[slotName]) {
        push("unknown-slot", `${file} node ${node.id} binds unknown slot "${slotName}" on ${op.id}.`);
      }
    }
    for (const [slotName, slot] of Object.entries(slots)) {
      const binding = node.bind?.[slotName];
      if (slot.required && !binding) {
        push("missing-slot", `${file} node ${node.id} missing required slot "${slotName}".`);
        continue;
      }
      if (!binding) continue;
      if (binding.field) {
        if (!fieldIds.has(binding.field)) {
          push("unknown-field", `${file} binds missing field "${binding.field}".`);
        }
        if (slot.field === "forbidden") {
          push("field-forbidden", `${file} drives ${op.id}.${slotName} with a field; catalog forbids it.`);
        }
      }
      if (binding.param && !paramIds.has(binding.param)) {
        push("unknown-param", `${file} binds missing parameter "${binding.param}".`);
      }
    }
  }

  const nodeIds = new Set((rec.nodes ?? []).map((n) => n.id));
  if (rec.graph?.output && !nodeIds.has(rec.graph.output)) {
    push("bad-output", `${file} graph.output "${rec.graph.output}" is not a node.`);
  }
  for (const edge of rec.graph?.edges ?? []) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      push("bad-edge", `${file} edge ${edge.from}→${edge.to} references a missing node.`);
    }
  }

  return { localFails, usedOps };
}

for (const { file, data } of recipes) {
  if (recipeById.has(data.id)) fail("dup-recipe", `Duplicate recipe id ${data.id}`);
  recipeById.set(data.id, data);
  const { usedOps } = checkRecipe(data, file);
  for (const opId of new Set(usedOps)) {
    coverage[opId] ??= [];
    coverage[opId].push(data.id);
  }
}

for (const id of SPECIMEN_IDS) {
  if (!recipeById.has(id)) fail("missing-specimen", `No recipe file for required specimen ${id}.`);
}

const extra = [...recipeById.keys()].filter((id) => !SPECIMEN_IDS.includes(id));
if (extra.length) warn("extra-recipe", `Non-specimen recipes in recipes/: ${extra.join(", ")}`);

const { localFails: validFails } = checkRecipe(validExample, "examples/valid/minimal-thin-film.json");
if (validFails.length) {
  fail("positive-control", "Valid example failed validation.", { errors: validFails });
} else {
  note("positive-control", "examples/valid/minimal-thin-film.json passed.");
}

const { localFails: invalidFails } = checkRecipe(
  invalidExample,
  "examples/invalid/named-effect.json",
  { allowInvalid: true },
);
if (invalidFails.length === 0) {
  fail("negative-control", "Named-effect anti-example was accepted. The ontology is not protecting against oilSlick: true.");
} else {
  note("negative-control", "examples/invalid/named-effect.json was rejected as required.", {
    codes: [...new Set(invalidFails.map((f) => f.code))],
  });
}

const singletons = [];
const unused = [];
for (const [opId, users] of Object.entries(coverage)) {
  if (users.length === 0) unused.push(opId);
  else if (users.length === 1) singletons.push({ operator: opId, specimen: users[0] });
}
if (unused.length) fail("unused-operator", `Catalog operators never used: ${unused.join(", ")}.`);
if (singletons.length) {
  fail(
    "singleton-operator",
    "Operator used by only one specimen — ontology did not generalize.",
    { singletons },
  );
} else {
  note("reuse", "Every catalog operator is used by at least two specimens.");
}

const sharedPairs = {
  "oil-slick|soap-film": "thin-film-interference",
  "nacre|labradorite": "multilayer-interference",
  "butterfly-structural-color|holographic-foil": "diffraction-grating",
  "cloud|nebula": "volume-scattering",
  "molten-chrome|nebula": "volume-emission",
  "caustic-water|oil-slick": "caustic-transport",
  "caustic-water|opalescent-glass": "refraction-snell",
  "holographic-foil|bismuth-oxide": "fresnel-conductor",
};
for (const [pair, op] of Object.entries(sharedPairs)) {
  const [a, b] = pair.split("|");
  const users = coverage[op] ?? [];
  if (!users.includes(a) || !users.includes(b)) {
    fail("expected-share", `Expected ${a} and ${b} to share ${op}.`, { users });
  }
}

const report = {
  version: "0.1.0",
  generatedAt: new Date().toISOString(),
  passed: !failed,
  specimenCount: SPECIMEN_IDS.length,
  operatorCount: operators.length,
  recipeCount: recipes.length,
  findings,
  coverage,
  reuse: Object.fromEntries(
    Object.entries(coverage).map(([op, users]) => [op, users.length]),
  ),
  criteria: {
    schemaValid: !findings.some((f) => f.level === "error" && f.code.endsWith("-schema")),
    noNamedEffectFlags: !findings.some((f) => f.code.startsWith("named-effect")),
    allSpecimensPresent: SPECIMEN_IDS.every((id) => recipeById.has(id)),
    everyOperatorReused: singletons.length === 0 && unused.length === 0,
    negativeControlRejected: invalidFails.length > 0,
    positiveControlAccepted: validFails.length === 0,
  },
};

fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "reports/validation-report.json"), JSON.stringify(report, null, 2));

const matrixHeader = ["specimen", ...operators.map((o) => o.id)];
const matrixLines = [
  `| ${["specimen", ...operators.map((o) => o.id.replace(/-/g, "\u2011"))].join(" | ")} |`,
  `| ${matrixHeader.map(() => "---").join(" | ")} |`,
];
for (const id of SPECIMEN_IDS) {
  const cells = operators.map((o) => ((coverage[o.id] ?? []).includes(id) ? "●" : ""));
  matrixLines.push(`| ${[id, ...cells].join(" | ")} |`);
}

const md = `# Shader Grammar v0.1 — validation report

Generated ${report.generatedAt}

**Result: ${report.passed ? "PASS" : "FAIL"}**

## Criteria

| Gate | Status |
| --- | --- |
| Recipe / operator / field / parameter schemas | ${report.criteria.schemaValid ? "pass" : "fail"} |
| No named-effect flags | ${report.criteria.noNamedEffectFlags ? "pass" : "fail"} |
| All 12 specimens present | ${report.criteria.allSpecimensPresent ? "pass" : "fail"} |
| Every operator reused (≥2 specimens) | ${report.criteria.everyOperatorReused ? "pass" : "fail"} |
| Negative control rejected | ${report.criteria.negativeControlRejected ? "pass" : "fail"} |
| Positive control accepted | ${report.criteria.positiveControlAccepted ? "pass" : "fail"} |

## Coverage matrix

Rows are specimens. Columns are catalog operators. A mark means the recipe binds that operator. Shared primitives, not unique flags.

${matrixLines.join("\n")}

## Reuse counts

${Object.entries(report.reuse)
  .map(([op, n]) => `- \`${op}\`: ${n} specimens`)
  .join("\n")}

## Findings

${
  findings.length === 0
    ? "_None._"
    : findings
        .map((f) => `- **${f.level}** \`${f.code}\`: ${f.message}`)
        .join("\n")
}

## What this does *not* prove

Schema + reuse proves the *description* generalizes. It does not prove a renderer implements Airy sums, Mie kernels, or a spectral observer correctly. v0.1 is an ontology with an evaluative sketch, not a path tracer.
`;

fs.writeFileSync(path.join(ROOT, "reports/validation-report.md"), md);

const bundle = {
  version: "0.1.0",
  operators,
  recipes: recipes.map((r) => r.data),
  taxonomy,
  coverage,
  report: {
    passed: report.passed,
    generatedAt: report.generatedAt,
    reuse: report.reuse,
    criteria: report.criteria,
    findings: findings.map(({ level, code, message }) => ({ level, code, message })),
  },
};

const bundleDir = path.join(WORKSPACE, "src/lib/grammar");
fs.mkdirSync(bundleDir, { recursive: true });
fs.writeFileSync(path.join(bundleDir, "bundle.json"), JSON.stringify(bundle));

const publicDir = path.join(WORKSPACE, "public/grammar");
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "validation-report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(publicDir, "validation-report.md"), md);

if (failed) {
  console.error("Shader Grammar v0.1 validation FAILED");
  for (const f of findings.filter((x) => x.level === "error")) {
    console.error(`  [${f.code}] ${f.message}`);
  }
  process.exit(1);
}

console.log("Shader Grammar v0.1 validation PASS");
console.log(`  ${SPECIMEN_IDS.length} specimens, ${operators.length} operators, all reused.`);
console.log(`  negative control rejected (${invalidFails.length} findings).`);
