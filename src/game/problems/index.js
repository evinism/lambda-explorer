import React from 'react';
import InlineDefinition from '../inlineDefinitions/InlineDefinition';
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

const Code = props => (<span className="code">{props.children}</span>);

// just a dumb alias
const Def = ({e, children}) => (<InlineDefinition entry={e}>{children}</InlineDefinition>);

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
        <p>You just wrote an expression which contains only the variable <Code>a₁</Code>, which is just a symbol, and not currently bound to anything. In the lambda calculus, variables can be bound to functions, and variables can be applied to one another.</p>
        <p>To apply the variable <Code>a₁</Code> to the variable <Code>b₁</Code>, type in <Code>a₁b₁</Code>. This represents calling the function <Code>a₁</Code> with <Code>b₁</Code> as an argument.</p>
        <p>Remember, the variable or function you're applying always goes <i>first</i></p>
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
        <p>Since lots of variables in the Lambda Calculus are single letters, there's often a semantic ambiguity when written down. For example, if I type in <Code>hi</Code>, do I mean one variable <Code>hi</Code>, or the variable <Code>h</Code> applied to variable <Code>i</Code>?</p>
        <p>For ease of use in this REPL, we'll make a small comprimise: upper case letters are interpreted as multi-letter variables, and lower case letters are interpreted as single-letter variables.</p>
        <p>Try typing <Code>MULT</Code>, and observe that it's interpreted as one variable, and NOT an application.</p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('MULT')),
  },
  {
    title: 'Identity',
    prompt: (
      <div>
        <p>Now we'll get into lambda abstractions. Lambda abstractions represent functions in the lambda calculus. A lambda abstraction takes the form <Code>λ [head] . [body]</Code> where <Code>[head]</Code> is the parameter of the function, and <Code>[body]</Code> is what the function resolves to.</p>
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
        <p>Perfect! In the lambda calculus, you can always wrap <Def e={'expression'}>expressions</Def> in parentheses.</p>
        <p>Now in the same way that we can apply variables to other variables, we can apply lambda expressions to variables. Try applying your identity function to the variable <Code>b</Code>, by writing <Code>(λa.a)b</Code>.</p>
        <p>Don't worry if this doesn't make sense yet, we'll go a bit more in depth in the future.</p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('(λa.a)b')),
  },
  {
    title: 'β-reduction function',
    prompt: (
      <div>
        <p>Nice! What happened here is your identity function took <Code>b</Code> as the input and spit it right back out. The process of evaluating a function like this is called <i>beta reduction</i>.</p>
        <p>The result you're seeing here is in what's called <i>normal form</i>, which we'll also go through a little later.</p>
        <p>Just like we can evaluate functions with variables, we can also evaluate them with other functions! Try typing <Code>(λa.a)λb.b</Code></p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('(λa.a)λb.b')),
  },
  {
    title: 'A primer on parsing',
    prompt: (
      <div>
        <p>So we can perform beta reductions with other functions as the argument!</p>
        <p>With that, we've just introduced the main elements of the syntax of the lambda calculus:</p>
        <table><tbody>
          <tr><td>Variables</td><td><Code>a₁</Code></td></tr>
          <tr><td>Applying one expression to another</td><td><Code>a₁b₁</Code></td></tr>
          <tr><td>A lambda abstraction</td><td><Code>λx.y</Code></td></tr>
          <tr><td>Parentheses</td><td><Code>(λx.y)</Code></td></tr>
        </tbody></table>
        <p>We've also introduced a few ways in which these can be combined.</p>
        <table><tbody>
          <tr><td>Applying one lambda expression to a variable</td><td><Code>(λx.x)b₁</Code></td></tr>
          <tr><td>Applying one lambda expression to another</td><td><Code>(λa.a)λb.b</Code></td></tr>
        </tbody></table>
        <p>It's time to solidify our understanding of how these combine syntactically. Write any expression to continue.</p>
      </div>
    ),
    winCondition: () => true,
  },
  {
    title: 'Left-associativity',
    prompt: (
      <div>
        <p>Repeated <Def e='application'>applications</Def> in the lambda calculus are what is called <i>left-associative</i>. This means that repeated applications are evaluated from left to right.</p>
        <p>To make this clearer, if we were to explicity write out the parentheses for the expression <Code>abcd</Code>, we'd end up with <Code>((ab)c)d</Code>. That is, in the expression <Code>abcd</Code>, <Code>a</Code> will first be applied to <Code>b</Code>, then the result of <Code>ab</Code> will be applied to <Code>c</Code>, so on and so forth.</p>
        <p>Write out the parentheses explicitly for <Code>ijkmn</Code></p>
      </div>
    ),
    winCondition: ({text}) => {
      // Any of these are valid interpretations and we should be permissive rather
      // than enforcing dumb bullshit.
      return [
        '(((ij)k)m)n',
        '((((ij)k)m)n)',
        '((((i)j)k)m)n',
        '(((((i)j)k)m)n)',
      ].includes(text.replace(/\s/g, ''));
    },
  },
  {
    title: 'Tightly Binding Lambdas',
    prompt: (
      <div>
        <p><Def e='lambda_abstraction'>Lambda abstractions</Def> have higher prescedence than <Def e='application'>applications</Def>.</p>
        <p>This means that if we write the expression <Code>λx.yz</Code>, it would be parenthesized as <Code>λx.(yz)</Code> and NOT <Code>(λx.y)z</Code>.</p>
        <p>As a rule of thumb, the body of a lambda abstraction (i.e. the part of the lambda expression after the dot) extends all the way to the end of the expression unless parentheses tell it not to.</p>
        <p>Explicitly write the parentheses around <Code>λw.xyz</Code>, combining this new knowledge with what you learned in the last question around how applications are parenthesized.</p>
        <p>Solution: <span className='secret'>λw.((xy)z)</span></p>
      </div>
    ),
    winCondition: ({text}) => {
      return [
        'λw.((xy)z)',
        '(λw.((xy)z))',
        'λw.(((x)y)z)',
        '(λw.(((x)y)z))',
      ].includes(text.replace(/\s/g, ''));
    },
  },
  {
    title: 'Applying Lambdas to Variables',
    prompt: (
      <div>
        <p>So what if we DID want to apply a <Def e='lambda_abstraction'>lambda abstraction</Def> to a variable? We'd have to write it out a little more explicity, like we did back in problem 6.</p>
        <p>For example, if we wanted to apply the lambda abstraction <Code>λx.y</Code> to variable <Code>z</Code>, we'd write it out as <Code>(λx.y)z</Code></p>
        <p>Write an expression that applies the lambda abstraction <Code>λa.bc</Code> to the variable <Code>d</Code>.</p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('(λa.bc)d')),
  },
  {
    title: 'Applying Variables to Lambdas',
    prompt: (
      <div>
        <p>Fortunately, the other direction requires fewer parentheses. If we wanted to apply a variable to a lambda abstraction instead of the other way around, we'd just write them right next to each other, like any other application.</p>
        <p>Concretely, applying <Code>a</Code> to lambda abstraction <Code>λb.c</Code> is written as <Code>aλb.c</Code></p>
        <p>Try applying <Code>w</Code> to <Code>λx.yz</Code>!</p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('wλx.yz')),
  },
  {
    title: 'Curry',
    prompt: (
      <div>
        <p>As you may have noticed before, functions can only take one argument, which is kind of annoying.</p>
        <p>Let's say we quite reasonably want to write a function which takes more than one argument. Fortunately, we can sort of get around the single argument restriction by making it so that a function returns another function, which when evaluated subsequently gives you the result. Make sense?</p>
        <p>In practice, this looks like <Code>λa.λb. [some expression]</Code>. Go ahead and write any 'multi-argument' function!</p>
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
    title: 'Summing up Syntax',
    prompt: (
      <div>
        <p>We've just gone through a whirlwind of syntax in the Lambda Calculus, but fortunately, it's almost everything you need to know.</p>
        <p>As a final challenge for this section on syntax, try writing out the expression that applies the expression <Code>aλb.c</Code> to variable <Code>d</Code></p>
      </div>
    ),
    winCondition: ({ast}) => safeEqual(ast, parse('(aλb.c)d')),
  },
  {
    title: 'β-reducibility revisited',
    prompt: (
      <div>
        <p>Let's take a deeper look at Beta Reductions.</p>
        <p>When an <Def e='expression'>expression</Def> is an <Def e='application'>application</Def> where the left side is a <Def e='lambda_abstraction'>lambda abstraction</Def>, we say that the expression is <i>beta reducible</i>.</p>
        <p>Here are a few examples of beta reducible expressions:</p>
        <table>
            <thead>
              <tr>
                  <th scope="col">Expression</th>
                  <th scope="col">Explanation</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><Code>(λx.y)z</Code></td><td>Lambda abstraction <Code>λx.y</Code> applied to <Code>z</Code></td></tr>
              <tr><td><Code>(λa.b)λc.d</Code></td><td>Lambda abstraction <Code>λa.b</Code> applied to <Code>λc.d</Code></td></tr>
              <tr><td><Code>(λzz.top)λy.ee</Code></td><td>Lambda abstraction <Code>λz.λz.top</Code> applied to <Code>λy.ee</Code></td></tr>
            </tbody>
          </table>
        <p>And here are a few examples of expressions that are NOT beta reducible:</p>
        <table>
            <thead>
              <tr>
                  <th scope="col">Expression</th>
                  <th scope="col">Explanation</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><Code>zλx.y</Code></td><td>Variable <Code>z</Code> applied to <Code>λx.y</Code></td></tr>
              <tr><td><Code>λa.bcd</Code></td><td>Lambda abstraction <Code>λa.bcd</Code>, but not applied to anything</td></tr>
              <tr><td><Code>bee</Code></td><td>Application <Code>be</Code> applied to <Code>e</Code></td></tr>
              <tr><td><Code>f(λg.h)i</Code></td><td>Application <Code>f(λg.h)</Code> applied to <Code>i</Code> (This one's tricky! Remember that applications are left-associative).</td></tr>
            </tbody>
          </table>
        <p>Write any beta reducible expression that does not appear in the above table.</p>
      </div>
    ),
    winCondition: ({ast}) => {
      const rejectList = [
        '(λx.y)z',
        '(λa.b)λc.d',
        '(λz.λz.top)λy.ee',
      ];
      const isInList = !!rejectList.find(
        rejectItem => safeEqual(ast, parse(rejectItem)));
      return !isInList && ast && bReduce(ast);
    }
  },
  {
    title: 'A more precise look at β-reductions',
    prompt: (
      <div>
        <p>As you might guess, if something is beta reducible, that means we can perform an operation called <i>beta reduction</i> on the expression.</p>
        <p>Beta reduction works as follows:</p>
        <table>
          <thead>
            <tr>
              <th scope="col">Expression</th>
              <th scope="col">Step</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><Code>(λa.aba)c</Code></td><td>Start with a <Def e="beta_reducible_intro">beta reducible</Def> expression.</td></tr>
            <tr><td><Code>(λa.cbc)c</Code></td><td>In the <Def e='body'>body</Def> of the lambda abstraction, replace every occurrence of the <Def e='parameter'>parameter</Def> with the <Def e='argument'>argument</Def>.</td></tr>
            <tr><td><Code>λa.cbc</Code></td><td>Erase the argument.</td></tr>
            <tr><td><Code>cbc</Code></td><td>Erase the <Def e="head">head</Def> of the lambda expression.</td></tr>
          </tbody>
        </table>
        <p>That's all there is to it!</p>
        <p>Write any expression that beta reduces to <Code>pp</Code>.</p>
      </div>
    ),
    winCondition: ({ast}) => {
      return ast && safeEqual(bReduce(ast), parse('pp'));
    },
  },
  {
    title: 'β-reduction function reprise',
    prompt: (
      <div>
        <p>As we showed in the beginning, this works on functions as well!</p>
        <p>Let's work through an example for a function:</p>
        <table>
          <thead>
            <tr>
                <th scope="col">Expression</th>
                <th scope="col">Step</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><Code>(λx.yx)λa.a</Code></td><td>Start with a beta reducible expression.</td></tr>
            <tr><td><Code>(λx.y(λa.a))λa.a</Code></td><td>In the <Def e='body'>body</Def> of the lambda abstraction, replace every occurrence of the <Def e='parameter'>parameter</Def> with the <Def e='argument'>argument</Def>.</td></tr>
            <tr><td><Code>λx.y(λa.a)</Code></td><td>Erase the argument.</td></tr>
            <tr><td><Code>y(λa.a)</Code></td><td>Erase the <Def e='head'>head</Def> of the lambda expression.</td></tr>
          </tbody>
        </table>
        <p>Write any expression that beta reduces to <Code>iλj.k</Code>.</p>
      </div>
    ),
    winCondition: ({ast}) => {
      return ast && safeEqual(bReduce(ast), parse('i(λj.k)'));
    },
  },
  {
    title: 'Bound and Free Variables',
    prompt: (
      <div>
        <p>It's prudent to make a distinction between bound and free variables. When a function takes an argument, every occurrence of the variable in the body of the function is <i>bound</i> to that parameter.</p>
        <p>For quick example, if you've got the expression <Code>λx.xy</Code>, the variable <Code>x</Code> is bound in the lambda expression, whereas the variable <Code>y</Code> is currently unbound. We call unbound variables like <Code>y</Code> <i>free variables</i>.</p>
        <p>Write a lambda expression with a free variable <Code>c</Code> (hint: this can be extremely simple).</p>
      </div>
    ),
    winCondition: ({ast}) => ast && getFreeVars(ast).map(item => item.name).includes('c'),
  },
  {
    title: 'α conversions',
    prompt: (
      <div>
        <p>Easy enough. In this REPL you can see what free variables are in an expression (as well as a lot of other information) by clicking the (+) that appears next to results.</p>

        <p>It might be obvious that there are multiple ways to write a single lambda abstraction. For example, let's take that identity function we wrote all the way in the beginning, <Code>λa.a</Code>. We could have just as easily used <Code>x</Code> as the parameter, yielding <Code>λx.x</Code>.</p>
        <p>The lambda calculus's word for "renaming a parameter" is <i>alpha-conversion.</i></p>
        <p>Manually perform an alpha conversion for the expression <Code>λz.yz</Code>, by replacing <Code>z</Code> with <Code>t</Code></p>
      </div>
    ),
    winCondition: ({ast}) => {
      return ast && safeEqual(ast, parse('λt.yt'));
    },
  },
  // --- Computation ---
  {
    title: 'β reductions + α conversions',
    prompt: (
      <div>
        <p>Occasionally, we'll get into a situation where a variable that previously was unbound is suddenly bound to a parameter that it shouldn't be. For example, if we tried beta-reducing <Code>(λab.ab)b</Code> without renaming to resolve the conflict, we'd get <Code>λb.bb</Code>. What originally was a free variable <Code>b</Code> is now (accidentally) bound to the parameter of the lambda expression!</p>
        <p>To eliminate this conflict, we have to do an alpha-conversion prior to doing the beta reduction.</p>
        <p>Try inputting an expression (like <Code>(λab.ab)b</Code>) that requires an alpha conversion to see how the REPL handles this situation.</p>
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
        <p>Type in any expression to continue.</p>
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
      error && error.message === 'Normal form execution exceeded. This expression may not have a normal form.'
    )
  },
  {
    title: 'The Y-Combinator',
    prompt: (
      <div>
        <p>You can expand that error that pops up to see the first few iterations. If you went with <Code>(λa.aa)λa.aa</Code>, you can see that performing a beta reduction gives you the exact same expression back!</p>
        <p>The famed Y-Combinator is one of these expressions without a normal form. Try inputting the Y-Combinator, and see what happens:</p>
        <p>Y: <Code>λg.(λx.g(xx))(λx.g(xx))</Code></p>
      </div>
    ),
    winCondition: ({ast}) => equal(ast, parse('λg.(λx.g(xx))(λx.g(xx))')),
  },
  {
    title: "Assigning variables",
    prompt: (
      <div>
        <p>In the lambda calculus, there's no formal notion of assigning variables, but it's far easier for us to refer to functions by name than just copy/paste the expression every time we want to use it.</p>
        <p>In this REPL, we've added a basic syntax around assign variables. (Note: You can't assign an expression with free variables.)</p>
        <p>This kind of <i>lexical environment</i> around the lambda calculus comes very close to the original sense of a <a href="https://en.wikipedia.org/wiki/Closure_(computer_programming)" target="blank">closure</a>, as presented in <a href="https://www.cs.cmu.edu/~crary/819-f09/Landin64.pdf" target="blank">The mechanical evaluation of expressions</a>.</p>
        <p>Try assigning <Code>ID</Code> to your identity function by typing <Code>ID := λa.a</Code></p>
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
  {
    title: 'Using assigned variables',
    prompt: (
      <div>
        <p>Now that <Code>ID</Code> is defined in the <i>lexical environment</i>, we can use it as if it's a previously bound variable</p>
        <p>Try writing <Code>ID b</Code> in order to apply your newly defined identity function to <Code>b</Code>, with predictable results.</p>
      </div>
    ),
    winCondition: ({ast}) => (
      // we don't really have a good way of testing whether or not
      // a certain variable was used, because execution context does var replacement,
      // which is kinda bad. whatever. just check if left is identical to ID.
      ast &&
        ast.type === 'application' &&
        safeEqual(ast.left, parse('λa.a'))
    ),
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
        <p>True is just a two parameter function that selects the first, whereas false is just a two parameter function that selects the second argument. We can therefore call a potential true or false value like a function to select either the first or second parameter!</p>
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
        <p><span className='secret'>NAND := λab. NOT (AND a b)</span></p>
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
        <p>Answer: <span className="secret">XOR := λmn. AND (OR m n) (NAND m n)</span></p>
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
        <p>Now we're getting into the meat of it. We can encode numbers in the lambda calculus. Church numerals are 2 parameter functions in the following format:</p>
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
        <p>For example, let's say we had the function <Code>APPLY_C := λa.a c</Code> that applied free variable <Code>c</Code> to whatever function was passed in. If we wanted to write a function that applied c 3 times, we would write <Code>(λfn.f(f(fn))) APPLY_C</Code></p>
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
