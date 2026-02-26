import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { orderId, estimateType } = await request.json();

        if (!orderId || !estimateType) {
            return NextResponse.json(
                { error: 'Order ID and estimate type are required' },
                { status: 400 }
            );
        }

        // Get order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                client: true,
                items: true,
            },
        });

        if (!order || !order.client) {
            return NextResponse.json(
                { error: 'Order or client not found' },
                { status: 404 }
            );
        }

        // Check if client has email
        if (!order.client.email) {
            return NextResponse.json(
                { error: 'Client does not have an email address' },
                { status: 400 }
            );
        }

        // Get email settings
        const settings = await prisma.settings.findUnique({
            where: { id: 'default' },
        });

        if (!settings || !settings.emailHost || !settings.emailUser || !settings.emailPassword) {
            return NextResponse.json(
                { error: 'Email settings not configured. Please configure SMTP settings first.' },
                { status: 400 }
            );
        }

        // Calculate totals
        const cleaningTotal = order.items.reduce((sum, item) => sum + (item.cleaningCost || 0), 0);
        const repairTotal = order.items.reduce((sum, item) => sum + (item.repairCost || 0), 0);
        const grandTotal = cleaningTotal + repairTotal;

        // Generate approval link
        const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/approve/${order.id}`;

        // Create email content
        const subject = estimateType === 'cleaning' 
            ? `Cleaning Estimate for Order ${order.id}`
            : `Repair Estimate for Order ${order.id}`;

        const emailBody = `
Dear ${order.client.name},

Thank you for choosing our carpet cleaning service.

${estimateType === 'cleaning' ? 'Your cleaning estimate is ready for review.' : 'Your repair estimate is ready for review.'}

Order ID: ${order.id}
${estimateType === 'cleaning' ? `Cleaning Total: ${cleaningTotal.toFixed(2)} ${settings.currency}` : `Repair Total: ${repairTotal.toFixed(2)} ${settings.currency}`}
${estimateType === 'both' ? `Grand Total: ${grandTotal.toFixed(2)} ${settings.currency}` : ''}

Please review and approve your estimate by clicking the link below:
${approvalLink}

If you have any questions, please don't hesitate to contact us.

Best regards,
CarpetClean Pro Team
        `.trim();

        // Send email using nodemailer
        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransport({
            host: settings.emailHost,
            port: settings.emailPort || 587,
            secure: settings.emailSecure || false,
            auth: {
                user: settings.emailUser,
                pass: settings.emailPassword,
            },
        });

        await transporter.sendMail({
            from: settings.emailFrom || settings.emailUser,
            to: order.client.email,
            subject: subject,
            text: emailBody,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">CarpetClean Pro</h2>
                    <p>Dear ${order.client.name},</p>
                    <p>Thank you for choosing our carpet cleaning service.</p>
                    <p><strong>${estimateType === 'cleaning' ? 'Your cleaning estimate is ready for review.' : 'Your repair estimate is ready for review.'}</strong></p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id}</p>
                        ${estimateType === 'cleaning' ? `<p style="margin: 5px 0;"><strong>Cleaning Total:</strong> ${cleaningTotal.toFixed(2)} ${settings.currency}</p>` : ''}
                        ${estimateType === 'repair' ? `<p style="margin: 5px 0;"><strong>Repair Total:</strong> ${repairTotal.toFixed(2)} ${settings.currency}</p>` : ''}
                        ${estimateType === 'both' ? `<p style="margin: 5px 0;"><strong>Grand Total:</strong> ${grandTotal.toFixed(2)} ${settings.currency}</p>` : ''}
                    </div>
                    
                    <p>Please review and approve your estimate by clicking the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${approvalLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                            Review Estimate
                        </a>
                    </div>
                    
                    <p>Or copy this link: <a href="${approvalLink}">${approvalLink}</a></p>
                    
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br><strong>CarpetClean Pro Team</strong></p>
                </div>
            `,
        });

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
            recipient: order.client.email,
        });
    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { 
                error: 'Failed to send email', 
                details: error.message 
            },
            { status: 500 }
        );
    }
}
