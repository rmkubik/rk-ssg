import path from "path";
import { SsgFile } from "../files/ssgFile";
import { Emitter } from "./emitter";
import micromatch from "micromatch";
import { PipelineContext } from "../pipeline/pipelineContext";
import { Feed, Item } from "feed";
import { title } from "process";
import { URL } from "url";
import fsExtra from "fs-extra";

export class EmitRssFeed extends Emitter {
  constructor(private directory: string, private outputDir: string) {
    super();
  }

  filter(file: SsgFile): boolean {
    return true;
  }

  async emit(files: SsgFile[], context: PipelineContext): Promise<void> {
    const htmlFiles = context.htmlFilesInDirectory(this.directory);
    const posts: Post[] = htmlFiles.map((file) => {
      const fileUrl = new URL(context.siteUrl);
      fileUrl.pathname = file.slug;

      return {
        title: file.slug,
        url: fileUrl,
        description: file.slug,
        // TODO:
        // This will happen for .html files right now, we don't read their
        // content into transformations as htmlContent right now, I'm pretty
        // sure...
        content: file.transformations.htmlContent ?? "Missing htmlContent",
        date: new Date(),
        image: fileUrl,
      };
    });

    const feedContent = createAtomFeed(posts);

    await fsExtra.outputFile(
      path.join(this.outputDir, "feed.xml"),
      feedContent
    );
  }
}

type Post = {
  title: string;
  url: URL;
  description: string;
  content: string;
  date: Date;
  image: URL;
};

function createAtomFeed(posts: Post[]) {
  const feed = new Feed({
    title: "Feed Title",
    description: "This is my personal feed!",
    id: "http://example.com/",
    link: "http://example.com/",
    language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: "http://example.com/image.png",
    favicon: "http://example.com/favicon.ico",
    copyright: "All rights reserved 2013, John Doe",
    updated: new Date(2013, 6, 14), // optional, default = today
    generator: "awesome", // optional, default = 'Feed for Node.js'
    feedLinks: {
      json: "https://example.com/json",
      atom: "https://example.com/atom",
    },
    author: {
      name: "John Doe",
      email: "johndoe@example.com",
      link: "https://example.com/johndoe",
    },
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: post.url.toString(),
      link: post.url.toString(),
      description: post.description,
      content: post.content,
      author: [
        {
          name: "Jane Doe",
          email: "janedoe@example.com",
          link: "https://example.com/janedoe",
        },
        {
          name: "Joe Smith",
          email: "joesmith@example.com",
          link: "https://example.com/joesmith",
        },
      ],
      contributor: [
        {
          name: "Shawn Kemp",
          email: "shawnkemp@example.com",
          link: "https://example.com/shawnkemp",
        },
        {
          name: "Reggie Miller",
          email: "reggiemiller@example.com",
          link: "https://example.com/reggiemiller",
        },
      ],
      date: post.date,
      image: post.image.toString(),
    });
  });

  feed.addCategory("Technologie");

  feed.addContributor({
    name: "Johan Cruyff",
    email: "johancruyff@example.com",
    link: "https://example.com/johancruyff",
  });

  return feed.atom1();
}
