# Ryan Kubik's Static Site Generator

The idea of this project is to build a static site generator specifically only for my own purposes. I liked [this article](https://henderson.lol/pages/hire/psg) from a friend on the subject and it inspired this project.

I went and overcomplicated this project, but I had fun doing so. I learned a lot more about how some of these tools work so that has been nice too.

## Development

This project has an `example` directory, this is a fake site that has a bunch of different features the generator supports.

To do a test build:

- `npm run build:clean` to remove all previously built files
- `npm run build:example` to generate a build of the example project in the `dist` folder
- `npm run build:serve` will run a dev server that auto-rebuilds and hot-reloads site files as you work on them

## Architecture

There's a build `Pipeline` that governs how the build works. Right now it is created in `src/pipeline/createBuildPipeline.ts`. Ideally, this pipeline should be easily configurable per consumer in the future.

A Pipeline has three kinds of component:

- `Sourcer` - locates files from sources (only on disk right now) and gets them into the pipeline
- `Transformer` - uses information from files to add data to `file.transformations` used in subsequent transformations or emissions
- `Emitter` - uses transformed file data to write files to disk

### Transformers

The order of transformations matters. This leads to several inconvenient issues right now. It is not particularly intuitive, easy to make mistakes, and hard to tell what those mistakes are. I'd like to explore cleaning that up in the future as I add new capabilities.

There seem to be sort of "pre" and "post" transformation steps. These aren't formalized. The "pre" steps are more about identifying data about files so that the main transformations can use that data. The main transformations actually convert files to significant different formats. The "post" transformations do things like prettify output.

I'm not sure if formalizing this pre, main, post will help understanding or not. I think it could reduce the cognitive load of dealing with the specific ordering transformers are run.
