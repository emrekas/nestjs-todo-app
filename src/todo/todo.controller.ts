import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TodoService } from './todo.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('jwt')
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  getTasks(@CurrentUser() user: User): Promise<Task[]> {
    return this.todoService.getTasks(user.id);
  }

  @Get(':id')
  getTaskById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) taskId: number,
  ): Promise<Task | null> {
    return this.todoService.getTaskById(user.id, taskId);
  }

  @Post()
  createTask(
    @CurrentUser() user: User,
    @Body() dto: CreateTaskDto,
  ): Promise<Task> {
    return this.todoService.createTask(user.id, dto);
  }

  @Patch(':id')
  updateTaskById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.todoService.updateTaskById(user.id, taskId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteTaskById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) taskId: number,
  ): Promise<void> {
    return this.todoService.deleteTaskById(user.id, taskId);
  }
}
