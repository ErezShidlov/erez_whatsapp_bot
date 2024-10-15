const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// יצירת מופע של הלקוח עם אסטרטגיית אימות מקומית
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true } // ניתן לשנות ל-false אם רוצים לראות את הדפדפן
});

// מאזין לאירוע QR להצגת קוד ה-QR בשורת הפקודה
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('אנא סרוק את קוד ה-QR שמופיע לעיל באמצעות אפליקציית ווצאפ שלך.');
});

// מאזין לאירוע Ready שמציין שהבוט מוכן לפעולה
client.on('ready', () => {
    console.log('הבוט מוכן!');
});

// מאזין לאירוע Message ומטפל בהודעות נכנסות
client.on('message', async message => {
    // הגדרת מערך הפקודות שהבוט יגיב להן
    const commands = ['!sticker', '!סטיקר'];

    // בדיקה אם הודעת המשתמש היא אחת מהפקודות המוגדרות
    if (commands.includes(message.body.trim())) {
        // בדיקה אם ההודעה כוללת מדיה (תמונה, וידאו וכו')
        if (message.hasMedia) {
            try {
                // הורדת המדיה מההודעה
                const media = await message.downloadMedia();

                if (media) {
                    // יצירת אובייקט MessageMedia לסטיקר
                    const sticker = new MessageMedia(media.mimetype, media.data, media.filename);

                    // שליחת הסטיקר בחזרה למשתמש
                    client.sendMessage(message.from, sticker, { sendMediaAsSticker: true });
                } else {
                    // מענה למשתמש במקרה שההורדה נכשלה
                    message.reply('לא הצליח להוריד את המדיה.');
                }
            } catch (error) {
                console.error('שגיאה בהורדת המדיה:', error);
                message.reply('אירעה שגיאה בעת ניסיון להמיר את התמונה לסטיקר.');
            }
        } else {
            // מענה למשתמש אם לא צורפה מדיה עם הפקודה
            message.reply('אנא שלח תמונה להמרה לסטיקר.');
        }
    }
});

// אתחול הלקוח להתחברות ל-WhatsApp
client.initialize();
