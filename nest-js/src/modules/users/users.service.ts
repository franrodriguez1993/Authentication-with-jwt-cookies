import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users, UsersDocument } from './users.schema';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<UsersDocument>,
  ) {}

  async create(data: CreateUserDto) {
    return (await this.usersModel.create(data)).toObject();
  }

  findAll() {
    return this.usersModel.find({});
  }

  async findById(id: string) {
    return await this.usersModel.findOne({ _id: id }).lean();
  }

  async findByUsername(username: string) {
    return await this.usersModel.findOne({ username }).lean();
  }

  async findByEmail(email: string) {
    return await this.usersModel.findOne({ email }).lean();
  }

  update(id: string, data: UpdateUserDto) {
    return this.usersModel
      .findByIdAndUpdate({ _id: id }, data, { new: true })
      .select('-password');
  }

  remove(id: string) {
    return this.usersModel.deleteOne({ _id: id });
  }
}
