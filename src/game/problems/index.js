import React from 'react';
// interface for each should be roughly:
/*
  {
    title: 'string',
    prompt: ReactElement,
    winCondition: computationData => bool
  }
*/
export default [
  {
    title: 'Simple Identifier',
    prompt: (
      <div>
        <p>Let's get acquainted with some basic syntax. First, type 'a₁'. Letters followed optionally by numbers represent variables in the lambda calculus.</p>
      </div>
    ),
    winCondition: ({text}) => {
      return text === 'a₁';
    },
    winCondition: () => true,
  },
  // okay the first problem I actually care about
  {
    title: 'Application',
    prompt: (
      <div>
        <p>You just wrote a lambda expression which containes only the variable 'a₁', which is not currently bound to anything. In the lambda calculus, variables can be bound to functions, and variables can be applied to one another.</p>
        <p>To apply the variable b₁ to the variable a₁, type in 'a₁b₁'. This is akin to saying that we're calling the function a₁ with b₁ as an argument.</p>
      </div>
    ),
    winCondition: ({text}) => {
      return text === 'a₁b₁';
    },
    winCondition: () => true,
  },
  {
    title: 'Identity',
    prompt: (
      <div>
        <p>Nice! Now we'll get into lambda expressions. Lambda expressions represent functions in the lambda calculus. A lambda expression takes the form 'λ [arg] . [body]' where [arg] is the input, and [body] is the output.</p>
        <p>Let's write the identity function; a function which takes its argument, does nothing to it, and spits it back out. In the lambda calculus, that looks something like 'λa.a'</p>
      </div>
    ),
    winCondition: ({ast}) => {
      return (
        // We could put conditions that we might like to use into lib/lambda when we need to.
        ast &&
        ast.type === "function" &&
        ast.body.type === "variable" &&
        ast.argument === ast.body.name
      );
    },
    winCondition: () => true,
  },
  {
    title: "Parentheses",
    prompt: (
      <div>
        <p>Schweet! This takes one argument a and outputs that same argument! Now go ahead and wrap the whole thing in parentheses</p>
      </div>
    ),
    winCondition: ({text, ast}) => {
      return (
        /^\s*\(.*\)\s*$/.test(text) &&
        ast &&
        ast.type === "function" &&
        ast.body.type === "variable" &&
        ast.argument === ast.body.name
      );
    },
    winCondition: () => true,
  },
  {
    title: "Baby's first β-reduction",
    prompt: (
      <div>
        <p>Perfect! In the lambda calculus, you can always wrap expressions in parentheses.</p>
        <p>Now in the same way that we can apply variables to other variables, we can apply variables to functions. Try applying 'b' to your identity function, by writing '(λa.a)b'.</p>
      </div>
    ),
    winCondition: ({ast, text}) => {
      // These win conditions need work
      return text === '(λa.a)b';
      /*return (
        // We could put conditions that we might like to use into lib/lambda when we need to.
        ast &&
        ast.type === "function" &&
        ast.body.type === "token" &&
        ast.argument === ast.body.name &&
        false //because i haven't implemented this yet.
      );*/
    },
    winCondition: () => true,
  },
  {
    title: 'β-reduction function',
    prompt: (
      <div>
        <p>Nice! What happened here is your identity function took 'b' as the input and spit it right back out. The result is in what's called 'normal form', which we'll get into a little later.</p>
        <p>Just like we can evaluate lambda abstractions with variables, we can also do this for functions! Try typing '(λa.a)λb.b'</p>
      </div>
    ),
    winCondition: ({text}) => text === '(λa.a)λb.b',
    winCondition: () => true,
  },
  {
    title: 'Curry',
    prompt: (
      <div>
        <p>Nice! We've probably driven the point home hard enough.</p>
        <p>As you may have noticed before, lambda expressions can only take one argument, which is kind of annoying.</p>
        <p>Let's say we quite reasonably want to write a function which more than one argument. Fortunately, we can sort of get around the single argument restriction by making it so that a function returns another function, which when executed subsequently gives you the result. Make sense?</p>
        <p>In practice, this looks like `La.Lb.([some expression])`.</p>
      </div>
    ),
    winCondition: () => true,// anything works here.
  },
  {
    title: 'And a Dash of Sugar',
    prompt: (
      <div>
        <p>Getting the hang of it!</p>
        <p>Representing functions with multiple arguments like this is so convenient, we're going to introduce a special syntax. We'll write `Lab.([some expression])` as shorthand for `La.Lb.([some expression])`. Try writing a function using that syntax!</p>
      </div>
    ),
    winCondition: () => true,
  },
  {
    title: "Defining variables",
    prompt: (
      <div>
        <p>In the lambda calculus, there's no formal notion of defining variables, but you'll see lots of mathematicians define variables for convenience anyways.</p>
        <p>In this repl, we've added a basic syntax around defining variables.</p>
        <p>Try assigning I to your identity function by typing `I := La.a`</p>
      </div>
    ),
    winCondition: () => false,
  },
  // Computation
  {
    title: 'β-reductions II',
    prompt: (
      <div>
        <p>lol</p>
      </div>
    ),
    winCondition: () => true,
  },
  {
    title: "Leftmost Outermost Redex",
    prompt: (
      <div><p>More lol</p></div>
    ),
    winCondition: () => false,
  },
  {
    title: 'Encoding Booleans',
  },
  {
    title: 'Functions on Numbers',
  },
  {
    title: 'Functions as Numbers',
  },
  {
    title: 'The Y-Combinator'
  },
  {
    title: 'lol these arent finished yet',
  },
  {
    title: "Challenge: Can't stop, won't stop executing."
  },
  /*
    considering following types of problems:
    - illustrating syntactic sugar of multiple arguments, and what that means.
    - illustrating how you can always replace a variable with a function
    - illustrating alpha conversion when a naming collision applies.
    - Challenges...
  */
];
