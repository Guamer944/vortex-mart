const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load settings
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. CLEAN UP SECRETS (Fix spaces in password automatically)
const cleanPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';
const cleanClientId = process.env.PAYPAL_CLIENT_ID ? process.env.PAYPAL_CLIENT_ID.trim() : '';

// API: Get PayPal ID
app.get('/api/config/paypal', (req, res) => {
    if (!cleanClientId || cleanClientId.length < 10) {
        console.error("❌ ERROR: PayPal Client ID is missing or invalid in .env");
        return res.status(500).send("Configuration Error");
    }
    res.send(cleanClientId);
});

// API: Send Email
app.post('/api/notify-owner', async (req, res) => {
    const { customerName, paymentMethod, amount, items } = req.body;

    console.log(`📩 Processing order for: ${customerName} (${paymentMethod})`);

    // Check credentials
    if (!process.env.EMAIL_USER || !cleanPass) {
        console.error("❌ ERROR: Email User or Password missing in .env");
        return res.status(500).json({ error: "Server config missing" });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: cleanPass
        }
    });

    // Email Content
    const isCash = paymentMethod === 'CASH';
    const subject = isCash 
        ? `💵 CASH ORDER: Collect $${amount} from ${customerName}` 
        : `✅ PAID: New Order from ${customerName} ($${amount})`;

    const itemsHtml = items.map(i => `<li>${i.name} - $${i.price.toFixed(2)}</li>`).join('');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.OWNER_EMAIL,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: ${isCash ? '#d35400' : '#27ae60'};">
                    ${isCash ? 'Action Required: Collect Cash' : 'Order Paid Online'}
                </h2>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Total:</strong> $${amount}</p>
                <hr>
                <h3>Items:</h3>
                <ul>${itemsHtml}</ul>
                <p style="font-size:0.9em; color:#777;">VortexMart Automated System</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ SUCCESS: Email sent to " + process.env.OWNER_EMAIL);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("❌ EMAIL FAILED. Exact error below:");
        console.error(error.message); 
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));