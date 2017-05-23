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
- Go through Multiply by two.
- Summation function. This is hard... S: (λi.(λf.λx.if(fx)))
- Teach going through the subtract by 1 function

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

## More obscure data types
- List
- Pair


## Challenges (i have no idea how hard these are)
- Write the [Max(n, n)] function
- Gray encoding
- Write the [bitwise xor] function

# Script outlines

## Basic syntax.

### 1: Variables

The first type of expression in the lambda calculus are variables.

Variables are placeholders for other functions. In this REPL, single letters optionally followed by subscripts are allowed as variable names.

Try typing any variable!

### Applications

The second type of expression in the lambda calculus are applying an expression for another expression. Placing them one after another looks like so.

Applications are right associative, so `abcdef` will parse to `((((ab)c)d)e)f`. This might seem a little odd, but in a few steps, it'll be very convenient.

### Lambda Abstractions

The third and final type of expressions are Lambda abstractions. Lambda abstractions consist of a head and a body. The head is a variable, the body is any lambda expression.

(show image here)

Generally, if two functions are exactly the same but have different names, they are considered equivalent. For example, `La.a` and `Lb.b` are considered to be equivalent.

### Parentheses

Let's say we want to do this grouping a little differently. Any expression in the lambda calculus can be surrounded by parentheses. Try writing a valid expression with parentheses.

### Multiple arguments

Let's say we quite reasonably want to represent a function which takes multiple arguments.

With lambda abstractions, we can only represent functions that take single arguments, but we can sort of get around the restriction by making it so that a function returns another function that

In practice, this looks like `La.Lb.([some expression])`.

The reason function application is right associative is that it makes this structure very convenient-- if you have a function `S` that takes three arguments `a`, `b` and `c`, you can write `Sabc` rather than `((Sa)b)c`

### Syntactic sugar

Representing functions with multiple arguments like this is so convenient, we're going to introduce a special syntax. We'll write `Lab.([some expression])` as shorthand for `La.Lb.([some expression])`. Try writing a function using that syntax!

## Computation

### Beta Reduction

So what does computation look like in the lambda calculus? We'll execute

### Beta reduction with a function

Beta reduction works with any expression, including functions! Try writing a beta reduction with another function as input.

### Beta + Alpha conversion.
Occasionally, we'll get into a situation where a variable that previously was unbound is suddenly bound to a variable that it shouldn't be. For example, if we tried beta-reducing `(λab.ab)b` without renaming, we'd get `λb.bb`, which is  not quite what we intended. We likely wanted `b` to remain a free variable.

Instead, we do an alpha-conversion of the lambda expression prior to doing the beta reduction.

Try it out!

### : Leftmost Outermost Redex

Often, an expression is not beta reducible itself, but contains one or more beta reducible expressions (redexes) nested within. The operation we perform

We traverse the tree, looking for the leftmost outermost redex.

Try writing a function with a nested redex!

### : Normal Form

If we do this repeatedly until there's nothing more to reduce, we get to what's called the "normal form". Finding the normal form is analogous to executing the lambda expression, and is in fact what this repl does when you enter an expression. In this repl you can see the steps to normal form by pressing the (+) button.

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

Try to define the successor function. This'll require playing around to get it just right, so don't worry if this takes a little while.

Hint: Try to make x(x(x(x(y)))) first, where x and y are free variables. Then, start abstracting away the variables

###
