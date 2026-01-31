ok, let's make this repo a monorepo:

- separate the actual svg generation from the cli
- make the generation into an isomorphic library. make it npm-publishable
- make the cli import and use the generator library. make it npm-publishable
- add a React component library with a "generator" component i can drop into pages (e.g: in an MDX page. It should be a client component)
- make the react component library import and use the generator library. make it npm-publishable
- set up a turborepo to manage the three packages (generator lib, cli, react component)
- add a demo page that uses the built library to provide an interactive playground for generating svgs
- set up github actions to publish new versions of the three packages via changesets
