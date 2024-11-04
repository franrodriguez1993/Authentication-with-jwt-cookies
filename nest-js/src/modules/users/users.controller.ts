import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersDocument } from './users.schema';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './user.dto';
import { ModuleRef } from '@nestjs/core';
import { UtilService } from '../shared/util.service';

@ApiTags("users")
@Controller('users')
export class UsersController {
  private utilService: UtilService;
  constructor(private readonly usersService: UsersService,  private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    this.utilService = this.moduleRef.get(UtilService,{strict:false} )
  }

  @Post("/register")
  @ApiOperation({ summary: 'Register new user' })
 async register(@Body() data: CreateUserDto) {
  // check parameters
  const checkUsername = await this.usersService.findByUsername(data.username);
  const checkEmail = await this.usersService.findByEmail(data.email);
  if (checkUsername || checkEmail) throw new BadRequestException("Invalid parameters");
    
  // hash password
    const hash = await this.utilService.encrypt(data.password)
    data.password = hash;

  // register
    const user:UsersDocument = await this.usersService.create(data);
    delete user.password;

    return {statusCode:HttpStatus.CREATED, result:{user}};
  }


  @Post("/login")
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() data: LoginUserDto) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) throw new BadRequestException("Invalid credentials");

    const comparePass = await this.utilService.compare(data.password, user.password);
    if (!comparePass) throw new BadRequestException("Invalid credentials");
    
    delete user.password;

    return {statusCode:HttpStatus.OK, result:{user}};
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
 async findOne(@Param('id') id: string) {
    
    const user = await this.usersService.findById(id);
    delete user.password;

    return { statusCode:HttpStatus.OK, result:user};
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException("User not found");
    
    // check username:
    if (dto.username && dto.username !== user.username) {
      const checkUsername = await this.usersService.findByUsername(dto.username);
      if(checkUsername) throw new BadRequestException("Username already in use")
    }
    
    // check email: 
    if (dto.email && dto.email !== user.email) {
      const checkEmail = await this.usersService.findByEmail(dto.email);
      if(checkEmail) throw new BadRequestException("Email already in use")
    }
    
    // check password:
    if (dto.password) {
      dto.password = await this.utilService.encrypt(dto.password);
    }
    
    const userUpdated = await this.usersService.update(id, dto);

    return { statusCode:200, result:{user:userUpdated}};
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
 async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { statusCode:200, result:"User deleted"};
  }
}
