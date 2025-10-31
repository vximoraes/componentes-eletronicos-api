import nodemailer from 'nodemailer';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            console.warn('Variáveis de ambiente EMAIL_USER e EMAIL_APP_PASSWORD não configuradas. Serviço de e-mail não estará disponível.');
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD
                }
            });
            console.log('✓ Serviço de e-mail inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar serviço de e-mail:', error);
        }
    }

    async enviarEmail(to, subject, text, html = null) {
        if (!this.transporter) {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'emailServiceUnavailable',
                field: 'Email',
                details: [],
                customMessage: 'Serviço de e-mail não está configurado.'
            });
        }

        const mailOptions = {
            from: `"${process.env.COMPANY_NAME || 'Sistema de Componentes Eletrônicos'}" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html || text
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('E-mail enviado com sucesso:', info.response);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'emailSendError',
                field: 'Email',
                details: [],
                customMessage: 'Erro ao enviar e-mail. Tente novamente mais tarde.'
            });
        }
    }

    async enviarEmailConvite(nome, email, token) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const activationUrl = `${frontendUrl}/ativar-conta?token=${token}`;
        
        const subject = 'Convite para criar sua conta';
        
        const text = `
Olá ${nome},

Você foi convidado a fazer parte do Sistema de Gerenciamento de Componentes Eletrônicos!

Para criar sua conta, clique no link abaixo e defina sua senha:
${activationUrl}

Este link é válido por apenas 5 minutos.

Se você não solicitou este convite, por favor ignore este e-mail.

Atenciosamente,
Equipe ${process.env.COMPANY_NAME || 'Sistema de Componentes Eletrônicos'}
        `.trim();

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #306FCC;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            margin: 20px 0;
            background-color: #306FCC;
            color: #1a202c !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .button span {
            color: #1a202c !important;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <h1>Bem-vindo(a)!</h1>
            <p>Olá <strong>${nome}</strong>,</p>
            <p>Você foi convidado a fazer parte do <strong>Sistema de Gerenciamento de Componentes Eletrônicos</strong>!</p>
            <p>Para criar sua conta, clique no botão abaixo e defina sua senha:</p>
            <a href="${activationUrl}" class="button"><span>Criar Minha Conta</span></a>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #306FCC;">${activationUrl}</p>
            <div class="footer">
                <p><strong>Este link é válido por apenas 5 minutos.</strong></p>
                <p>Se você não solicitou este convite, por favor ignore este e-mail.</p>
                <p>Atenciosamente,<br>Equipe ${process.env.COMPANY_NAME || 'Sistema de Componentes Eletrônicos'}</p>
            </div>
        </div>
    </div>
</body>
</html>
        `.trim();

        return await this.enviarEmail(email, subject, text, html);
    }
}

export default new EmailService();
