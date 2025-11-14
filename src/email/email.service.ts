import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configuration Gmail avec mot de passe d'application
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER') || 'madutech@gmail.com',
        pass: this.configService.get<string>('EMAIL_PASSWORD'), // Mot de passe d'application 
      },
    });

    // Vérifier la configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Erreur de configuration email:', error);
      } else {
        this.logger.log('✅ Configuration email réussie');
      }
    });
  }

  /**
   * Envoie un email de confirmation de commande
   */
  async sendOrderConfirmation(order: Order, userEmail: string, userName?: string): Promise<void> {
    try {
      const orderDate = new Date(order.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Formatage de l'adresse de livraison
      const shippingAddress = order.shipping_address;
      const addressLines = [
        shippingAddress?.street || '',
        shippingAddress?.city || '',
        shippingAddress?.postal_code || '',
        shippingAddress?.country || '',
      ].filter(Boolean).join(', ');

      // Formatage des articles
      const itemsHtml = Array.isArray(order.items)
        ? order.items
            .map(
              (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.name || item.product_name || 'Produit'} 
            ${item.quantity ? `x${item.quantity}` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            ${(item.price || item.total || 0).toFixed(2)} €
          </td>
        </tr>
      `,
            )
            .join('')
        : '<tr><td colspan="2">Aucun article</td></tr>';

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .order-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .total { font-weight: bold; font-size: 18px; color: #4CAF50; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Confirmation de Commande</h1>
    </div>
    <div class="content">
      <p>Bonjour ${userName || 'Cher client'},</p>
      
      <p>Nous avons bien reçu votre commande et nous vous en remercions !</p>
      
      <div class="order-info">
        <h2>Détails de la commande</h2>
        <p><strong>Numéro de commande:</strong> ${order.order_number}</p>
        <p><strong>Date:</strong> ${orderDate}</p>
        <p><strong>Statut:</strong> ${this.getStatusLabel(order.status)}</p>
        <p><strong>Méthode de paiement:</strong> ${this.getPaymentMethodLabel(order.payment_method)}</p>
        <p><strong>Statut du paiement:</strong> ${this.getPaymentStatusLabel(order.payment_status)}</p>
      </div>

      <div class="order-info">
        <h3>Articles commandés</h3>
        <table>
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 10px; text-align: left;">Article</th>
              <th style="padding: 10px; text-align: right;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #4CAF50;">
          <p style="text-align: right; margin: 5px 0;">
            <strong>Sous-total:</strong> ${order.subtotal.toFixed(2)} €
          </p>
          ${order.discount > 0 ? `<p style="text-align: right; margin: 5px 0;"><strong>Remise:</strong> -${order.discount.toFixed(2)} €</p>` : ''}
          ${order.tax > 0 ? `<p style="text-align: right; margin: 5px 0;"><strong>TVA:</strong> ${order.tax.toFixed(2)} €</p>` : ''}
          ${order.shipping > 0 ? `<p style="text-align: right; margin: 5px 0;"><strong>Livraison:</strong> ${order.shipping.toFixed(2)} €</p>` : ''}
          <p style="text-align: right; margin: 15px 0;" class="total">
            <strong>Total:</strong> ${order.total.toFixed(2)} €
          </p>
        </div>
      </div>

      <div class="order-info">
        <h3>Adresse de livraison</h3>
        <p>${addressLines || 'Non spécifiée'}</p>
      </div>

      <p>Nous vous tiendrons informé de l'avancement de votre commande.</p>
      
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      
      <p>Cordialement,<br>L'équipe JAAYMA</p>
    </div>
    
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
      `;

      const textContent = `
Confirmation de Commande

Bonjour ${userName || 'Cher client'},

Nous avons bien reçu votre commande et nous vous en remercions !

Détails de la commande:
- Numéro de commande: ${order.order_number}
- Date: ${orderDate}
- Statut: ${this.getStatusLabel(order.status)}
- Méthode de paiement: ${this.getPaymentMethodLabel(order.payment_method)}
- Statut du paiement: ${this.getPaymentStatusLabel(order.payment_status)}

Articles commandés:
${Array.isArray(order.items) ? order.items.map((item: any) => `- ${item.name || item.product_name || 'Produit'} ${item.quantity ? `x${item.quantity}` : ''}: ${(item.price || item.total || 0).toFixed(2)} €`).join('\n') : 'Aucun article'}

Total: ${order.total.toFixed(2)} €

Adresse de livraison: ${addressLines || 'Non spécifiée'}

Nous vous tiendrons informé de l'avancement de votre commande.

Cordialement,
L'équipe JAAYMA
      `;

      const mailOptions = {
        from: `"JAAYMA" <${this.configService.get<string>('EMAIL_USER') || 'madutech@gmail.com'}>`,
        to: userEmail,
        subject: `Confirmation de commande - ${order.order_number}`,
        text: textContent,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de confirmation envoyé à ${userEmail} pour la commande ${order.order_number}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de confirmation:`, error);
      // Ne pas faire échouer la création de commande si l'email échoue
      throw error;
    }
  }

  /**
   * Envoie un email de notification de changement de statut de commande
   */
  async sendOrderStatusUpdate(
    order: Order,
    userEmail: string,
    userName?: string,
    oldStatus?: string,
  ): Promise<void> {
    try {
      const statusLabel = this.getStatusLabel(order.status);
      const oldStatusLabel = oldStatus ? this.getStatusLabel(oldStatus) : null;

      // Couleur selon le statut
      const statusColors: { [key: string]: string } = {
        pending: '#FF9800',
        processing: '#2196F3',
        shipped: '#9C27B0',
        delivered: '#4CAF50',
        cancelled: '#F44336',
        refunded: '#607D8B',
      };

      const statusColor = statusColors[order.status] || '#333';

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .status-box { background-color: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid ${statusColor}; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .status-badge { display: inline-block; padding: 8px 16px; background-color: ${statusColor}; color: white; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Mise à jour de votre commande</h1>
    </div>
    <div class="content">
      <p>Bonjour ${userName || 'Cher client'},</p>
      
      <p>Nous vous informons que le statut de votre commande a été mis à jour.</p>
      
      <div class="status-box">
        <h2>Détails de la commande</h2>
        <p><strong>Numéro de commande:</strong> ${order.order_number}</p>
        ${oldStatusLabel ? `<p><strong>Ancien statut:</strong> ${oldStatusLabel}</p>` : ''}
        <p><strong>Nouveau statut:</strong> <span class="status-badge">${statusLabel}</span></p>
        ${order.tracking_number ? `<p><strong>Numéro de suivi:</strong> ${order.tracking_number}</p>` : ''}
      </div>

      ${order.status === 'shipped' ? `
      <div class="status-box">
        <h3>🚚 Votre commande a été expédiée !</h3>
        <p>Votre commande est en route. Vous recevrez bientôt votre colis.</p>
        ${order.tracking_number ? `<p>Vous pouvez suivre votre colis avec le numéro de suivi: <strong>${order.tracking_number}</strong></p>` : ''}
      </div>
      ` : ''}

      ${order.status === 'delivered' ? `
      <div class="status-box">
        <h3>✅ Votre commande a été livrée !</h3>
        <p>Nous espérons que vous êtes satisfait de votre achat. N'hésitez pas à nous laisser un avis !</p>
      </div>
      ` : ''}

      ${order.status === 'cancelled' ? `
      <div class="status-box">
        <h3>❌ Commande annulée</h3>
        <p>Votre commande a été annulée. Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      </div>
      ` : ''}

      <p>Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.</p>
      
      <p>Cordialement,<br>L'équipe JAAYMA</p>
    </div>
    
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
      `;

      const textContent = `
Mise à jour de votre commande

Bonjour ${userName || 'Cher client'},

Nous vous informons que le statut de votre commande a été mis à jour.

Numéro de commande: ${order.order_number}
${oldStatusLabel ? `Ancien statut: ${oldStatusLabel}\n` : ''}Nouveau statut: ${statusLabel}
${order.tracking_number ? `Numéro de suivi: ${order.tracking_number}\n` : ''}

Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.

Cordialement,
L'équipe JAAYMA
      `;

      const mailOptions = {
        from: `"JAAYMA" <${this.configService.get<string>('EMAIL_USER') || 'madutech@gmail.com'}>`,
        to: userEmail,
        subject: `Mise à jour de commande - ${order.order_number} : ${statusLabel}`,
        text: textContent,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de mise à jour de statut envoyé à ${userEmail} pour la commande ${order.order_number}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de mise à jour de statut:`, error);
      throw error;
    }
  }

  /**
   * Envoie un email de notification de changement de statut de paiement
   */
  async sendPaymentStatusUpdate(
    order: Order,
    userEmail: string,
    userName?: string,
    oldPaymentStatus?: string,
  ): Promise<void> {
    try {
      const paymentStatusLabel = this.getPaymentStatusLabel(order.payment_status);
      const oldPaymentStatusLabel = oldPaymentStatus ? this.getPaymentStatusLabel(oldPaymentStatus) : null;

      // Couleur selon le statut de paiement
      const paymentColors: { [key: string]: string } = {
        pending: '#FF9800',
        paid: '#4CAF50',
        failed: '#F44336',
        refunded: '#607D8B',
      };

      const paymentColor = paymentColors[order.payment_status] || '#333';

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${paymentColor}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .payment-box { background-color: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid ${paymentColor}; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .status-badge { display: inline-block; padding: 8px 16px; background-color: ${paymentColor}; color: white; border-radius: 4px; font-weight: bold; }
    .amount { font-size: 24px; font-weight: bold; color: ${paymentColor}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💳 Mise à jour du paiement</h1>
    </div>
    <div class="content">
      <p>Bonjour ${userName || 'Cher client'},</p>
      
      <p>Nous vous informons que le statut du paiement de votre commande a été mis à jour.</p>
      
      <div class="payment-box">
        <h2>Détails de la commande</h2>
        <p><strong>Numéro de commande:</strong> ${order.order_number}</p>
        <p><strong>Montant:</strong> <span class="amount">${order.total.toFixed(2)} €</span></p>
        ${oldPaymentStatusLabel ? `<p><strong>Ancien statut:</strong> ${oldPaymentStatusLabel}</p>` : ''}
        <p><strong>Nouveau statut:</strong> <span class="status-badge">${paymentStatusLabel}</span></p>
        <p><strong>Méthode de paiement:</strong> ${this.getPaymentMethodLabel(order.payment_method)}</p>
      </div>

      ${order.payment_status === 'paid' ? `
      <div class="payment-box">
        <h3>✅ Paiement confirmé</h3>
        <p>Votre paiement a été confirmé avec succès. Votre commande est en cours de traitement.</p>
      </div>
      ` : ''}

      ${order.payment_status === 'failed' ? `
      <div class="payment-box">
        <h3>❌ Échec du paiement</h3>
        <p>Le paiement de votre commande a échoué. Veuillez vérifier vos informations de paiement ou contacter votre banque.</p>
        <p>Si le problème persiste, n'hésitez pas à nous contacter pour obtenir de l'aide.</p>
      </div>
      ` : ''}

      ${order.payment_status === 'refunded' ? `
      <div class="payment-box">
        <h3>💰 Remboursement effectué</h3>
        <p>Votre remboursement a été effectué. Le montant devrait apparaître sur votre compte dans les prochains jours.</p>
      </div>
      ` : ''}

      <p>Si vous avez des questions concernant votre paiement, n'hésitez pas à nous contacter.</p>
      
      <p>Cordialement,<br>L'équipe JAAYMA</p>
    </div>
    
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
      `;

      const textContent = `
Mise à jour du paiement

Bonjour ${userName || 'Cher client'},

Nous vous informons que le statut du paiement de votre commande a été mis à jour.

Numéro de commande: ${order.order_number}
Montant: ${order.total.toFixed(2)} €
${oldPaymentStatusLabel ? `Ancien statut: ${oldPaymentStatusLabel}\n` : ''}Nouveau statut: ${paymentStatusLabel}
Méthode de paiement: ${this.getPaymentMethodLabel(order.payment_method)}

Si vous avez des questions concernant votre paiement, n'hésitez pas à nous contacter.

Cordialement,
L'équipe JAAYMA
      `;

      const mailOptions = {
        from: `"JAAYMA" <${this.configService.get<string>('EMAIL_USER') || 'madutech@gmail.com'}>`,
        to: userEmail,
        subject: `Mise à jour du paiement - ${order.order_number} : ${paymentStatusLabel}`,
        text: textContent,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de mise à jour de paiement envoyé à ${userEmail} pour la commande ${order.order_number}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de mise à jour de paiement:`, error);
      throw error;
    }
  }

  /**
   * Envoie un email générique
   */
  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"JAAYMA" <${this.configService.get<string>('EMAIL_USER') || 'madutech@gmail.com'}>`,
        to,
        subject,
        text: text || html.replace(/<[^>]*>/g, ''),
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email envoyé à ${to}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email:`, error);
      throw error;
    }
  }

  private getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
    };
    return labels[status] || status;
  }

  private getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      paid: 'Payé',
      failed: 'Échoué',
      refunded: 'Remboursé',
    };
    return labels[status] || status;
  }

  private getPaymentMethodLabel(method?: string): string {
    if (!method) return 'Non spécifiée';
    const labels: { [key: string]: string } = {
      cash_on_delivery: 'Paiement à la livraison',
      'Paiement à la livraison': 'Paiement à la livraison',
      card: 'Carte bancaire',
      paypal: 'PayPal',
      bank_transfer: 'Virement bancaire',
    };
    return labels[method] || method;
  }
}

