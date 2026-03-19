import React from 'react';

export default {
  // --- Core syntax terms ---
  variable: (
    <div>
      <p>
        A <i>variable</i> is a name — like <code>x</code> or <code>a</code> —
        that represents a value. Variables can be free or bound by a lambda
        abstraction.
      </p>
      <p>
        In this REPL, lowercase letters are single-letter variables and
        uppercase letters form multi-letter variables (e.g. <code>TRUE</code>).
      </p>
    </div>
  ),
  expression: (
    <div>
      <p>
        An <i>expression</i> is anything you can write in the lambda calculus: a
        variable, an application, a lambda abstraction, or any nesting of these.
      </p>
      <p>
        For example, <code>x</code>, <code>xy</code>, <code>λx.x</code>, and{" "}
        <code>(λx.x)λy.y</code> are all expressions.
      </p>
    </div>
  ),
  application: (
    <div>
      <p>
        An <i>application</i> is two expressions written side by side, like{" "}
        <code>ab</code>. It represents calling the left expression as a function
        with the right expression as its argument.
      </p>
    </div>
  ),
  lambda_abstraction: (
    <div>
      <p>
        A <i>lambda abstraction</i> is a function, written as λ [parameter] .
        [body].
      </p>
      <p>
        For example, <code>λx.x</code> is a function that takes <code>x</code>{" "}
        and returns <code>x</code>.
      </p>
    </div>
  ),
  parameter: (
    <div>
      <p>
        The <i>parameter</i> is the variable between the λ and the dot in a
        lambda abstraction.
      </p>
      <p>
        For example, in <code>λx.xy</code>, the parameter is <code>x</code>.
      </p>
      <p>
        During beta reduction, every occurrence of the parameter in the body
        gets replaced with the argument.
      </p>
    </div>
  ),
  head: (
    <div>
      <p>
        The <i>head</i> of a lambda abstraction is the part between the λ and
        the dot — it declares the parameter.
      </p>
      <p>
        For example, in <code>λx.xy</code>, the head is <code>x</code>.
      </p>
    </div>
  ),
  body: (
    <div>
      <p>
        The <i>body</i> of a lambda abstraction is everything after the dot — it
        defines what the function returns.
      </p>
      <p>
        For example, in <code>λx.xy</code>, the body is <code>xy</code>.
      </p>
    </div>
  ),
  argument: (
    <div>
      <p>
        The <i>argument</i> is the right-hand expression in an application — the
        value being passed to the function.
      </p>
      <p>
        For example, in <code>(λx.x)y</code>, the argument is <code>y</code>.
      </p>
    </div>
  ),
  left_associative: (
    <div>
      <p>
        <i>Left-associative</i> means repeated applications group from the left.
      </p>
      <p>
        So <code>abcd</code> is parsed as <code>((ab)c)d</code>: first{" "}
        <code>a</code> is applied to <code>b</code>, then the result to{" "}
        <code>c</code>, then the result to <code>d</code>.
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
        <code>λa.λb.ab</code> takes one argument and returns a function that
        takes the next. The shorthand <code>λab.ab</code> means the same thing.
      </p>
    </div>
  ),

  // --- Core operations ---
  beta_reduction: (
    <div>
      <p>
        <i>Beta reduction</i> is the fundamental operation of the lambda
        calculus: applying a function to an argument.
      </p>
      <p>
        Replace every occurrence of the parameter in the body with the argument,
        then drop the λ-header. For example, <code>(λx.xy)z</code> reduces to{" "}
        <code>zy</code>.
      </p>
    </div>
  ),
  beta_reducible: (
    <div>
      <p>
        An expression is <i>beta reducible</i> if it is an application whose
        left side is a lambda abstraction — meaning a function is being applied
        to something.
      </p>
      <p>
        For example, <code>(λx.x)y</code> is beta reducible, but{" "}
        <code>x(λy.y)</code> is not (the lambda is on the wrong side).
      </p>
    </div>
  ),
  redex: (
    <div>
      <p>
        A <i>redex</i> (reducible expression) is any beta-reducible
        subexpression within a larger expression.
      </p>
      <p>
        For example, <code>(λx.x)y</code> inside the expression{" "}
        <code>a((λx.x)y)</code> is a redex. An expression can contain several
        redexes at once.
      </p>
    </div>
  ),
  alpha_conversion: (
    <div>
      <p>
        An <i>alpha conversion</i> renames a parameter and all of its bound
        occurrences in a lambda abstraction, without changing the meaning.
      </p>
      <p>
        For example, <code>λx.xy</code> can be equivalently alpha-converted to{" "}
        <code>λz.zy</code>. This is needed to avoid name collisions during beta
        reduction.
      </p>
    </div>
  ),
  normal_form: (
    <div>
      <p>
        An expression is in <i>normal form</i> when it contains no more redexes
        — no further beta reductions are possible.
      </p>
      <p>
        Finding the normal form is like fully running a program. Not every
        expression has one: some reduce forever.
      </p>
    </div>
  ),
  normal_order: (
    <div>
      <p>
        <i>Normal order</i> is an evaluation strategy: always reduce the
        leftmost outermost redex first.
      </p>
      <p>If a normal form exists, normal order is guaranteed to find it.</p>
    </div>
  ),

  // --- Variable scoping ---
  bound_variable: (
    <div>
      <p>
        A <i>bound variable</i> is a variable that is captured by an enclosing
        lambda's parameter.
      </p>
      <p>
        In <code>λx.xy</code>, <code>x</code> is bound (it matches the
        parameter), while <code>y</code> is not.
      </p>
    </div>
  ),
  free_variable: (
    <div>
      <p>
        A <i>free variable</i> is a variable that is not bound by any enclosing
        lambda abstraction — it refers to something defined elsewhere.
      </p>
      <p>
        In <code>λx.xy</code>, <code>y</code> is free.
      </p>
    </div>
  ),
  lexical_environment: (
    <div>
      <p>
        The <i>lexical environment</i> is the set of named definitions you've
        built up with <code>:=</code> (e.g. <code>ID := λa.a</code>).
      </p>
      <p>
        When you use a defined name in an expression, it gets replaced with the
        definition before evaluation.
      </p>
    </div>
  ),

  // --- Encoding concepts ---
  church_boolean: (
    <div>
      <p>
        <i>Church booleans</i> encode true and false as two-argument selector
        functions.
      </p>
      <p>
        TRUE is <code>λab.a</code> (picks the first); FALSE is{" "}
        <code>λab.b</code> (picks the second). To branch, apply a boolean to two
        choices: it selects one.
      </p>
    </div>
  ),
  church_numeral: (
    <div>
      <p>
        A <i>Church numeral</i> encodes the number <i>n</i> as a function that
        applies <code>f</code> to <code>x</code> exactly <i>n</i> times.
      </p>
      <p>
        0 = <code>λfx.x</code>, 1 = <code>λfx.fx</code>, 2 ={" "}
        <code>λfx.f(fx)</code>, 3 = <code>λfx.f(f(fx))</code>, and so on.
      </p>
    </div>
  ),
  successor_function: (
    <div>
      <p>
        The <i>successor function</i> takes a Church numeral <i>n</i> and
        returns <i>n + 1</i>.
      </p>
      <p>
        It wraps one extra application of <code>f</code> around the original:{" "}
        <code>SUCC := λn.λf.λx.f(nfx)</code>.
      </p>
    </div>
  ),

  // --- Problem-specific definitions ---
  beta_reducible_intro: (
    <div>
      <p>
        An expression is <i>beta reducible</i> if it is an application whose
        left side is a lambda abstraction.
      </p>
      <p>
        In this case, the left side is <code>λa.aba</code> and the right side
        (the argument) is <code>c</code>.
      </p>
    </div>
  ),
};
