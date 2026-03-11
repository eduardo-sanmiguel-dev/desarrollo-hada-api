import { PartialType } from '@nestjs/mapped-types';

import { CreateReasonsForRequestDto } from './create-reasons-for-request.dto';

export class UpdateReasonsForRequestDto extends PartialType(
  CreateReasonsForRequestDto,
) {}
