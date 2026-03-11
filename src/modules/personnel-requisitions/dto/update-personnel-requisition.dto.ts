import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonnelRequisitionDto } from './create-personnel-requisition.dto';

export class UpdatePersonnelRequisitionDto extends PartialType(CreatePersonnelRequisitionDto) {}
