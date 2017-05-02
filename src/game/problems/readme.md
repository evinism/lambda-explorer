Problems for the game

The interface I want to go for is where each of these problems is an object containing a `number`, a `prompt` string and a `winCondition` function. the `winCondition` function should take an object containing... uhh, maybe {inputString, betaReduced, ...}, and whatever else we want, and return whether or not the problem is in a win state. There's not too much of a downside to having the win condition possibly depend on lots of stuff.

This interface is probably insufficient, but will be good enough to get a basic version.
