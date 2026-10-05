import { getDictionary } from "@/lib/i18n";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/landing/ui";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const d = dict.landing;
  const isAr = lang === "ar";

  return (
    <div className="font-sans bg-paper text-lp-ink">
      <Nav lang={lang} navLinks={d.navLinks} login={d.login} requestAccess={d.requestAccess} />

      <main>
        <section className="py-20 lg:py-28">
          <Container>
            <div className="max-w-[720px] mx-auto">
              <p className="eyebrow mb-4">{isAr ? "قانوني" : "Legal"}</p>
              <h1 className="font-serif text-4xl font-normal tracking-[-0.02em] sm:text-5xl mb-4">
                {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
              </h1>
              <p className="text-sm text-lp-muted mb-12">
                {isAr ? "آخر تحديث: أكتوبر 2025" : "Last updated: October 2025"}
              </p>

              <div className="prose-legal">
                {isAr ? <PrivacyAr /> : <PrivacyEn />}
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer
        lang={lang}
        login={d.login}
        requestAccess={d.requestAccess}
        disclaimer={d.footerDisclaimer}
      />
    </div>
  );
}

function PrivacyEn() {
  return (
    <div className="space-y-10 text-[16px] leading-relaxed text-lp-ink-2">
      <Section title="1. Who we are">
        <p>
          Passboard (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is an independent educational preparation platform
          designed to help medical professionals and students prepare for licensing examinations.
          We are not affiliated with, endorsed by, or officially connected to any licensing authority.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <p>We collect the following categories of information:</p>
        <ul>
          <li><strong>Account information:</strong> your name, email address, phone number, and target exam when you request access or create an account.</li>
          <li><strong>Usage data:</strong> questions you attempt, answers you select, practice session history, mock exam results, and AI tutor conversations.</li>
          <li><strong>Technical data:</strong> browser type, IP address, device identifiers, and session logs collected automatically when you use the platform.</li>
        </ul>
        <p>We do not collect payment information directly — any payments are processed by third-party providers subject to their own privacy policies.</p>
      </Section>

      <Section title="3. How we use your information">
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and improve the Passboard platform.</li>
          <li>Personalise your study experience, including surfacing questions you need to review.</li>
          <li>Respond to your access requests and communicate with you about your account.</li>
          <li>Monitor platform security and prevent misuse.</li>
          <li>Understand aggregate usage patterns to improve content and features.</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      </Section>

      <Section title="4. Data storage and security">
        <p>
          Your data is stored securely using Supabase, a GDPR-compliant cloud database provider.
          Data is encrypted in transit (TLS) and at rest. Access to your data is restricted to
          authorised Passboard personnel only.
        </p>
        <p>
          No method of electronic storage is 100% secure. While we take reasonable precautions,
          we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="5. Data retention">
        <p>
          We retain your account and usage data for as long as your account is active. If you
          request account deletion, we will remove your personal data within 30 days, except
          where retention is required by law.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data.</li>
          <li>Object to or restrict certain processing.</li>
          <li>Data portability.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:privacy@passboard.ai" className="text-amber-ink underline">privacy@passboard.ai</a>.
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          We use session cookies and local storage to keep you logged in and to remember your
          preferences. We do not use advertising or third-party tracking cookies.
        </p>
      </Section>

      <Section title="8. Third-party services">
        <p>We use the following third-party services to operate Passboard:</p>
        <ul>
          <li><strong>Supabase</strong> — database and authentication.</li>
          <li><strong>Vercel</strong> — hosting and content delivery.</li>
          <li><strong>OpenAI</strong> — AI tutor functionality. Conversations may be processed by OpenAI in accordance with their privacy policy.</li>
        </ul>
      </Section>

      <Section title="9. Children">
        <p>
          Passboard is intended for medical students and professionals aged 18 and over.
          We do not knowingly collect data from anyone under 18.
        </p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify registered users
          of material changes by email. Continued use of the platform after changes take effect
          constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          If you have questions about this policy, contact us at{" "}
          <a href="mailto:privacy@passboard.ai" className="text-amber-ink underline">privacy@passboard.ai</a>.
        </p>
      </Section>
    </div>
  );
}

function PrivacyAr() {
  return (
    <div className="space-y-10 text-[16px] leading-relaxed text-lp-ink-2" dir="rtl">
      <Section title="١. من نحن">
        <p>
          Passboard ("نحن" أو "لنا") منصة تعليمية مستقلة مصممة لمساعدة الأطباء والطلاب على الاستعداد لاختبارات الترخيص المهني.
          نحن لسنا تابعين لأي جهة ترخيص رسمية ولا معتمدين من قبلها.
        </p>
      </Section>

      <Section title="٢. المعلومات التي نجمعها">
        <p>نجمع الفئات التالية من المعلومات:</p>
        <ul>
          <li><strong>معلومات الحساب:</strong> اسمك وعنوان بريدك الإلكتروني ورقم هاتفك والاختبار المستهدف عند طلب الوصول أو إنشاء حساب.</li>
          <li><strong>بيانات الاستخدام:</strong> الأسئلة التي تحاول الإجابة عليها وإجاباتك وسجل جلسات التدريب ونتائج الاختبارات التجريبية ومحادثات المدرّس الذكي.</li>
          <li><strong>البيانات التقنية:</strong> نوع المتصفح وعنوان IP ومعرّفات الجهاز وسجلات الجلسات التي تُجمع تلقائياً.</li>
        </ul>
        <p>لا نجمع معلومات الدفع مباشرة — تتم معالجة أي مدفوعات عبر مزودين خارجيين.</p>
      </Section>

      <Section title="٣. كيف نستخدم معلوماتك">
        <ul>
          <li>تشغيل منصة Passboard وتحسينها.</li>
          <li>تخصيص تجربة الدراسة بما في ذلك إعادة عرض الأسئلة التي تحتاج إلى مراجعة.</li>
          <li>الرد على طلبات الوصول والتواصل معك بشأن حسابك.</li>
          <li>مراقبة أمن المنصة ومنع إساءة الاستخدام.</li>
        </ul>
        <p>لا نبيع معلوماتك الشخصية لأطراف ثالثة.</p>
      </Section>

      <Section title="٤. تخزين البيانات وأمنها">
        <p>
          يتم تخزين بياناتك بأمان باستخدام Supabase، مزود قاعدة بيانات سحابي متوافق مع اللائحة الأوروبية لحماية البيانات (GDPR).
          البيانات مشفّرة أثناء النقل (TLS) وأثناء التخزين.
        </p>
      </Section>

      <Section title="٥. حقوقك">
        <p>يحق لك وفقاً للقوانين المعمول بها:</p>
        <ul>
          <li>الاطلاع على بياناتك الشخصية التي نحتفظ بها.</li>
          <li>طلب تصحيح البيانات غير الدقيقة.</li>
          <li>طلب حذف بياناتك.</li>
        </ul>
        <p>
          للتواصل بشأن هذه الحقوق، راسلنا على{" "}
          <a href="mailto:privacy@passboard.ai" className="text-amber-ink underline">privacy@passboard.ai</a>.
        </p>
      </Section>

      <Section title="٦. التغييرات على هذه السياسة">
        <p>
          قد نحدّث سياسة الخصوصية هذه من وقت لآخر. سنخطر المستخدمين المسجّلين بالتغييرات الجوهرية عبر البريد الإلكتروني.
        </p>
      </Section>

      <Section title="٧. التواصل">
        <p>
          لأي استفسارات حول هذه السياسة، تواصل معنا على{" "}
          <a href="mailto:privacy@passboard.ai" className="text-amber-ink underline">privacy@passboard.ai</a>.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-serif text-[22px] font-normal text-lp-ink">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:ps-5 [&_ul]:space-y-1.5">{children}</div>
    </div>
  );
}
