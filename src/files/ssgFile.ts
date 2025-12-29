import { FileSource } from "./fileSource";
import fsExtra from "fs-extra";
import { FileTransformations } from "../transformers/fileTransformations";
import path from "path";

export class SsgFile {
  transformations: FileTransformations;

  constructor(public source: FileSource) {
    this.transformations = new FileTransformations();
  }

  /**
   * TODO:
   * Catch-22 problem
   *
   * This doesn't capture .eta templated files that will be given
   * htmlContent later on.
   *
   * But, we need to compute this .isHtml logic in order for these
   * .eta templates to be compiled.
   *
   * We almost need like a double pass transform or something.
   *
   * The first pass goes through and marks everything that WILL become
   * HTML. Gathers up all that context.
   *
   * And then we actually run that filter pass over top of everything
   * or something like that.
   *
   * Almost like a "preTransform" step or something, perhaps?
   */
  get isHtml(): boolean {
    return (
      this.source.extension === ".html" ||
      !!this.transformations.htmlContent ||
      /**
       * TODO:
       * This is pretty brittle. We don't know any given .eta
       * file will be transformed or not later on in our pipeline
       * in practice... However, in the pipeline I've put together
       * in this project thus far we do know this... That's good
       * enough for now.
       */
      this.source.extension === ".eta"
    );
  }

  async copyTo(target: string, content?: string): Promise<void> {
    /**
     * TODO:
     * This is maybe not the place that I should be checking doNotEmit.
     *
     * I think maybe copyTo could become emit?
     *
     * I'm not sure exactly... Right now, copyTo() requires callsites
     * to provide file.outputPath to this function so emission works as
     * expected. That seems silly.
     */
    if (this.transformations.doNotEmit) return;

    const finalContent = content ?? (await this.source.readBuffer());
    await fsExtra.outputFile(target, finalContent);
  }

  // if htmlContent, .html
  // if baseName, new basename
  get outputPath() {
    const outputDirPath =
      this.transformations.outputDirPath ??
      path.dirname(this.source.pathRelativeToOrigin);
    const baseName = this.transformations.baseName ?? this.source.basename;
    const extension = this.transformations.htmlContent
      ? ".html"
      : this.source.extension;

    /**
     * TODO:
     * this almost works how I want it to
     * - i get the write basename for the post now
     * - but now i need to collapse the post to the same root level as the directory
     *   that is taking the basename of...
     *
     * ON THE OTHER HAND...
     * - is it maybe more technically correct to leave these as index.html files anyway......
     */

    return path.join(outputDirPath, baseName + extension);
  }

  /**
   * Slug is kind of weird to figure out. Any
   */

  /**
   * Slug is the part of the URL identifier after the basename
   * of the site that identifies this post.
   */
  get slug(): string {
    const outputDirPath =
      this.transformations.outputDirPath ??
      path.dirname(this.source.pathRelativeToOrigin);
    const baseName = this.transformations.baseName ?? this.source.basename;

    const relativePath = [outputDirPath, baseName]
      // We need to filter out when an outputDirPath is empty, aka
      // our file is at the root of its source directory
      .filter((val) => !!val)
      // Always use / for URL paths instead of path.sep
      .join("/");

    // I'm not sure why, but the root directory paths are all
    // prefixed with ./
    //
    // All slugs should be absolute from the origin of the
    // site.
    const absolutePathToWebRoot = "/" + relativePath.replace("./", "");

    /**
     * Html files can have their extension omitted, all other file types
     * should keep their extensions.
     */
    const slugWithExtension =
      absolutePathToWebRoot + (this.isHtml ? "" : this.source.extension);

    return slugWithExtension;
  }
}
