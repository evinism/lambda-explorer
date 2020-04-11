import React from 'react';
import {Code} from './util';

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
            <p>An <i>application</i> is a way in which you can join two expressions together to form a new expression. Applications represent calling a function with an argument.</p>
            <p>To apply variable <Code>a</Code> to variable <Code>b</Code> simply write <Code>b</Code> right after <Code>a</Code>, like <Code>ab</Code>!</p>
        </div>
    ), 
    lambda_abstraction: (
        <div>
            <p>A <i>lambda abstraction</i> is a term of the form <Code>λ [parameter] . [body]</Code> where <Code>[parameter]</Code> is any variable, and <Code>[body]</Code> is any valid expression.</p>
            <p>Lambda abstractions represent functions with one parameter.</p>
        </div>
    ),
    parameter: (
        <div>
            <p>The parameter is the variable that goes in the head of the lambda abstraction</p>
            <p>When beta-reducing, all instances of the parameter get replaced with the </p>
        </div>
    ),
    head: (
        <div>
            <p>The <i>head</i> of a lambda abstraction is the part that comes before the dot. For example, given lambda abstraction <Code>λa.abc</Code>, <Code>λa</Code> is the head.</p>
        </div>
    ),
    body: (
        <div>
            <p>The <i>body</i> of a lambda abstraction is section that follows the dot. For example, given lambda abstraction <Code>λa.abc</Code>, <Code>abc</Code> is the body.</p>
            <p>The body of the lambda abstraction represents what the function evaluates to.</p>
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
