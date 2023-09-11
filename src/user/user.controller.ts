import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('jwt')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getLoginUser(@CurrentUser() user: User): Omit<User, 'hashedPassword'> {
    return user;
  }

  @Patch()
  updateUser(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ): Promise<Omit<User, 'hashedPassword'>> {
    return this.userService.updateUser(user.id, dto);
  }
}
