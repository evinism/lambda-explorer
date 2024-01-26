import { assert } from "chai";
import { bReduce } from "../operations";
import { purgeAstCache } from "../util";

describe("Beta Reductions", function () {
  it("Beta reduces a redex", function () {
    const ast = {
      type: "application",
      left: {
        type: "function",
        argument: "a",
        body: { type: "variable", name: "a" },
      },
      right: { type: "variable", name: "b" },
    };
    const expected = { type: "variable", name: "b" };
    assert.deepEqual(purgeAstCache(bReduce(ast)), expected);
  });

  it("Avoids name conflicts when executing beta reductions", function () {
    // TODO: make this more robust with canonization, so it's not tied to specific implementation.
    const ast = {
      type: "application",
      left: {
        type: "function",
        argument: "a",
        body: {
          type: "function",
          argument: "b",
          body: {
            type: "application",
            left: { type: "variable", name: "a" },
            right: { type: "variable", name: "b" },
          },
        },
      },
      right: { type: "variable", name: "b" },
    };
    const expected = {
      type: "function",
      argument: "ε₁",
      body: {
        type: "application",
        left: { type: "variable", name: "b" },
        right: { type: "variable", name: "ε₁" },
      },
    };
    assert.deepEqual(purgeAstCache(bReduce(ast)), expected);
  });

  it("Avoids name conflicts when first chosen name is shadowed in an inner scope", () => {
    const ast = {
      type: "application",
      left: {
        type: "function",
        argument: "a",
        body: {
          type: "function",
          argument: "ε₁",
          body: {
            type: "application",
            left: {
              type: "variable",
              name: "a",
            },
            right: {
              type: "variable",
              name: "ε₁",
            },
          },
        },
      },
      right: {
        type: "variable",
        name: "ε₁",
      },
    };
    const expected = {
      type: "function",
      argument: "ε₂",
      body: {
        type: "application",
        left: {
          type: "variable",
          name: "ε₁",
        },
        right: {
          type: "variable",
          name: "ε₂",
        },
      },
    };
    assert.deepEqual(purgeAstCache(bReduce(ast)), expected);
  });

  it("Avoids name conflicts when first chosen name conflicts with free var in replacer", () => {
    const ast = {
      type: "application",
      left: {
        type: "function",
        argument: "a",
        body: {
          type: "function",
          argument: "b",
          body: {
            type: "application",
            left: {
              type: "variable",
              name: "a",
            },
            right: {
              type: "variable",
              name: "b",
            },
          },
        },
      },
      right: {
        type: "application",
        left: {
          type: "variable",
          name: "b",
        },
        right: {
          type: "variable",
          name: "ε₁",
        },
      },
    };
    const expected = {
      type: "function",
      argument: "ε₂",
      body: {
        type: "application",
        left: {
          type: "application",
          left: {
            type: "variable",
            name: "b",
          },
          right: {
            type: "variable",
            name: "ε₁",
          },
        },
        right: {
          type: "variable",
          name: "ε₂",
        },
      },
    };
    assert.deepEqual(purgeAstCache(bReduce(ast)), expected);
  });

  it("Avoids name conflicts when there are conflicting free vars in both", () => {
    const ast = {
      type: "application",
      left: {
        type: "function",
        argument: "a",
        body: {
          type: "function",
          argument: "ε₁",
          body: {
            type: "application",
            left: {
              type: "application",
              left: {
                type: "variable",
                name: "a",
              },
              right: {
                type: "variable",
                name: "ε₁",
              },
            },
            right: {
              type: "variable",
              name: "ε₂",
            },
          },
        },
      },
      right: {
        type: "variable",
        name: "ε₁",
      },
    };
    const expected = {
      type: "function",
      argument: "ε₃",
      body: {
        type: "application",
        left: {
          type: "application",
          left: {
            type: "variable",
            name: "ε₁",
          },
          right: {
            type: "variable",
            name: "ε₃",
          },
        },
        right: {
          type: "variable",
          name: "ε₂",
        },
      },
    };
    assert.deepEqual(purgeAstCache(bReduce(ast)), expected);
  });

  it("avoids name conflict in this odd specific case", () => {
    const ast = {
      type: "application",
      left: {
        type: "function",
        argument: "ε₁",
        body: {
          type: "function",
          argument: "a",
          body: {
            type: "function",
            argument: "ε₁",
            body: { type: "variable", name: "a" },
          },
        },
      },
      right: { type: "variable", name: "a" },
    };
    const expected = {
      type: "function",
      argument: "ε₂",
      body: {
        type: "function",
        argument: "ε₁",
        body: { type: "variable", name: "ε₂" },
      },
    };
    assert.deepEqual(purgeAstCache(bReduce(ast)), expected);
  });

  it("can't replace a variable with itself.", () => {
    const ast = {
      type: "application",
      left: {
        type: "function",
        argument: "ε₁",
        body: {
          type: "application",
          left: {
            type: "function",
            argument: "a",
            body: {
              type: "function",
              argument: "b",
              body: { type: "variable", name: "b" },
            },
          },
          right: { type: "variable", name: "ε₁" },
        },
      },
      right: { type: "variable", name: "b" },
    };
    const expected = {
      type: "application",
      left: {
        type: "function",
        argument: "a",
        body: {
          type: "function",
          argument: "b",
          body: { type: "variable", name: "b" },
        },
      },
      right: { type: "variable", name: "b" },
    };
    assert.deepEqual(purgeAstCache(bReduce(ast)), expected);
  });
});
