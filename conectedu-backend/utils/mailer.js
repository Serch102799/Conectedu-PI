const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sergio.carrillolome10@gmail.com', 
        pass: 'knpt gopx xbdm lhim' 
        }
});

const enviarCorreo = async (destinatario, asunto, mensajeHTML) => {
    try {
        const info = await transporter.sendMail({
            from: '"CONECTEDU Plataforma" <sergio.carrillolome10@gmail.com>',
            to: destinatario,
            subject: asunto,
            html: mensajeHTML
        });
        console.log(`✉️ Correo enviado a ${destinatario} [ID: ${info.messageId}]`);
    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
    }
};

module.exports = { enviarCorreo };