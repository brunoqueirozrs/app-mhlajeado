const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const debugRoute = `
app.get("/api/debug/smtp", async (req, res) => {
  const nodemailer = await import("nodemailer");
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: true,
      debug: true,
    });

    console.log("[SMTP DEBUG] Iniciando verificação...");
    await transporter.verify();
    console.log("[SMTP DEBUG] Conexão bem-sucedida!");
    res.json({
      status: "success",
      message: "Conexão com servidor SMTP realizada com sucesso.",
      config: {
        user: process.env.SMTP_USER ? "Definido" : "Ausente",
        pass: process.env.SMTP_PASS ? "Definido" : "Ausente",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT
      }
    });
  } catch (error: any) {
    console.error("[SMTP DEBUG] Erro na verificação:", error.message);
    res.status(500).json({
      status: "error",
      message: "Falha na conexão com o servidor SMTP",
      error: error.message,
      code: error.code || error.responseCode,
      config: {
        user: process.env.SMTP_USER ? "Definido" : "Ausente",
        pass: process.env.SMTP_PASS ? "Definido" : "Ausente",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT
      }
    });
  }
});
`;

if (!code.includes("/api/debug/smtp")) {
  code = code.replace('app.get("/api/gemini/status"', debugRoute + '\napp.get("/api/gemini/status"');
  fs.writeFileSync('server.ts', code);
  console.log("Added /api/debug/smtp route");
} else {
  console.log("Route already exists");
}
