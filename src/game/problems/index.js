
// interface for each should be roughly:
/*
  {
    title: 'string',
    prompt: 'string',
    winCondition: computationData => bool
  }
*/
export default [
  {
    title: 'Simple Identifier',
    prompt: "Let's get acquainted with some basic syntax. First, type 'a₁'. Letters followed optionally by numbers represent variables in the lambda calculus.",
    winCondition: ({text}) => {
      return text === 'a₁';
    }
  },
  // okay the first problem I actually care about
  {
    title: 'Application',
    prompt: "You just wrote a lambda expression which containes only the variable 'a₁', which is not currently bound to anything. In the lambda calculus, variables can be bound to functions, and variables can be applied to one another. \n\n To apply the variable b₁ to the variable a₁, type in 'a₁b₁'. This is akin to saying that we're calling the function a₁ with b₁ as an argument.",
    winCondition: ({text}) => {
      return text === 'a₁b₁';
    }
  },
  {
    title: 'Identity',
    prompt: "Nice! Now we'll get into lambda expressions. Lambda expressions represent functions in the lambda calculus. A lambda expression takes the form 'λ [arg] . [body]' where [arg] is the input, and [body] is the output. \n\n Let's write the identity function; a function which takes its argument, does nothing to it, and spits it back out. In the lambda calculus, that looks something like 'λa.a'",
    winCondition: ({ast}) => {
      return (
        // We could put conditions that we might like to use into lib/lambda when we need to.
        ast &&
        ast.type === "function" &&
        ast.body.type === "token" &&
        ast.argument === ast.body.name
      );
    }
  },
  {
    title: "Parentheses",
    prompt: "Schweet! This takes one argument a and outputs that same argument! Now go ahead and wrap the whole thing in parentheses",
    winCondition: ({text, ast}) => {
      return (
        // We could put conditions that we might like to use into lib/lambda when we need to.
        /^\s*\(.*\)\s*$/.test(text) &&
        ast &&
        ast.type === "function" &&
        ast.body.type === "token" &&
        ast.argument === ast.body.name
      );
    }
  },
  {
    title: "Baby's first β-reduction",
    prompt: "Now in the same way that we can apply variables to other variables, we can apply variables to functions. Try applying 'b' to your identity function, by writing '(λa.a)b'.",
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
    }
  },
  {
    title: 'β-reduction function',
    prompt: "Nice! What happened here is your identity function took 'b' as the input and spit it right back out. The result is in what's called 'normal form', which we'll get into a little later. \n\n Just like we can do this for variables, we can also do this for functions! Try typing '(λa.a)λb.b'",
    winCondition: ({text}) => text === '(λa.a)λb.b',
  },
  {
    title: 'Curry',
    prompt: 'As you may have noticed before, lambda expressions can only take one argument.'
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
