import { PartialType } from '@nestjs/mapped-types';
import { CreateUserCommentDto } from './create-user-comment.dto';

export class UpdateUserCommentDto extends PartialType(CreateUserCommentDto) {}
