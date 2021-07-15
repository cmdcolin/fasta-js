import { promisify } from "es6-promisify";
import { isNode } from "browser-or-node";

// don't load fs native module if running in the browser
let fsOpen: any;
let fsRead: any;
let fsFStat: any;
let fsReadFile: any;
if (isNode) {
  // eslint-disable-next-line global-require
  const fs = require("fs");
  fsOpen = fs && promisify(fs.open);
  fsRead = fs && promisify(fs.read);
  fsFStat = fs && promisify(fs.fstat);
  fsReadFile = fs && promisify(fs.readFile);
}
export default class LocalFile {
  private position: number;
  private filename: string;
  private fd: any;
  private _stat: any;
  constructor(source: string) {
    this.position = 0;
    this.filename = source;
    this.fd = fsOpen(this.filename, "r");
  }

  async read(buffer: Buffer, offset = 0, length: number, position: number) {
    let readPosition = position;
    if (readPosition === null) {
      readPosition = this.position;
      this.position += length;
    }
    const ret = await fsRead(await this.fd, buffer, offset, length, position);
    if (typeof ret === "object") return ret.bytesRead;
    return ret;
  }

  async readFile() {
    return fsReadFile(this.filename);
  }

  async stat() {
    if (!this._stat) {
      this._stat = await fsFStat(await this.fd);
    }
    return this._stat;
  }
}
