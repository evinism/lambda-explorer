Problems for the game

The interface I want to go for is where each of these problems is an object containing a `prompt` string and a `winCondition` function. the `winCondition` function should take an object containing... uhh, maybe {inputString, betaReduced, ...}, maybe a computation, and return whether or not the problem is in a win state. There's not too much of a downside to having the win condition possibly depend on lots of stuff.

This interface is probably insufficient, but will be good enough to get a basic version.

Each one of these should be approximately a problem

## Basics
- Identifiers
- Parentheses
- Lambda expression syntax.
- Free Variables.
- Multiple argument functions / currying
- The "apply to itself" function, to illustrate the copy paste aspect of it.
- Beta reductions with functions as the input.
- Replacing variable names when we need to, via alpha conversion.
- Leftmost Outermost Redex (normal order)
- Normal form (no redexes exist);
- Functions with no normal form, i.e. (λa.aa)λb.bb
- The Y-Combinator, where there is no normal form!

- Binding variables in the global scope (an extension of the lambda calculus)
- Reusing variables
-- (maybe say what variables we've defined???)

## Boolean expressions: building the XOR operator.
- How do we define true and false? Let's put them both into
- First notice that true/false is essentially a (first argument) vs (second argument) choose operator.
- In a sense, using a 'true/false' value is kind of like a ternary operator. should result in
- Use this knowledge to build the not operator -- should get N: (λe.eft)
- Build And -- should get A: (λa.λb.abf)
- Build Or -- should get O: (λa.λb.atb)
- We can build NAND or NOR out of this. (λa.λb.O(A(Na)b)(A(Nb)a))

## Numbers: Building the Exponentiation function
- Defining numbers
- Summation function. This is hard... S: (λi.(λf.λx.if(fx)))
[...]
- Compose N function (comes out nice and simple). looking for as C := (λf.λn.nf)
- Compose N Successor functions together. looking for A := (CS)
- Compose M (add N) functions together, evaluate at 0 to get M multiplied by N...
-- Start off with a set N.
-- then abstract those away
-- looking for: M := (λm.(λn.(C(Am)n)λa.λb.b))

- Compose M (multiply by N) functions together, evaluate at 1 to get M^N
-- Start off with a set N
-- then abstract away
-- looking for E := λm.λn.((C(Mm)n)λa.λb.a(b))

- Let's try exponentiation with the number 0 in certain places. Do we get what we expect?
-- We do get it!

## More obscure data types
- List
- Pair


## Challenges (i have no idea how hard these are)
- Write the [Max(n, n)] function
- Gray encoding
- Write the [bitwise xor] function

# Scratchwork:

### : Leftmost Outermost Redex

Often, an expression is not beta reducible itself, but contains one or more beta reducible expressions (redexes) nested within.

Try writing a function with a nested redex!


### : Normal Form

If we do this repeatedly until there's nothing more to reduce, we get to what's called the "normal form". Finding the normal form is analogous to executing the lambda expression, and is in fact exactly what this repl does when you enter an expression. In this repl you can see the steps to normal form by pressing the (+) button.

### : Or not.

It's possible that this process never halts, meaning that a normal form for the expression doesn't exist. See if you can find an expression whose normal form doesn't exist!

Hint: [determine hint from going through the puzzle with folk]

Answer:
The simplest example is `(λa.aa)λa.aa`. Since the process never ends, this expression does not have a normal form. Take a look at what happens!

### : The Y-Combinator

The famed Y-Combinator is one of these expressions. Try inputting the Y-Combinator, and see what happens: `λg.(λx.g(xx))(λx.g(xx))`

## Math

### Encoding numbers

Now we're getting into the meat of it. We can encode numbers in the lambda calculus.

A Church Numeral is a function of the form: [explanatory image]

Write Church Numeral 5

### The successor function

We can write functions for these numbers. For example, let's look

If you're feeling brave, you can attempt to write the successor function yourself. It's pretty interesting.

Or hover over this for the answer: λn.λf.λx.f(nfx)

### The successor function (cot'd)

So what we did there is we replaced all the f's with f's again, and then replaced the n with a f(n), thus creating a stack one higher than we had before!

Bind that function to a variable (we're going with S), we'll need it later.

### Composition function

It turns out if you want to think of the 'meaning' of a number n, the number composes it's first argument n times, then applies the result

With this in mind,
