export default [
  {
    number: 1,
    prompt: "type something in. This is the hardest problem out of all of them",
    winCondition: ({text}) => text !== '',
  },
  {
    number: 2,
    prompt: "type in something longer than 10 characters",
    winCondition: ({text}) => text.length > 10,
  },
  // okay the first problem I actually care about
  /*
  {
    number: 3,
    prompt: "First, we'll get you started with some basic syntax. We're gonna make the identity function. please type La.a or something",
    winCondition: ({normalForm}) => (
      // We could put conditions that we might like to use into lib/lambda when we need to.
      normalForm.type === "lambda" &&
      normalForm.body.type === "argument" &&
      normalForm.argument === normalForm.body
    )
  }*/
];
