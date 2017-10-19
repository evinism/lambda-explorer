import React from 'react';
import {
  equal,
  parseTerm as parse,
  leftmostOutermostRedex,
  toNormalForm,
  bReduce,
  getFreeVars,
  tokenize,
  renderExpression,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
} from '../../lib/lambda';
// interface for each should be roughly:
/*
  {
    title: 'string',
    prompt: ReactElement,
    winCondition: computationData => bool
  }
*/

const safeEqual = (a, b) => (a && b) ? equal(a, b) : false;

const t = parse('λab.a');
const f = parse('λab.b');

// (ast, [[arg, arg, result]])  => bool
// should be able to handle non-boolean arguments too...
function satisfiesTruthTable(ast, rules){
  return rules.map(
    rule => {
      const mutable = [].concat(rule);
      const target = mutable.pop();
      const ruleArgs = mutable;

      const testAst = ruleArgs.reduce((acc, cur) => ({
        type: 'application',
        left: acc,
        right: cur,
      }), ast);

      try {
        const res = equal(target, toNormalForm(testAst));
        return res;
      } catch (e) {
        console.log("Error in test: " + e);
        return false;
      }
    }
  ).reduce((a, b) => a && b, true);
};

const Code = props => (<span className="code">{props.children}</span>)

export default [
  {
    title: 'Simple Variable',
    prompt: (
      <div>
        <p>Let's get acquainted with some basic syntax. First, type <Code>a₁</Code>. Letters followed optionally by numbers represent variables in this REPL.</p>
        <p>In the actual lambda calculus, it's a bit broader, but we'll keep it simple right now.</p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('a₁')),
  },
  // okay the first problem I actually care about
  {
    title: 'Application',
    prompt: (
      <div>
        <p>You just wrote a lambda expression which contains only the variable <Code>a₁</Code>, which is not currently bound to anything. In the lambda calculus, variables can be bound to functions, and variables can be applied to one another.</p>
        <p>To apply the variable <Code>b₁</Code> to the variable <Code>a₁</Code>, type in <Code>a₁b₁</Code>. This is akin to saying that we're calling the function <Code>a₁</Code> with <Code>b₁</Code> as an argument.</p>
        <p>Try applying one variable to another.</p>
      </div>
    ),
    winCondition: ({ast}) => {
      return safeEqual(ast, parse('a₁b₁'));
    },
  },
  {
    title: 'Upper Case Variables',
    prompt: (
      <div>
        <p>Since lots of variables in the Lambda Calculus are single letters, there's often a semantic ambiguity when written down. For example, if I type in <Code>aa</Code>, do I mean one variable <Code>aa</Code>, or the variable <Code>a</Code> applied to itself?</p>
        <p>For ease of use in this REPL, we've made a small comprimise: upper case letters are interpreted as multi-letter varaibles, and lower case letters are interpreted as single-letter variables.</p>
        <p>Try typing <Code>MULT</Code>, and observe that it's interpreted as one variable.</p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('MULT')),
  },
  {
    title: 'Identity',
    prompt: (
      <div>
        <p>Now we'll get into lambda abstractions. Lambda abstractions represent functions in the lambda calculus. A lambda abstraction takes the form <Code>λ [head] . [body]</Code> where [head] is the input, and [body] is the output.</p>
        <p>Let's write the identity function; a function which takes its argument, does nothing to it, and spits it back out. In the lambda calculus, that looks something like <Code>λa.a</Code></p>
        <p>as a reminder, you can type backslash (<Code>\</Code>) for λ</p>
      </div>
    ),
    winCondition: ({ast}) => {
      return safeEqual(ast, parse('λa.a'));
    },
  },
  {
    title: "Parentheses",
    prompt: (
      <div>
        <p>Schweet! This takes one argument <Code>a</Code> and outputs that same argument! Now go ahead and wrap the whole thing in parentheses</p>
      </div>
    ),
    winCondition: ({text, ast}) => {
      return (
        /^\s*\(.*\)\s*$/.test(text) &&
        safeEqual(ast, parse('λa.a'))
      );
    },
  },
  {
    title: "Baby's first β-reduction",
    prompt: (
      <div>
        <p>Perfect! In the lambda calculus, you can always wrap expressions in parentheses.</p>
        <p>Now in the same way that we can apply variables to other variables, we can apply variables to functions. Try applying <Code>b</Code> to your identity function, by writing <Code>(λa.a)b</Code>.</p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('(λa.a)b')),
  },
  {
    title: 'β-reduction function',
    prompt: (
      <div>
        <p>Nice! What happened here is your identity function took <Code>b</Code> as the input and spit it right back out. The process of evaluating a function like this is called <i>beta reduction</i>.</p>
        <p>The result you're seeing here is in what's called <i>normal form</i>, which we'll get into a little later.</p>
        <p>Just like we can evaluate functions with variables, we can also evaluate them with other functions! Try typing <Code>(λa.a)λb.b</Code></p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('(λa.a)λb.b')),
  },
  {
    title: 'Bound and Free Variables',
    prompt: (
      <div>
        <p>So we can perform beta reductions with other functions as the argument! We've probably driven the point home hard enough.</p>
        <p>It's prudent to make a distinction between bound and free variables. When a function takes an argument, every occurrence of the variable in the body of the function is <i>bound</i> to that argument.</p>
        <p>For quick example, if you've got the expression <Code>λx.(xy)</Code>, the variable <Code>x</Code> is bound in the lambda expression, whereas the variable <Code>y</Code> is currently unbound. We call unbound variables like <Code>y</Code> <i>free variables</i>.</p>
        <p>Write a lambda expression with a free variable <Code>c</Code> (hint: this can be extremely simple).</p>
      </div>
    ),
    winCondition: ({ast}) => ast && getFreeVars(ast).map(item => item.name).includes('c'),
  },
  {
    title: 'Curry',
    prompt: (
      <div>
        <p>Easy enough. In this REPL you can see what free variables are in an expression (as well as a lot of other information) by clicking the (+) that appears next to results.</p>
        <p>As you may have noticed before, functions can only take one argument, which is kind of annoying.</p>
        <p>Let's say we quite reasonably want to write a function which takes more than one argument. Fortunately, we can sort of get around the single argument restriction by making it so that a function returns another function, which when executed subsequently gives you the result. Make sense?</p>
        <p>In practice, this looks like <Code>λa.λb. [some expression]</Code>. Go ahead and write a 'multi-argument' function!</p>
      </div>
    ),
    winCondition: ({ast}) => (
      ast &&
      ast.type === 'function' &&
      ast.body.type === 'function'
    ),
  },
  {
    title: 'And a Dash of Sugar',
    prompt: (
      <div>
        <p>Getting the hang of it!</p>
        <p>Representing functions with multiple arguments like this is so convenient, we're going to introduce a special syntax. We'll write <Code>λab. [some expression]</Code> as shorthand for <Code>λa.λb. [some expression]</Code>. Try writing a function using that syntax!</p>
      </div>
    ),
    winCondition: ({text, ast}) => {
      // wow this is a garbage win condition
      const isMultiargumentFn = ast &&
        ast.type === 'function' &&
        ast.body.type === 'function';
      if (!isMultiargumentFn) {
        return false;
      }
      // has special syntax.. better way than pulling the lexer??
      // this shouldn't throw because by here we're guaranteed ast exists.
      const tokenStream = tokenize(text).filter(
        // only try to match '(((Lab' and don't care about the rest of the string.
        token => token.type !== 'openParen'
      );
      return tokenStream.length >= 3 &&
        tokenStream[0].type === 'lambda' &&
        tokenStream[1].type === 'identifier' &&
        tokenStream[2].type === 'identifier';
    },
  },
  {
    title: "Assigning variables",
    prompt: (
      <div>
        <p>In the lambda calculus, there's no formal notion of assigning variables, but many texts assign variables.</p>
        <p>In this repl, we've added a basic syntax around assign variables. (Note: You can't assign an expression with free variables.)</p>
        <p>This kind of environment around the lambda calculus comes very close to the original sense of a <a href="https://en.wikipedia.org/wiki/Closure_(computer_programming)" target="blank">closure</a>, as presented in <a href="https://www.cs.cmu.edu/~crary/819-f09/Landin64.pdf" target="blank">The mechanical evaluation of expressions</a>.</p>
        <p>Try assigning I to your identity function by typing <Code>ID := λa.a</Code></p>
      </div>
    ),
    winCondition: ({ast, lhs}) => {
      return (
        // could probably be simplified by including execution context in winCondition.
        ast &&
        lhs === 'ID' &&
        safeEqual(ast, parse('λa.a'))
      );
    }
  },
  // --- Computation ---
  {
    title: 'β reductions + α conversions',
    prompt: (
      <div>
        <p>Occasionally, we'll get into a situation where a variable that previously was unbound is suddenly bound to a variable that it shouldn't be. For example, if we tried beta-reducing <Code>(λab.ab)b</Code> without renaming, we'd get <Code>λb.bb</Code>, which is  not quite what we intended. We likely wanted <Code>b</Code> to remain a free variable.</p>
        <p>Instead, we have to do an alpha-conversion (fancy name for renaming variables) of the lambda expression prior to doing the beta reduction, so we can eliminate the conflict.</p>
        <p>Try inputting an expression (like <Code>(λab.ab)b</Code>) that requires an alpha conversion.</p>
      </div>
    ),
    // lol this win condition.
    winCondition: ({normalForm}) => (
      normalForm && renderExpression(normalForm).includes('ε')
    ),
  },
  {
    title: "Nested Redexes",
    prompt: (
      <div>
        <p>Notice that epsilon that pops up? That's this REPL's placeholder variable for when it needs to rename a variable due to a conflict.</p>
        <p>Often, an expression is not beta reducible itself, but contains one or more beta reducible expressions (redexes) nested within. We can still evaluate the expression!</p>
        <p>Try writing a function with a nested redex!</p>
        <p>Possible solution: <span className='secret'>λa.(λb.b)c</span></p>
      </div>
    ),
    winCondition: ({ast}) => (
      ast && !bReduce(ast) && leftmostOutermostRedex(ast)
    ),
  },
  {
    title: "Leftmost Outermost Redex",
    prompt: (
      <div>
        <p>That probably makes sense.</p>
        <p>"But wait," I hear you shout. "What if I have more than one reducible subexpression in my expression? Which do I evaluate first?"</p>
        <p>Let's traverse the expression, left to right, outer scope to inner scope, find the <i>leftmost outermost redex</i>, and evaluate that one. This is called the <i>normal order</i>.</p>
        <p>Try typing and expanding <Code>((λb.b)c)((λd.d)e)</Code> to see what I mean.</p>
      </div>
    ),
    // no need to be super restrictive in what they paste in here
    winCondition: ({ast}) => ast && equal(ast, parse('((λb.b)c)((λd.d)e)')),
  },
  {
    title: 'Normal Form',
    prompt: (
      <div>
        <p>If we do this repeatedly until there's nothing more to reduce, we get to what's called the "normal form". Finding the normal form is analogous to executing the lambda expression, and is in fact exactly what this REPL does when you enter an expression.</p>
        <p>In this REPL you can see the steps it took to get to normal form by pressing the (+) button beside the evaluated expression.</p>
        <p>Otherwise, I can't think of a win condition for this, so just type in anything to continue.</p>
      </div>
    ),
    winCondition: () => true,
  },
  {
    title: 'Or Not',
    prompt: (
      <div>
        <p>It's possible that this process never halts, meaning that a normal form for that expression doesn't exist.</p>
        <p>See if you can find an expression whose normal form doesn't exist!</p>
        <p>Possible answer: <span className="secret">(λa.aa)λa.aa</span></p>
      </div>
    ),
    winCondition: ({error}) => (
      // TODO: make it so errors aren't compared by user string, that's dumb
      error && error.message === 'Runtime error: normal form execution exceeded'
    )
  },
  {
    title: 'The Y-Combinator',
    prompt: (
      <div>
        <p>You can expand that runtime error to see the first few iterations. If you went with <Code>(λa.aa)λa.aa</Code>, you can see that performing a beta reduction gives you the exact same expression back!</p>
        <p>The famed Y-Combinator is one of these expressions without a normal form. Try inputting the Y-Combinator, and see what happens:</p>
        <p>Y: <Code>λg.(λx.g(xx))(λx.g(xx))</Code></p>
      </div>
    ),
    winCondition: ({ast}) => equal(ast, parse('λg.(λx.g(xx))(λx.g(xx))')),
  },
  {
    title: "Church Booleans",
    prompt: (
      <div>
        <p>Now we're well equipped enough to start working with actual, meaningful values.</p>
        <p>Let's start off by introducing the booleans! The two booleans are:</p>
        <p>true: <Code>λab.a</Code></p>
        <p>false: <Code>λab.b</Code></p>
        <p>You'll notice that these values themselves are just functions. That's true of any value in the lambda calculus -- all values are just functions that take a certain form. They're called the Church booleans, after Alonzo Church, the mathematician who came up with the lambda calculus, as well as these specific encodings.</p>
        <p>It'll be helpful to assign them to <Code>TRUE</Code> and <Code>FALSE</Code> respectively. Do that.</p>
      </div>
    ),
    winCondition: ({executionContext}) => {
      const t = executionContext.definedVariables.TRUE;
      const f = executionContext.definedVariables.FALSE;
      if (!t || !f) {
        return false;
      }
      return renderAsChurchBoolean(t) === true && renderAsChurchBoolean(f) === false;
    },
  },
  {
    title: 'The Not Function',
    prompt: (
      <div>
        <p>We're gonna work our way to defining the XOR (exclusive or) function on booleans.</p>
        <p>Our first step along the way is to define the NOT function. To do this, let's look at the structure of what a boolean looks like.</p>
        <p>True is just a two argument function that selects the first, whereas false is just a two argument function that selects the second argument. We can therefore call a potential true or false value like a function to select either the first or second parameter!</p>
        <p>For example, take the application <Code>mxy</Code>. If <Code>m</Code> is Church Boolean true, then <Code>mxy</Code> beta reduces to <Code>x</Code>. However, if <Code>m</Code> is Church Boolean false, <Code>mxy</Code> beta reduces to <Code>y</Code></p>
        <p>Try writing the NOT function, and assign that to <Code>NOT</Code>.</p>
        <p>Answer: <span className="secret">NOT := λm.m FALSE TRUE</span></p>
      </div>
    ),
    winCondition: ({ast, lhs}) => (
      // should probably be a broader condition-- test for true and false respectively using N.
      lhs === 'NOT' && ast && satisfiesTruthTable(
        ast,
        [
          [t, f],
          [f, t]
        ]
      )// safeEqual(ast, parse('λm.m(λa.λb.b)(λa.λb.a)'))
    ),
  },
  {
    title: 'The Or Function',
    prompt: (
      <div>
        <p>Nice! We've now done the heavy mental lifting of how to use the structure of the value to our advantage.</p>
        <p>You should be well equipped enough to come up with the OR function, a function which takes two booleans and outputs true if either of parameters are true, otherwise false.</p>
        <p>Give it a shot, and assign it to <Code>OR</Code></p>
        <p>Answer: <span className="secret">OR := λmn.m TRUE n</span></p>
      </div>
    ),
    winCondition: ({ast, lhs}) => (
      // same here
      lhs === 'OR' && ast && satisfiesTruthTable(
        ast,
        [
          [t, t, t],
          [t, f, t],
          [f, t, t],
          [f, f, f]
        ]
      )
      //safeEqual(ast, parse('λm.λn.m(λa.λb.a)n'))
    ),
  },
  {
    title: 'The And Function',
    prompt: (
      <div>
        <p>Closer and closer.</p>
        <p>This one's very similar to the previous one. See if you can define the AND function, a function which takes two booleans and outputs true if both parameters are true, otherwise false.</p>
        <p>Assign your answer to <Code>AND</Code></p>
        <p>Answer: <span className="secret">AND := λmn.m n FALSE</span></p>
      </div>
    ),
    winCondition: ({ast, lhs}) => (
      // same here
      lhs === 'AND' && ast && satisfiesTruthTable(
        ast,
        [
          [t, t, t],
          [t, f, f],
          [f, t, f],
          [f, f, f]
        ]
      ) //&& safeEqual(ast, parse('λm.λn.mn(λa.λb.b)'))
    ),
  },
  {
    title: 'NAND and NOR',
    prompt: (
      <div>
        <p>The NOR and NAND functions are the opposite of OR and AND. For example, if AND returns true, NAND returns false, and vice versa. The same follows for OR and NOR</p>
        <p>Since we've already defined the <Code>NOT</Code>, <Code>AND</Code>, and <Code>OR</Code> functions, we can just compose those together to get <Code>NAND</Code> and <Code>NOR</Code></p>
        <p>Define NAND and NOR, and assign them to <Code>NAND</Code> and <Code>NOR</Code>.</p>
        <p>Answers:</p>
        <p><span className='secret'>NOR := λab. NOT (OR a b)</span></p>
        <p><span className='secret'>NOR := λab. NOT (AND a b)</span></p>
      </div>
    ),
    winCondition: ({executionContext}) => {
      const nor = executionContext.definedVariables.NOR;
      const nand = executionContext.definedVariables.NAND;
      if (!nor || !nand) {
        return false;
      }
      return satisfiesTruthTable(
        nor,
        [
          [t, t, f],
          [t, f, f],
          [f, t, f],
          [f, f, t],
        ]
      ) && satisfiesTruthTable(
        nand,
        [
          [t, t, f],
          [t, f, t],
          [f, t, t],
          [f, f, t],
        ]
      );
    },
  },
  {
    title: 'Composing them all together',
    prompt: (
      <div>
        <p>One last step!</p>
        <p>For reference, the XOR operation is true iff one parameter or the other is true, but not both. So <Code>XOR(true, false)</Code> would be true, but <Code>XOR(true, true)</Code> would be false.</p>
        <p>Let's see if you can translate that into a composition of the functions you've defined so far. Assign your answer to <Code>XOR</Code></p>
        <p>(There is, of course, a simpler way of defining <Code>XOR</Code> without composing functions, and that will work here too)</p>
        <p>Answer: <span className="secret">XOR := λmn. NOR (AND m n) (NAND m n)</span></p>
      </div>
    ),
    winCondition: ({ast, lhs}) => (
      // The likelihood that they got this exact one is pretty small... we really need to define truth tables.
      lhs === 'XOR' && ast && satisfiesTruthTable(
        ast,
        [
          [t, t, f],
          [t, f, t],
          [f, t, t],
          [f, f, f]
        ]
      )
    ),
  },
  {
    title: 'Defining numbers',
    prompt: (
      <div>
        <p>Well, that was a marathon. Take a little break, you've earned it.</p>
        <p>Now we're getting into the meat of it. We can encode numbers in the lambda calculus. Church numerals are 2 argument functions in the following format:</p>
        <p>
          <pre>
            {`
0: λfn.n
1: λfn.f(n)
2: λfn.f(f(n))
3: λfn.f(f(f(n)))
            `}
          </pre>
        </p>
        <p>Write Church Numeral 5</p>
        <p>Answer: <span className="secret">λfn.f(f(f(f(fn))))</span></p>
      </div>
    ),
    winCondition: ({ast}) => ast && (renderAsChurchNumeral(ast) === 5),
  },
  {
    title: 'The Successor Function',
    prompt: (
      <div>
        <p>We can write functions for these numbers. For example, let's look at the <i>successor function</i>, a function which simply adds 1 to its argument.</p>
        <p>If you're feeling brave, you can attempt to write the successor function yourself. It's a pretty interesting exercise. Otherwise, just copy/paste from the answer key, but feel a little defeated while doing so.</p>
        <p>Answer: <span className="secret">λn.λf.λx.f(nfx)</span></p>
      </div>
    ),
    winCondition: ({ast}) => ast && satisfiesTruthTable(
      ast,
      [
        [parse('λfn.n'), parse('λfn.fn')],
        [parse('λfn.fn'), parse('λfn.f(f(n))')],
        [parse('λfn.f(f(n))'), parse('λfn.f(f(f(n)))')],
        [parse('λfn.f(f(f(n)))'), parse('λfn.f(f(f(f(n))))')],
      ]
    ),
  },
  {
    title: "The Successor Function(cot'd)",
    prompt: (
      <div>
        <p>So here's what we just did: Let's say we were adding 1 to <Code>λfn.f(f(f(f(n))))</Code>. We just wrote a function that replaced all the <Code>f</Code>'s with <Code>f</Code>'s again, and then replaced the <Code>n</Code> with a <Code>f(n)</Code>, thus creating a stack one higher than we had before! Magic!</p>
        <p>Assign the successor function to <Code>SUCC</Code>, we'll need it later</p>
      </div>
    ),
    winCondition: ({executionContext}) => (
      executionContext.definedVariables.SUCC && satisfiesTruthTable(
        executionContext.definedVariables.SUCC,
        [
          [parse('λfn.n'), parse('λfn.fn')],
          [parse('λfn.fn'), parse('λfn.f(f(n))')],
          [parse('λfn.f(f(n))'), parse('λfn.f(f(f(n)))')],
          [parse('λfn.f(f(f(n)))'), parse('λfn.f(f(f(f(n))))')],
        ]
      )
    ),
  },
  {
    title: "Adding Numbers bigger than 1",
    prompt: (
      <div>
        <p>The nice thing about Church numerals as we've defined them is they encode "compose this function n times", so in order to compose a function 3 times, just apply the target function to the Church numeral 3.</p>
        <p>Write the "add 4" function by composing the successor function 4 times.</p>
      </div>
    ),
    winCondition: ({ast}) => (
      ast && satisfiesTruthTable(
        ast,
        [
          [parse('λfn.n'), parse('λfn.f(f(f(f(n))))')],
          [parse('λfn.fn'), parse('λfn.f(f(f(f(f(n)))))')],
          [parse('λfn.f(fn)'), parse('λfn.f(f(f(f(f(f(n))))))')],
        ]
      )
    ),
  },
  {
    title: "Defining the Addition Function",
    prompt: (
      <div>
        <p>What's convenient about this is in order to add the numbers <Code>a</Code> and <Code>b</Code>, we just create the <Code>(add a)</Code> function and apply it to <Code>b</Code></p>
        <p>You can take this structure and abstract it out a little, turning it into a function.</p>
        <p>Go ahead and define <Code>ADD</Code> to be your newly crafted addition function.</p>
        <p>Answer: <span className="secret">ADD := λab.a SUCC b</span></p>
      </div>
    ),
    winCondition: ({lhs, ast}) => (
      lhs === 'ADD' && ast && satisfiesTruthTable(
        ast,
        [
          [parse('λfn.n'), parse('λfn.n'), parse('λfn.n')],
          [parse('λfn.f(n)'), parse('λfn.f(n)'), parse('λfn.f(fn)')],
          [parse('λfn.f(f(n))'), parse('λfn.f(f(f(n)))'), parse('λfn.f(f(f(f(f(n)))))')],
        ]
      )
    ),
  },
  {
    title: "Defining the Multiplication Function",
    prompt: (
      <div>
        <p>Let's go ahead write the Multiply function by composing adds together. One possible way to think about a multiply function that takes <Code>x</Code> and <Code>y</Code> "Compose the <Code>Add x</Code> function <Code>y</Code> times, and evaluate that at zero".</p>
        <p>Go ahead and assign that to <Code>MULT</Code></p>
        <p>Answer: <span className="secret">MULT := λab.b(ADD a)λfn.n</span></p>
      </div>
    ),
    winCondition: ({lhs, ast}) => (
      lhs === 'MULT' && ast && satisfiesTruthTable(
        ast,
        [
          [parse('λfn.n'), parse('λfn.n'), parse('λfn.n')],
          [parse('λfn.f(n)'), parse('λfn.f(n)'), parse('λfn.f(n)')],
          [parse('λfn.f(f(n))'), parse('λfn.f(f(f(n)))'), parse('λfn.f(f(f(f(f(fn)))))')],
        ]
      )
    )
  },
  {
    title: "To Exponentiation!",
    prompt: (
      <div>
        <p>This shouldn't be too difficult, as it's very similar to the previous problem.</p>
        <p>Compose together a bunch of multiplications, for some starting position to get the exponentiation function. What's cool is that constructing the exponentiation this way means the function behaves correctly for the number 0 straight out of the box, without eta-reduction</p>
        <p>Assign your exponentiation function to EXP to win, and complete the tutorial.</p>
        <p>Answer is: <span className="secret">EXP := λab.b (MULT a) λfn.fn</span></p>
      </div>
    ),
    winCondition: ({lhs, ast}) => (
      lhs === 'EXP' && ast && satisfiesTruthTable(
        ast,
        [
          [parse('λfn.n'), parse('λfn.fn'), parse('λfn.n')],
          [parse('λfn.f(n)'), parse('λfn.f(n)'), parse('λfn.f(n)')],
          [parse('λfn.f(f(n))'), parse('λfn.n'), parse('λfn.f(n)')],
          [parse('λfn.f(f(n))'), parse('λfn.f(f(f(n)))'), parse('λfn.f(f(f(f(f(f(f(fn)))))))')],
        ]
      )
    )
  },
  {
    title: "Challenges",
    prompt: (
      <div>
        <p>You made it through! Not bad at all!</p>
        <p><b>Miscellaneous Challenges:</b></p>
        <p>(full disclosure: I haven't attempted these)</p>
        <p>1: Write the Subtract 1 function. (there are a number of tutorials you can find on this on the internet)</p>
        <p>2: Write the <Code>Max(a, b)</Code> function, a function that takes two numbers and outputs the larger of the two.</p>
        <p>3: Write a function that computes the decimal equivalent of its input in <a href="https://en.wikipedia.org/wiki/Gray_code">Gray code</a>. In other words, compute <a href="https://oeis.org/A003188">A003188</a></p>
      </div>
    ),
    winCondition: () => false,
  },
];
