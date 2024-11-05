import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  HttpStatus,
  NotFoundException,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersDocument } from './users.schema';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './user.dto';
import { ModuleRef } from '@nestjs/core';
import { UtilService } from '../shared/services/util.service';
import JWTService from '../shared/services/jwt.service';
import { Response } from 'express';
import { AuthenticationGuard } from '../shared/guards/authentication.guard';
import { RequestExt } from '../shared/interface/request-ext.interface';
import { TokenHistoryService } from '../token-history/token-history.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private utilService: UtilService;
  private jwtService: JWTService;
  private tokenHistoryService: TokenHistoryService;
  constructor(
    private readonly usersService: UsersService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.utilService = this.moduleRef.get(UtilService, { strict: false });
    this.jwtService = this.moduleRef.get(JWTService, { strict: false });
    this.tokenHistoryService = this.moduleRef.get(TokenHistoryService, {
      strict: false,
    });
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() data: CreateUserDto) {
    // check parameters
    const checkUsername = await this.usersService.findByUsername(data.username);
    const checkEmail = await this.usersService.findByEmail(data.email);
    if (checkUsername || checkEmail)
      throw new BadRequestException('Invalid parameters');

    // hash password
    const hash = await this.utilService.encrypt(data.password);
    data.password = hash;

    // register
    const user: UsersDocument = await this.usersService.create(data);
    delete user.password;

    return { statusCode: HttpStatus.CREATED, result: { user } };
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() data: LoginUserDto, @Res() res: Response) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) throw new BadRequestException('Invalid credentials');

    const comparePass = await this.utilService.compare(
      data.password,
      user.password,
    );
    if (!comparePass) throw new BadRequestException('Invalid credentials');

    delete user.password;

    // generate jwt
    const jwt = this.jwtService.createJWT(user._id.toString());
    const refreshToken = this.jwtService.createRefreshJWT(user._id.toString());

    res.cookie('accessToken', jwt, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await this.tokenHistoryService.saveHistory(
      user._id.toString(),
      await this.utilService.encrypt(refreshToken),
    );
    return res.json({
      statusCode: HttpStatus.OK,
      result: { user },
    });
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Res() response: Response) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return response.json({
      statusCode: HttpStatus.OK,
      message: 'Logout successful',
    });
  }

  @Get('/me')
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Get user by id' })
  async findOne(@Req() req: RequestExt) {
    const userId = req.userId;
    const user = await this.usersService.findById(userId);
    delete user.password;

    return { statusCode: HttpStatus.OK, result: user };
  }

  @Patch('/profile')
  @ApiOperation({ summary: 'Update user' })
  @UseGuards(AuthenticationGuard)
  async update(@Req()req:RequestExt, @Body() dto: UpdateUserDto) {
    const userId = req.userId;
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // check username:
    if (dto.username && dto.username !== user.username) {
      const checkUsername = await this.usersService.findByUsername(
        dto.username,
      );
      if (checkUsername)
        throw new BadRequestException('Username already in use');
    }

    // check email:
    if (dto.email && dto.email !== user.email) {
      const checkEmail = await this.usersService.findByEmail(dto.email);
      if (checkEmail) throw new BadRequestException('Email already in use');
    }

    // check password:
    if (dto.password) {
      dto.password = await this.utilService.encrypt(dto.password);
    }

    const userUpdated = await this.usersService.update(userId, dto);

    return { statusCode: 200, result: { user: userUpdated } };
  }

}
