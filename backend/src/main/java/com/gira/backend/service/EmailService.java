package com.gira.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.dashboard.url:http://localhost:5175}")
    private String dashboardUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a simple text email with the OTP code.
     */
    public void sendOtpEmail(String to, String otp) throws MailException {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("GIRA - Your OTP Verification Code");
            message.setText("Hello,\n\nYour OTP for GIRA registration is: " + otp + "\n\n" +
                    "This code will expire in 10 minutes.\n\n" +
                    "Thanks,\nGIRA Team");

            mailSender.send(message);
            log.info("OTP email successfully sent to {}", to);
        } catch (MailException ex) {
            log.error("Failed to send OTP email to {}: {}. FALLING BACK TO MOCK (OTP: {})", to, ex.getMessage(), otp);
            System.out.println(">>> MOCK EMAIL SENT TO " + to + ". OTP CODE IS: [" + otp + "]");
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error sending OTP email to {}: {}. FALLING BACK TO MOCK (OTP: {})", to, ex.getMessage(), otp);
            System.out.println(">>> MOCK EMAIL SENT TO " + to + ". OTP CODE IS: [" + otp + "]");
            throw new RuntimeException("Unexpected error sending mail", ex); // Or rethrow as MailException implementation
        }
    }

    /**
     * Sends the password reset link via email.
     */
    public void sendPasswordResetEmail(String to, String resetLink) throws MailException {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("GIRA - Password Reset Request");
            message.setText("Hello,\n\nWe received a request to reset your password.\n\n" +
                    "Click the link below to set a new password:\n" + resetLink + "\n\n" +
                    "This link will expire in 10 minutes.\nIf you did not request a password reset, you can safely ignore this email.\n\n" +
                    "Thanks,\nGIRA Team");
            mailSender.send(message);
            log.info("Password reset email successfully sent to {}", to);
        } catch (MailException ex) {
            log.error("Failed to send password reset email to {}: {}. FALLING BACK TO MOCK (Link: {})", to, ex.getMessage(), resetLink);
            System.out.println(">>> MOCK EMAIL SENT TO " + to + ". RESET LINK IS: [" + resetLink + "]");
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error sending password reset email to {}: {}. FALLING BACK TO MOCK (Link: {})", to, ex.getMessage(), resetLink);
            System.out.println(">>> MOCK EMAIL SENT TO " + to + ". RESET LINK IS: [" + resetLink + "]");
            throw new RuntimeException("Unexpected error sending password reset mail", ex); 
        }
    }
    /**
     * Sends a professional HTML email notification when a ticket is assigned to a provider.
     */
    public void sendTicketAssignmentNotification(String providerEmail, String ticketNumber, String ticketTitle,
                                                 String ticketDescription, String priority, String deadline,
                                                 String managerName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(providerEmail);
            helper.setSubject("New Ticket Assigned: [" + ticketNumber + "] " + ticketTitle);

            String escapedTitle = HtmlUtils.htmlEscape(ticketTitle);
            String escapedDescription = HtmlUtils.htmlEscape(ticketDescription);
            String escapedManager = HtmlUtils.htmlEscape(managerName);
            String escapedDeadline = (deadline != null && !deadline.isBlank()) ? HtmlUtils.htmlEscape(deadline) : "Check dashboard";
            String priorityUpper = priority.toUpperCase();

            String badgeColor;
            String borderColor;
            switch (priorityUpper) {
                case "CRITICAL" -> {
                    badgeColor = "#d32f2f";
                    borderColor = "#d32f2f";
                }
                case "HIGH" -> {
                    badgeColor = "#f57c00";
                    borderColor = "#f57c00";
                }
                case "MEDIUM" -> {
                    badgeColor = "#fbc02d";
                    borderColor = "#fbc02d";
                }
                case "LOW" -> {
                    badgeColor = "#388e3c";
                    borderColor = "#388e3c";
                }
                default -> {
                    badgeColor = "#757575";
                    borderColor = "#e0e0e0";
                }
            }


            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                        .content { padding: 30px 25px; background-color: #ffffff; }
                        .ticket-box { border-left: 5px solid %s; padding: 20px; background-color: #fcfcfc; border-radius: 4px; margin: 20px 0; border: 1px solid #f0f0f0; border-left: 5px solid %s; }
                        .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
                        .value { margin-bottom: 15px; font-size: 16px; color: #222; }
                        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; background-color: %s; text-transform: uppercase; }
                        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>New Ticket Assigned</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>A new ticket has been assigned to you by <strong>%s</strong>. Please review the details below:</p>
                            
                            <div class="ticket-box">
                                <div class="label">Ticket ID</div>
                                <div class="value"><strong>%s</strong></div>
                                
                                <div class="label">Title</div>
                                <div class="value">%s</div>
                                
                                <div class="label">Priority</div>
                                <div class="value"><span class="priority-badge">%s</span></div>
                                
                                <div class="label">Deadline</div>
                                <div class="value">%s</div>
                                
                                <div class="label">Description</div>
                                <div class="value" style="white-space: pre-wrap;">%s</div>
                            </div>
                        </div>
                        <div class="footer">
                            &copy; 2025 GIRA IT Service Helpdesk. All rights reserved.<br>
                            This is an automated notification, please do not reply to this email.
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(borderColor, borderColor, badgeColor, escapedManager, ticketNumber, escapedTitle, priorityUpper, escapedDeadline, escapedDescription);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Ticket assignment notification sent to {}", providerEmail);

        } catch (MessagingException | MailException ex) {
            log.error("Failed to send ticket assignment email to {}: {}. FALLING BACK TO MOCK.", providerEmail, ex.getMessage());
            System.out.println(">>> MOCK EMAIL SENT TO " + providerEmail + " FOR TICKET [" + ticketNumber + "]");
        } catch (Exception ex) {
            log.error("Unexpected error sending ticket assignment email to {}: {}", providerEmail, ex.getMessage());
        }
    }

    /**
     * Sends a completion summary email to the worker when a ticket is resolved.
     */
    public void sendCompletionSummaryEmail(String workerEmail, String ticketNumber, String ticketTitle, String summary) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(workerEmail);
            helper.setSubject("Ticket Resolved: [" + ticketNumber + "] " + ticketTitle);

            String escapedTitle = HtmlUtils.htmlEscape(ticketTitle);
            String escapedSummary = HtmlUtils.htmlEscape(summary);

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                        .header { background: linear-gradient(135deg, #388e3c 0%, #4caf50 100%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                        .content { padding: 30px 25px; background-color: #ffffff; }
                        .summary-box { padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 5px solid #4caf50; margin: 20px 0; }
                        .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
                        .value { margin-bottom: 15px; font-size: 16px; color: #222; }
                        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Ticket Resolved</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>Great news! Your ticket <strong>%s</strong> has been marked as resolved. Here is the completion summary from the solver:</p>
                            
                            <div class="summary-box">
                                <div class="label">Ticket Title</div>
                                <div class="value">%s</div>
                                
                                <div class="label">Resolution Summary</div>
                                <div style="white-space: pre-wrap;">%s</div>
                            </div>
                            
                            <p>If you have any further questions or if the issue persists, please feel free to raise a new ticket or contact support.</p>
                        </div>
                        <div class="footer">
                            &copy; 2025 GIRA IT Service Helpdesk. All rights reserved.<br>
                            This is an automated notification, please do not reply to this email.
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(ticketNumber, escapedTitle, escapedSummary);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Completion summary email sent to {}", workerEmail);

        } catch (Exception ex) {
            log.error("Failed to send completion summary email to {}: {}", workerEmail, ex.getMessage());
        }
    }

    /**
     * Sends a custom email with a professional Gmail-like theme.
     */
    public void sendCustomEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);

            String escapedBody = HtmlUtils.htmlEscape(body).replace("\n", "<br>");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #202124; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .gmail-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; }
                        .gmail-header { background-color: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #e0e0e0; }
                        .gmail-header h2 { margin: 0; font-size: 18px; color: #3c4043; font-weight: 500; }
                        .gmail-body { padding: 30px 40px; min-height: 200px; font-size: 15px; }
                        .gmail-footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #70757a; font-size: 12px; border-top: 1px solid #e0e0e0; }
                        .btn-outline { display: inline-block; padding: 8px 16px; border: 1px solid #dadce0; border-radius: 4px; color: #1a73e8; text-decoration: none; font-weight: 500; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="gmail-container">
                        <div class="gmail-header">
                            <h2>GIRA Message</h2>
                        </div>
                        <div class="gmail-body">
                            %s
                            <br><br>
                            <a href="%s" class="btn-outline">Open Dashboard</a>
                        </div>
                        <div class="gmail-footer">
                            &copy; 2025 GIRA Service Desk. All rights reserved.<br>
                            Sent from GIRA Automated System
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(escapedBody, dashboardUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Custom email sent to {}", to);

        } catch (Exception ex) {
            log.error("Failed to send custom email to {}: {}", to, ex.getMessage());
        }
    }
}
