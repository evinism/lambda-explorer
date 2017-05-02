export default [
  {
    number: 0,
    title: 'Are you dead?',
    prompt: 'type something in. This is the hardest problem out of all of them',
    winCondition: ({text}) => text !== '',
  },
  {
    number: 1,
    title: 'Five plus Three plus Two',
    prompt: 'type in something longer than 10 characters',
    winCondition: ({text}) => text.length > 10,
  },
  // okay the first problem I actually care about
  {
    number: 2,
    title: 'Identity',
    prompt: "First, we'll get you started with some basic syntax. We're gonna make the identity function. please type La.a or something",
    winCondition: ({normalForm}) => {
      return (
        // We could put conditions that we might like to use into lib/lambda when we need to.
        normalForm &&
        normalForm.type === "function" &&
        normalForm.body.type === "token" &&
        normalForm.argument === normalForm.body.name
      );
    }
  }
];
