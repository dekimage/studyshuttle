import { sendEmailApi } from "@/src/util/sendEmailApi";

export async function POST(request) {
    try {
        const { email, ctaNumber } = await request.json();

        // Basic validation
        if (!email || !ctaNumber) {
            return new Response(
                JSON.stringify({ error: "Email and CTA number are required" }),
                { status: 400 }
            );
        }

        // Generate email template based on ctaNumber
        const subject = `Ваша фактура и договор за Фаза ${ctaNumber} на Study Shuttle`;
        const text = `Предмет/Subject: Ваша фактура и договор за Фаза ${ctaNumber} на Study Shuttle
Почитуван/а [Име на корисник],
Ви благодариме за интересот и желбата да ја започнете Фаза ${ctaNumber} – Фундаментална Фаза на
Study Shuttle!
Во прилог на овој имејл ќе ја најдете:
1. Фактурата за уплата на износот за Фаза ${ctaNumber}, со сите детали потребни за плаќање.
2. Договорот за услугата, каде што се наведени правата и обврските на двете страни.
Ве молиме, извршете го плаќањето според наведените упатства во фактурата. Откако ќе ја
евидентираме Вашата уплата, ќе ви ги активираме услугите и ќе можете да закажете
ОНЛАЈН час со Вашиот ментор.
За сите дополнителни прашања, можете да нè контактирате на [ваш е-пошта/телефон за
поддршка].
Ви посакуваме успешен и пријатен почеток во Фаза ${ctaNumber}!
Срдечно,
Тимот на Study Shuttle
www.studyshuttle.mk`;

        // Send email using sendEmailApi
        const result = await sendEmailApi({
            to: email,
            subject,
            text,
        });

        if (result.error) {
            return new Response(
                JSON.stringify({ error: result.error }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({ message: "Email sent successfully" }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in API route:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
} 