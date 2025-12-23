The idea of this project is to build a static site generator specifically only for my own purposes.

Architecture thoughts

- You have a sourcer
  - find markdown files
  - find templates
  - find image files
  - find static/public files
- You have a transformer
  - parse markdown files
    - frontmatter
    - custom syntax
  - combine markdown files and templates
  - transform images
- You have an emitter
  - write combined template files to disk
  - write images to disk
  - write RSS feed to disk
  - write static/public files to disk

I think we could just run these things in sequence. That might not be a robust model... But I think it should serve perfectly fine for my own purposes.

Using TS and Bun:

- I think we can just write this as TS
- We can use Bun for now. I don't think I'm into their long term trajectory, but it does make TS "just work" for what I've seen thus far.
- We can build this as a single file executable: https://bun.com/docs/bundler/executables

API

- rk-ssg build <target_dir>
- rk-ssg serve <target_dir>
