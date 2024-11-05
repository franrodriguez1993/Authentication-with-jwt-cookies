import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UtilService {
  async encrypt(text: string) {
    return await bcrypt.hash(text, 10);
  }

  async compare(text: string, hash: string) {
    return await bcrypt.compare(text, hash);
  }
}
