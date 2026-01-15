const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Get PayPal ID
app.get('/api/config/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID);
});

// API: Send Order Notification (Works for Cash OR PayPal)
app.post('/api/notify-owner', async (req, res) => {
    const { customerName, paymentMethod, amount, items } = req.body;

    console.log(`New ${paymentMethod} order from ${customerName}`);

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Create item list for email
    const itemsHtml = items.map(i => 
        `<li style="margin-bottom: 5px;">${i.name} - $${i.price.toFixed(2)}</li>`
    ).join('');

    // Custom subject line based on payment type
    const subject = paymentMethod === 'CASH' 
        ? `🛑 CASH ORDER: Collect $${amount} from ${customerName}`
        : `✅ PAID: New Order from ${customerName} ($${amount})`;

    const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; color: #333;">
            <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin:0;">VortexMart Order</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #eee;">
                <p><strong>Customer Name:</strong> ${customerName}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p><strong>Total Due:</strong> <span style="font-size: 1.2em; font-weight: bold;">$${amount}</span></p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                
                <h3>Items to Deliver:</h3>
                <ul>${itemsHtml}</ul>
                
                ${paymentMethod === 'CASH' 
                    ? `<div style="background: #fff3cd; padding: 10px; border-radius: 5px; color: #856404;">
                        <strong>Action Required:</strong> Find this student, collect the cash, and hand over the items.
                       </div>` 
                    : `<div style="background: #d4edda; padding: 10px; border-radius: 5px; color: #155724;">
                        <strong>Status:</strong> Paid via PayPal. Ready to deliver.
                       </div>`
                }
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.OWNER_EMAIL,
            subject: subject,
            html: htmlContent
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Email failed' });
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server Running on port 3000'));