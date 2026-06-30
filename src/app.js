import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import treatmentRoutes from './routes/treatmentRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import swaggerSpec from './config/swagger.js';

const app = express();
app.use(cors());
app.use(express.json());

const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Dental Clinic Management System API</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.32.6/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.32.6/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.32.6/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: '/api-docs.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: 'StandaloneLayout'
        });
      };
    </script>
  </body>
</html>
`;

app.get('/', (req, res) => {
  res.json({
    message: 'Dental clinic API is running'
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});
app.get(["/api-docs", "/api-docs/"], (req, res) => {
  res.type("html").send(swaggerHtml);
});

export default app;
