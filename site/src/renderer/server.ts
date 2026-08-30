/*
 * Islands here are `client:only`, so nothing is rendered on the server. The
 * entry exists because a renderer must have one; `check` says no to every
 * component so a stray `client:load` fails loudly instead of rendering blank.
 */
export default {
  name: "solid",
  check: () => false,
  renderToStaticMarkup: () => ({ html: "" }),
};
