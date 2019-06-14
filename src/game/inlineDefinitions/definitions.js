import React from 'react';

export default {
    redex: (
        <div>Reducible Expression haha lol</div>
    ),
    expression: (
        <div>
            <p>An <i>expression</i> is any valid combination of lambda abstractions, applications, and variables. You're typing expressions into the interpreter!</p>
        </div>
    ),
    application: (
        <div>
            <p>An <i>application</i> is a term in the lambda calculus where two expressions are "applied" to each other.</p>
            <p>This is akin to calling A with B as an argument</p>
        </div>
    ), 
    lambda_abstraction: (
        <div>
            <p>A <i>lambda abstraction</i> term of the form λ [head] . [body]</p>
            <p>Lambda abstractions represent functions in the lambda calculus.</p>
        </div>
    ),
    parameter: (
        <div>
            <p>The parameter is the variable that goes in the head of the lambda abstraction</p>
            <p>When beta-reducing, all instances of the parameter get replaced with the </p>
        </div>
    ),
    head: (
        <div>TK</div>
    ),
    body: (
        <div>
            <p>The <i>body</i> of a lambda abstraction is section that follows the dot</p>
            <p>This represents what the function returns.</p>
        </div>
    ),
    argument: (
        <div>
            <p>When your expression is an application, the <i>argument</i> is the right side of the application.</p>
            <p>For example, in the expression ab, the argument is b</p>
        </div>
    ),
    // Problem specific definitions
    beta_reducible_intro: (
        <div>
            <p>An expression is <i>beta reducible</i> if the expression is an application where the left side is a lambda abstraction.</p>
            <p>In this case, the left side of the application is λa.aba and the right side is c</p>
        </div>
    )
};
