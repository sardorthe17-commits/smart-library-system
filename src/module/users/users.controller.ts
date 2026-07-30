import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  Post,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { UserService } from './users.service';
import { Users } from './model/users.model';
import type { Request, Response } from 'express';
import type { RequestWithUser } from '../../common/guards/role.guard';
import { Protected } from '../../common/guards/protected.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateUserDto } from './dto/users-update';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async getAll(@Query('search') search?: string) {
    return this.userService.getAll(search);
  }
  @Post('profile/update')
  @Protected()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads/users',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `user-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.id;
      const updateData: any = { fullName: dto.fullName };

      if (file) {
        updateData.image_url = file.filename;
      }

      const updatedUser = await this.userService.update(userId, updateData);

      req.user.fullName = updatedUser.fullName;
      if (updatedUser.image_url) {
        req.user.image_url = updatedUser.image_url;
      }

      return res.redirect('/profile?message=Profil muvaffaqiyatli yangilandi!');
    } catch (err: any) {
      return res.redirect(`/profile?error=${err.message || 'Yangilashda xatolik!'}`);
    }
  }
  @Get('activate')
  async activate(@Query('token') token: string,@Res() res: Response) {
    return this.userService.activate(token, res);
  }
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.userService.getOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Users>
  ) {
    return this.userService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    return this.userService.delete(id, res);
  }

}