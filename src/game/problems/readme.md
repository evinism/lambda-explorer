Problems for the game

The interface I want to go for is where each of these problems is an object containing a `prompt` string and a `winCondition` function. the `winCondition` function should take an object containing... uhh, maybe {inputString, betaReduced, ...}, maybe a computation, and return whether or not the problem is in a win state. There's not too much of a downside to having the win condition possibly depend on lots of stuff.

This interface is probably insufficient, but will be good enough to get a basic version.

Each one of these should be approximately a problem

## Basics
- Identifiers
- Free Variables.
- Parentheses
- Binding Variables in Lambda expressions (end with the identity function)
- Beta reductions with free variables
- The "apply to itself" function, to illustrate just how
- Beta reductions with functions
- Replacing variable names when we need to.
- Multiple argument functions / currying
- Leftmost Innermost Redex.
- Normal form
- Normal form with a Redex.
- The Y-Combinator, where there is no normal form!

- Binding variables in the global scope (an extension of the lambda calculus)
- Reusing variables
- (maybe say what variables we've defined???)

## Boolean expressions: building the XOR operator.
- How do we define true and false? Let's put them both into
- First notice that true/false is essentially a (first argument) vs (second argument) choose operator.
- In a sense, using a 'true/false' value is kind of like a ternary operator. should result in
- Use this knowledge to build the not operator -- should get N: (λe.eft)
- Build And -- should get A: (λa.λb.abf)
- Build Or -- should get O: (λa.λb.atb)
- We can build NAND or NOR out of this. (λa.λb.O(A(Na)b)(A(Nb)a))

# Numbers: Building the Exponentiation function
- Defining numbers
- Go through Multiply by two
- Summation function. This is hard... S: (λi.(λf.λx.if(fx)))
- Compose 2 function. Something like, maybe ordered otherwise: (λf₁.λf₂.λa.f₁(f₂(a)))
- Compose 3 function (same thing).
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

# Challenges (i have no idea how hard these are)
- Write the "subtract 1" function.
- Write the [Max(n, n)] function.
- Write the [bitwise xor] function
