import { parseTerm, toNormalForm, purgeAstCache } from "../lib/lambda/index.ts";

export default function generateGoldens(text) {
  return {
    text,
    normalForm: purgeAstCache(toNormalForm(parseTerm(text), 1000)),
  };
}
