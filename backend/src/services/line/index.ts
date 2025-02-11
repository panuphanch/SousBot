import { Client, WebhookEvent, MessageEvent, FollowEvent, QuickReply } from '@line/bot-sdk';
import { UserRepository, ProductRepository, OrderRepository } from '../../repositories/firebase';
import { User } from '../../types';

enum CommandType {
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
    // Process events in parallel like Task.WhenAll
    await Promise.all(
      events.map(async (event) => {
        try {
          if (event.type === 'message') {
            await this.handleMessage(event);
          } else if (event.type === 'follow') {
            await this.handleFollow(event);
          }
        } catch (error) {
          console.error(`Error handling event: ${error}`);
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
    if (event.message.type !== 'text') return;

    const userId = event.source.userId;
    if (!userId) return;

    const text = event.message.text.trim();
    
    // Check if user exists, similar to Entity Framework's FirstOrDefault
    const user = await this.userRepo.getByLineUserId(userId);
    if (!user) {
      await this.client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'สวัสดีเจ้า กรุณาลงทะเบียนก่อนนะเจ้า พิมพ์ "สมัคร" เพื่อเริ่มต้นใช้งานเน้อ'
      });
      return;
    }

    // Main command handler - similar to C# switch expression
    if (text === 'สมพร') {
      await this.sendMainMenu(event.replyToken);
    } else if (Object.values(CommandType).includes(text as CommandType)) {
      await this.handleCommand(text as CommandType, event.replyToken, user);
    } else {
      await this.handleFreeTextInput(text, event.replyToken, user);
    }
  }

  private async handleFollow(event: FollowEvent): Promise<void> {
    const userId = event.source.userId;
    if (!userId) return;
    
    const profile = await this.client.getProfile(userId);
    const liffUrl = `https://liff.line.me/${process.env.LIFF_ID}/register/${userId}`;
    
    // Send welcome message with LIFF link
    await this.client.replyMessage(event.replyToken, {
      type: 'text',
      text: `สวัสดีเจ้า ${profile.displayName} 🙏\nสมพรยินดีต้อนรับเจ้า มาจัดการร้านเบเกอรี่ด้วยกันเน้อ\n\nกดที่ลิงก์นี้เพื่อลงทะเบียนร้านก่อนเน้อ 👇\n${liffUrl}`
    });
  }

  private async sendMainMenu(replyToken: string): Promise<void> {
    const quickReply: QuickReply = {
      items: Object.values(CommandType).map(command => ({
        type: "action" as const, // Use literal type "action"
        action: {
          type: "message" as const, // Use literal type "message"
          label: command,
          text: command
        }
      }))
    };

    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: 'สมพรมาแล้วเจ้า! มาจัดการร้านเบเกอรี่กันเน้อ 🧁',
      quickReply
    });
  }

  private async handleCommand(command: CommandType, replyToken: string, user: User): Promise<void> {
    switch (command) {
      case CommandType.MENU:
        // Open LIFF page for menu management
        await this.openLiffPage(replyToken, 'menu-management', user.lineUserId);
        break;
      
      case CommandType.ORDER:
        // Open LIFF page for order management
        await this.openLiffPage(replyToken, 'order-management', user.lineUserId);
        break;
      
      case CommandType.DAILY_SUMMARY:
        await this.sendDailySummary(replyToken, user);
        break;
      
      case CommandType.STOCK:
        await this.sendStockStatus(replyToken, user);
        break;

      // Add other command handlers
    }
  }

  private async openLiffPage(replyToken: string, page: string, userId: string): Promise<void> {
    const liffUrl = `https://liff.line.me/${process.env.LIFF_ID}/${page}/${userId}`;
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: `กดที่ลิงก์นี้เพื่อจัดการเน้อเจ้า 👇\n${liffUrl}`
    });
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
            await this.client.replyMessage(replyToken, {
                type: 'text',
                text: 'จะดูเมนูใช่ไหมเจ้า? กดปุ่ม "🍰 จัดการเมนู" ได้เลยเน้อ',
                quickReply: {
                    items: [{
                        type: "action" as const,
                        action: {
                            type: "message" as const,
                            label: CommandType.MENU,
                            text: CommandType.MENU
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
        console.error('Error in handleFreeTextInput:', error);
        await this.client.replyMessage(replyToken, {
            type: 'text',
            text: 'ขออภัยเจ้า มีข้อผิดพลาดเกิดขึ้น ลองใหม่อีกครั้งเน้อ'
        });
    }
  }
}