const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the specific check and improve the email logging/catch block
code = code.replace(
  'if (hasCredentials && process.env.SMTP_USER !== "seu-email@gmail.com") {',
  'if (hasCredentials) {'
);

// We should also replace the catch block for the email to have more detailed logging
const catchBlockOld = `  } catch (error: any) {
    console.error("Erro ao enviar email de justificativa:", error.message);
    emailStatus = "error";
    emailError = error.message;
    if (error.responseCode === 535) {
      emailError = "Credenciais inválidas: Por favor certifique-se de usar a 'Senha de Aplicativo' (App Password) da sua Conta do Google se estiver usando o Gmail.";
    }
  }`;

const catchBlockNew = `  } catch (error: any) {
    console.error("[EMAIL DEBUG] Falha no processo de envio do e-mail:", error);
    emailStatus = "error";
    emailError = error.message;
    if (error.responseCode === 535) {
      emailError = "Credenciais inválidas: Verifique se o SMTP_USER está correto e se o SMTP_PASS é uma 'Senha de Aplicativo' (App Password) válida.";
    }
  }`;

code = code.replace(catchBlockOld, catchBlockNew);

fs.writeFileSync('server.ts', code);
console.log("Patched email template and error logging");
