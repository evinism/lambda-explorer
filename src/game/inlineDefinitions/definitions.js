import React from 'react';

export default {
  // --- Core syntax terms ---
  variable: (
    <div>
      <p>
        A <i>variable</i> is a symbol that can stand for any expression.
      </p>
      <p>
        In this REPL, lowercase letters are single-letter variables (e.g.{" "}
        <code>a</code>, <code>b</code>) and uppercase letters form multi-letter
        variables (e.g. <code>TRUE</code>).
      </p>
    </div>
  ),
  expression: (
    <div>
      <p>
        An <i>expression</i> is any valid combination of lambda abstractions,
        applications, and variables. You're typing expressions into the
        interpreter!
      </p>
    </div>
  ),
  application: (
    <div>
      <p>
        An <i>application</i> is a term in the lambda calculus where two
        expressions are "applied" to each other.
      </p>
      <p>This is akin to calling A with B as an argument.</p>
    </div>
  ),
  lambda_abstraction: (
    <div>
      <p>
        A <i>lambda abstraction</i> is a term of the form λ [head] . [body]
      </p>
      <p>Lambda abstractions represent functions in the lambda calculus.</p>
    </div>
  ),
  parameter: (
    <div>
      <p>
        The <i>parameter</i> is the variable in the head of a lambda
        abstraction.
      </p>
      <p>
        When beta-reducing, all instances of the parameter in the body get
        replaced with the argument.
      </p>
    </div>
  ),
  head: (
    <div>
      <p>
        The <i>head</i> of a lambda abstraction is the part between the λ and
        the dot.
      </p>
      <p>
        It contains the parameter — the variable that will be replaced during
        beta reduction.
      </p>
    </div>
  ),
  body: (
    <div>
      <p>
        The <i>body</i> of a lambda abstraction is the section that follows the
        dot.
      </p>
      <p>This represents what the function returns.</p>
    </div>
  ),
  argument: (
    <div>
      <p>
        When your expression is an application, the <i>argument</i> is the right
        side of the application.
      </p>
      <p>
        For example, in the expression <code>ab</code>, the argument is{" "}
        <code>b</code>.
      </p>
    </div>
  ),
  left_associative: (
    <div>
      <p>
        <i>Left-associative</i> means that repeated applications group from the
        left.
      </p>
      <p>
        So <code>abcd</code> is parsed as <code>((ab)c)d</code> — <code>a</code>{" "}
        is applied to <code>b</code> first, then the result is applied to{" "}
        <code>c</code>, and so on.
      </p>
    </div>
  ),
  currying: (
    <div>
      <p>
        <i>Currying</i> is the technique of representing a multi-argument
        function as a chain of single-argument functions.
      </p>
      <p>
        For example, <code>λa.λb.expr</code> takes one argument and returns a
        function that takes the next. The shorthand <code>λab.expr</code> means
        the same thing.
      </p>
    </div>
  ),

  // --- Core operations ---
  beta_reduction: (
    <div>
      <p>
        <i>Beta reduction</i> is the process of applying a function to its
        argument.
      </p>
      <p>
        Take the body of the lambda abstraction, replace every occurrence of the
        parameter with the argument, then discard the head and argument.
      </p>
    </div>
  ),
  beta_reducible: (
    <div>
      <p>
        An expression is <i>beta reducible</i> if it is an application where the
        left side is a lambda abstraction.
      </p>
      <p>
        For example, <code>(λx.x)y</code> is beta reducible, but{" "}
        <code>x(λy.y)</code> is not.
      </p>
    </div>
  ),
  redex: (
    <div>
      <p>
        A <i>redex</i> (short for "reducible expression") is a beta-reducible
        subexpression — an application where the left side is a lambda
        abstraction.
      </p>
      <p>An expression can contain multiple redexes nested within it.</p>
    </div>
  ),
  alpha_conversion: (
    <div>
      <p>
        An <i>alpha conversion</i> is the process of renaming a parameter (and
        all its bound occurrences) in a lambda abstraction.
      </p>
      <p>
        For example, <code>λx.x</code> can be alpha-converted to{" "}
        <code>λy.y</code>. The two expressions are equivalent.
      </p>
    </div>
  ),
  normal_form: (
    <div>
      <p>
        The <i>normal form</i> of an expression is what you get after performing
        all possible beta reductions.
      </p>
      <p>
        It's analogous to fully executing a program. Some expressions have no
        normal form — they reduce forever!
      </p>
    </div>
  ),
  normal_order: (
    <div>
      <p>
        <i>Normal order</i> is an evaluation strategy where you always reduce
        the leftmost outermost redex first.
      </p>
      <p>This is the strategy used by this REPL.</p>
    </div>
  ),

  // --- Variable scoping ---
  bound_variable: (
    <div>
      <p>
        A <i>bound variable</i> is a variable that appears in the body of a
        lambda abstraction and matches that abstraction's parameter.
      </p>
      <p>
        For example, in <code>λx.xy</code>, the variable <code>x</code> is
        bound.
      </p>
    </div>
  ),
  free_variable: (
    <div>
      <p>
        A <i>free variable</i> is a variable that is not bound by any enclosing
        lambda abstraction.
      </p>
      <p>
        For example, in <code>λx.xy</code>, the variable <code>y</code> is free.
      </p>
    </div>
  ),
  lexical_environment: (
    <div>
      <p>
        The <i>lexical environment</i> is a set of named definitions that you
        can reference by name in expressions.
      </p>
      <p>
        You add to it using the <code>:=</code> syntax, e.g.{" "}
        <code>ID := λa.a</code>.
      </p>
    </div>
  ),

  // --- Encoding concepts ---
  church_boolean: (
    <div>
      <p>
        A <i>Church boolean</i> encodes true/false as a two-argument function.
      </p>
      <p>
        TRUE (<code>λab.a</code>) selects its first argument; FALSE (
        <code>λab.b</code>) selects its second. You can use this structure to
        branch by applying a boolean to two choices.
      </p>
    </div>
  ),
  church_numeral: (
    <div>
      <p>
        A <i>Church numeral</i> encodes a number <i>n</i> as a function that
        applies <code>f</code> to <code>x</code> <i>n</i> times.
      </p>
      <p>
        For example, 0 is <code>λfn.n</code>, 1 is <code>λfn.fn</code>, 2 is{" "}
        <code>λfn.f(fn)</code>, and so on.
      </p>
    </div>
  ),
  successor_function: (
    <div>
      <p>
        The <i>successor function</i> takes a Church numeral and returns the
        next one (i.e. adds 1).
      </p>
      <p>
        It works by wrapping one additional application of <code>f</code> around
        the original numeral: <code>λn.λf.λx.f(nfx)</code>.
      </p>
    </div>
  ),

  // --- Problem-specific definitions ---
  beta_reducible_intro: (
    <div>
      <p>
        An expression is <i>beta reducible</i> if the expression is an
        application where the left side is a lambda abstraction.
      </p>
      <p>
        In this case, the left side of the application is λa.aba and the right
        side is c
      </p>
    </div>
  ),
};
