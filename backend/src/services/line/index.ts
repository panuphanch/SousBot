import { Client, WebhookEvent, MessageEvent, FollowEvent, QuickReply } from '@line/bot-sdk';
import { UserRepository, ProductRepository, OrderRepository } from '../../repositories/firebase';
import { User } from '../../types';
import * as process from 'process';
import { logError, logInfo } from '../../utils/logger';
import { log } from 'console';

enum CommandType {
  HOME = '🏠 หน้าหลัก',
  MENU = '🍰 จัดการเมนู',
  ORDER = '📝 จัดการออเดอร์',
  DAILY_SUMMARY = '📊 สรุปยอดวันนี้',
  STOCK = '📦 ดูสต็อกคงเหลือ',
  TODAY_ORDERS = '📅 ดูออเดอร์วันนี้',
  WEEKLY_SUMMARY = '📈 สรุปยอดสัปดาห์นี้',
  MONTHLY_SUMMARY = '📋 สรุปยอดเดือนนี้'
}

export class LineService {
  private client: Client;
  private userRepo: UserRepository;
  private productRepo: ProductRepository;
  private orderRepo: OrderRepository;

  constructor(config: any) {
    this.client = new Client(config);
    this.userRepo = new UserRepository();
    this.productRepo = new ProductRepository();
    this.orderRepo = new OrderRepository();
  }

  // Main webhook handler - similar to ASP.NET controller action
  async handleWebhook(events: WebhookEvent[]): Promise<void> {
    if (!Array.isArray(events)) {
      logError('Invalid events payload:', {
        events: events
      });
      throw new Error('Invalid events payload');
    }
    
    // Process events in parallel like Task.WhenAll
    await Promise.all(
      events.map(async (event) => {
        try {
          if (event.type === 'message') {
            await this.handleMessage(event);
          } else if (event.type === 'follow') {
            await this.handleFollow(event.replyToken);
          }
        } catch (error) {
          logError('Error handling event:', {
            error: error
          });
          // Send friendly error message
          if ('replyToken' in event) {
            await this.client.replyMessage(event.replyToken, {
              type: 'text',
              text: 'ขออภัยเจ้า มีข้อผิดพลาดเกิดขึ้น ลองใหม่อีกครั้งเน้อเจ้า'
            });
          }
        }
      })
    );
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    logInfo('Received message:', {
      event: event
    });
    if (event.message.type !== 'text') return;

    const userId = event.source.userId;
    if (!userId) return;

    const text = event.message.text.trim();
    
    // Check if user exists, similar to Entity Framework's FirstOrDefault
    const user = await this.userRepo.getByLineUserId(userId);
    
    // If user not registered, send them to LIFF registration page
    if (!user) {
      await this.handleFollow(event.replyToken);
      return;
    }

    // Main command handler - similar to C# switch expression
    if (text === 'สมพร') {
      await this.sendMainMenu(event.replyToken, userId);
    } else if (Object.values(CommandType).includes(text as CommandType)) {
      await this.handleCommand(text as CommandType, event.replyToken, user);
    } else {
      await this.handleFreeTextInput(text, event.replyToken, user);
    }
  }

  private async handleFollow(replyToken: string): Promise<void> {
    const liffUrl = `${process.env.LIFF_URL}/register`;
      await this.client.replyMessage(replyToken, {
        type: 'flex',
        altText: 'ลงทะเบียนร้านค้า',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'สวัสดีเจ้า ยินดีต้อนรับสู่สมพร',
                weight: 'bold',
                size: 'xl'
              },
              {
                type: 'text',
                text: 'กรุณาลงทะเบียนร้านค้าก่อนเริ่มใช้งานเน้อเจ้า',
                margin: 'md'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                style: 'primary',
                action: {
                  type: 'uri',
                  label: 'ลงทะเบียนร้านค้า',
                  uri: liffUrl
                }
              }
            ]
          }
        }
      });
  }
  
  private async sendMainMenu(replyToken: string, userId: string): Promise<void> {
    logInfo('Preparing Quick Reply Items:', {
      replyToken: replyToken,
      userId: userId
    });
    // Create QuickReply items based on CommandType
    const quickReplyItems = [];
    
    // Add URI actions for HOME, MENU, ORDER
    const homeUrl = `${process.env.LIFF_URL}/${userId}`;
    const menuUrl = `${process.env.LIFF_URL}/menu-management/${userId}`;
    const orderUrl = `${process.env.LIFF_URL}/order-management/${userId}`;
    
    // Add HOME button with URI action
    quickReplyItems.push({
      type: "action" as const,
      action: {
        type: "uri" as const,
        label: CommandType.HOME,
        uri: homeUrl
      }
    });
    
    // Add MENU button with URI action
    quickReplyItems.push({
      type: "action" as const,
      action: {
        type: "uri" as const,
        label: CommandType.MENU,
        uri: menuUrl
      }
    });
    
    // Add ORDER button with URI action
    quickReplyItems.push({
      type: "action" as const,
      action: {
        type: "uri" as const,
        label: CommandType.ORDER,
        uri: orderUrl
      }
    });
    
    // Add remaining command buttons with message actions
    [
      CommandType.DAILY_SUMMARY,
      CommandType.STOCK,
      CommandType.TODAY_ORDERS,
      CommandType.WEEKLY_SUMMARY,
      CommandType.MONTHLY_SUMMARY
    ].forEach(command => {
      quickReplyItems.push({
        type: "action" as const,
        action: {
          type: "message" as const,
          label: command,
          text: command
        }
      });
    });

    const quickReply: QuickReply = {
      items: quickReplyItems
    };

    logInfo('Quick Reply Items:', {
      quickReply: quickReply
    });
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: 'สมพรมาแล้วเจ้า! มาจัดการร้านเบเกอรี่กันเน้อ 🧁',
      quickReply
    });
  }

  private async handleCommand(command: CommandType, replyToken: string, user: User): Promise<void> {
    switch (command) {      
      case CommandType.DAILY_SUMMARY:
        await this.sendDailySummary(replyToken, user);
        break;
      
      case CommandType.STOCK:
        await this.sendStockStatus(replyToken, user);
        break;

      // Add other command handlers
      default:
        await this.client.replyMessage(replyToken, {
          type: 'text',
          text: 'ขออภัยเจ้า คำสั่งนี้ยังไม่เปิดให้ใช้งานเน้อ จะพัฒนาเร็วๆ นี้เจ้า'
        });
        break;
    }
  }

  private async sendDailySummary(replyToken: string, user: User): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orders = await this.orderRepo.getTodayOrders(user.lineUserId);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Format the currency with Thai Baht
    const formattedRevenue = new Intl.NumberFormat('th-TH', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(totalRevenue);

    const message = `📊 สรุปยอดวันนี้เจ้า\n\n` +
      `จำนวนออเดอร์: ${totalOrders}\n` +
      `ยอดขายรวม: ${formattedRevenue} บาท`;

    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: message
    });
  }

  private async sendStockStatus(replyToken: string, user: User): Promise<void> {
    const products = await this.productRepo.getByOwner(user.lineUserId);
    
    // Filter to show only available products and sort by stock level (lowest first)
    const stockStatus = products
      .filter(p => p.isAvailable)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .map(p => {
        const stockEmoji = p.stockQuantity === 0 ? '❌' : 
                          p.stockQuantity < 5 ? '⚠️' : '✅';
        return `${stockEmoji} ${p.name}: ${p.stockQuantity} ชิ้น`;
      })
      .join('\n');

    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: `📦 สต็อกคงเหลือเจ้า\n\n${stockStatus}`
    });
  }

  private async handleFreeTextInput(text: string, replyToken: string, user: User): Promise<void> {
    // Convert text to lowercase for easier matching
    const lowerText = text.toLowerCase();
    
    // Helper function for fuzzy command matching
    const isPartialMatch = (command: string): boolean => {
        const commandLower = command.toLowerCase();
        return commandLower.includes(lowerText) || lowerText.includes(commandLower);
    };

    try {
        // Check for stock-related queries
        if (lowerText.includes('สต็อก') || lowerText.includes('เหลือ')) {
            await this.sendStockStatus(replyToken, user);
            return;
        }

        // Check for order-related queries
        if (lowerText.includes('ออเดอร์') || lowerText.includes('order')) {
            await this.sendDailySummary(replyToken, user);
            return;
        }

        // Check for menu-related queries
        if (lowerText.includes('เมนู') || lowerText.includes('menu')) {
            // Create URI action for menu management
            const menuUrl = `${process.env.LIFF_URL}/menu-management/${user.lineUserId}`;
            await this.client.replyMessage(replyToken, {
                type: 'text',
                text: 'จะดูเมนูใช่ไหมเจ้า? กดปุ่ม "🍰 จัดการเมนู" ได้เลยเน้อ',
                quickReply: {
                    items: [{
                        type: "action" as const,
                        action: {
                            type: "uri" as const,
                            label: CommandType.MENU,
                            uri: menuUrl
                        }
                    }]
                }
            });
            return;
        }

        // Check if text might be a partial command match
        const possibleCommands = Object.values(CommandType)
            .filter(isPartialMatch);

        if (possibleCommands.length > 0) {
            // If we found similar commands, suggest them
            const commandSuggestions = possibleCommands
                .map(cmd => `• ${cmd}`)
                .join('\n');

            await this.client.replyMessage(replyToken, {
                type: 'text',
                text: `เจ้าอาจจะหมายถึงคำสั่งพวกนี้หรือเปล่า?\n\n${commandSuggestions}\n\nหรือพิมพ์ "สมพร" เพื่อดูเมนูทั้งหมดเน้อ`
            });
            return;
        }

        // Default response for unrecognized input
        await this.client.replyMessage(replyToken, {
            type: 'text',
            text: 'ขออภัยเจ้า สมพรไม่เข้าใจ ลองพิมพ์ "สมพร" เพื่อดูคำสั่งทั้งหมดเน้อ'
        });

    } catch (error) {
        logError('Error in handleFreeTextInput:', {
          text: text,
          user: user,
          replyToken: replyToken
        });
        await this.client.replyMessage(replyToken, {
            type: 'text',
            text: 'ขออภัยเจ้า มีข้อผิดพลาดเกิดขึ้น ลองใหม่อีกครั้งเน้อ'
        });
    }
  }
}