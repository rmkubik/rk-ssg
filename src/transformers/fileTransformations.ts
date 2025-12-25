export class FileTransformations {
  htmlContent?: string;

  hasBeenTransformed(): boolean {
    return !!this.htmlContent;
  }
}
