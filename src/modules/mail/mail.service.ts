import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PersonnelRequisition } from '../personnel-requisitions/entities/personnel-requisition.entity';
import { NODE_ENV_DEVELOPMENT } from 'src/constants';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private MAIL_USER_APP: string = '';
  private FRONTEND_URL: string = '';
  private CURRENT_ENV: string = '';

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.MAIL_USER_APP = this.configService.getOrThrow<string>('app.mail.user');
    this.FRONTEND_URL =
      this.configService.getOrThrow<string>('app.frontendUrl');
    this.CURRENT_ENV = this.configService.getOrThrow<string>('app.nodeEnv');
  }

  private formatDate(value?: Date): string {
    if (!value) {
      return 'No disponible';
    }

    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(value);
  }

  get emailTest(): string[] {
    let emails: string[] = [];
    if (this.CURRENT_ENV === NODE_ENV_DEVELOPMENT) {
      emails = ['eduardo-266@hotmail.com'];
    }
    return emails;
  }

  async personnelRequisitionCreate(
    emailsToNotify: string[],
    personnelRequisition: PersonnelRequisition,
  ): Promise<void> {
    const emailTest = this.emailTest;
    if (emailTest.length) {
      emailsToNotify = emailTest;
    }

    this.logger.debug(
      `Sending create email to ${emailsToNotify.join(', ')} for personnel requisition ID: ${personnelRequisition.id}`,
    );

    try {
      const baseFrontendUrl = this.FRONTEND_URL.replace(/\/+$/, '');
      const requisitionsUrl =
        `${baseFrontendUrl}/requisicion-de-personal` +
        `?viewId=${personnelRequisition.id}`;

      const mailOptions: ISendMailOptions = {
        to: emailsToNotify,
        from: `"Desarrollo hada (solicitud de personal)" <${this.MAIL_USER_APP}>`,
        subject: `Nueva solicitud de personal creada (ID: ${personnelRequisition.id})`,
        template: 'personnel-requisition-create',
        context: {
          id: personnelRequisition.id,
          requestDate: this.formatDate(personnelRequisition.requestDate),
          createdAt: this.formatDate(personnelRequisition.createdAt),
          areaName: personnelRequisition.area?.name ?? 'No especificada',
          requestingUserName:
            personnelRequisition.requestingUser?.name ?? 'No especificado',
          requestingPositionName:
            personnelRequisition.positionRequestingUser?.name ??
            'No especificado',
          workplaceName:
            personnelRequisition.workplace?.name ?? 'No especificado',
          positionRequiredName:
            personnelRequisition.positionRequired?.name ?? 'No especificado',
          reasonForRequestName:
            personnelRequisition.reasonForRequest?.name ?? 'No especificado',
          numberOfVacancies: personnelRequisition.numberOfVacancies,
          callType: personnelRequisition.isExternal ? 'Externa' : 'Interna',
          observations:
            personnelRequisition.observations?.trim() || 'Sin observaciones',
          requisitionsUrl,
        },
      };

      const mailer = this.mailerService as {
        sendMail: (options: ISendMailOptions) => Promise<unknown>;
      };

      await mailer.sendMail(mailOptions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send create email for personnel requisition ID: ${personnelRequisition.id}. Error: ${errorMessage}`,
      );
    }
  }
}
