import { getDictionary } from "@/lib/i18n";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/landing/ui";

export default async function TermsPage({
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
                {isAr ? "الشروط والأحكام" : "Terms of Service"}
              </h1>
              <p className="text-sm text-lp-muted mb-12">
                {isAr ? "آخر تحديث: أكتوبر 2025" : "Last updated: October 2025"}
              </p>

              <div>
                {isAr ? <TermsAr /> : <TermsEn />}
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

function TermsEn() {
  return (
    <div className="space-y-10 text-[16px] leading-relaxed text-lp-ink-2">
      <Section title="1. Acceptance of terms">
        <p>
          By accessing or using Passboard (&ldquo;the platform&rdquo;), you agree to be bound by these Terms of Service.
          If you do not agree, you may not use the platform. We reserve the right to update these terms
          at any time; continued use after changes take effect constitutes acceptance.
        </p>
      </Section>

      <Section title="2. Description of service">
        <p>
          Passboard is a private-access educational platform providing medical licensing exam preparation
          content, including multiple-choice questions, practice sessions, mock exams, and an AI-powered
          tutor. Access is granted on an invitation or application basis.
        </p>
        <p>
          Passboard is an independent educational tool. It is not affiliated with, endorsed by, or
          officially connected to any licensing body including SMLE, USMLE, PLAB, MCCQE, or AMC authorities.
          Content is provided for educational purposes only and does not guarantee exam success.
        </p>
      </Section>

      <Section title="3. Eligibility and access">
        <p>
          You must be 18 years of age or older to use Passboard. Access is granted at our sole
          discretion. We may revoke or suspend access at any time if these terms are violated.
        </p>
        <p>
          You are responsible for keeping your login credentials confidential. You must not share
          your account with others or allow any third party to access the platform using your credentials.
        </p>
      </Section>

      <Section title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Copy, reproduce, distribute, or publicly display any platform content without prior written permission.</li>
          <li>Use automated tools, bots, or scrapers to extract content from the platform.</li>
          <li>Attempt to reverse-engineer, decompile, or otherwise derive source code from the platform.</li>
          <li>Use the platform for any unlawful purpose or in violation of any applicable regulations.</li>
          <li>Impersonate another person or misrepresent your professional status.</li>
          <li>Interfere with or disrupt the platform or its servers.</li>
        </ul>
      </Section>

      <Section title="5. Intellectual property">
        <p>
          All content on the platform — including questions, explanations, rationales, UI design, and
          AI-generated responses — is owned by or licensed to Passboard and is protected by copyright
          and other intellectual property laws. Nothing in these terms grants you any ownership over
          platform content.
        </p>
      </Section>

      <Section title="6. AI tutor">
        <p>
          The AI tutor feature is powered by large language model technology and is provided for
          educational guidance only. Responses are not a substitute for professional medical advice,
          clinical judgment, or official exam preparation materials. AI-generated content may
          occasionally be incomplete or inaccurate — always verify critical information against
          authoritative clinical sources.
        </p>
      </Section>

      <Section title="7. Disclaimer of warranties">
        <p>
          The platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
          express or implied. We do not warrant that the platform will be uninterrupted, error-free,
          or that content is complete, accurate, or current. Your use of the platform is at your
          own risk.
        </p>
      </Section>

      <Section title="8. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Passboard shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, including loss of data, loss of
          exam results, or any other loss arising from your use of or inability to use the platform,
          even if we have been advised of the possibility of such damages.
        </p>
      </Section>

      <Section title="9. Termination">
        <p>
          We may suspend or terminate your access at any time, with or without cause, and with or
          without notice. On termination, your right to use the platform ceases immediately.
        </p>
      </Section>

      <Section title="10. Governing law">
        <p>
          These terms are governed by and construed in accordance with applicable law. Any disputes
          arising from these terms or your use of the platform shall be subject to the exclusive
          jurisdiction of the competent courts.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          For questions about these terms, contact us at{" "}
          <a href="mailto:legal@passboard.ai" className="text-amber-ink underline">legal@passboard.ai</a>.
        </p>
      </Section>
    </div>
  );
}

function TermsAr() {
  return (
    <div className="space-y-10 text-[16px] leading-relaxed text-lp-ink-2" dir="rtl">
      <Section title="١. قبول الشروط">
        <p>
          باستخدامك لمنصة Passboard ("المنصة")، فإنك توافق على الالتزام بهذه الشروط والأحكام.
          إن لم توافق، فلا يحق لك استخدام المنصة. نحتفظ بحق تعديل هذه الشروط في أي وقت؛
          استمرارك في الاستخدام بعد التغييرات يعني قبولك لها.
        </p>
      </Section>

      <Section title="٢. وصف الخدمة">
        <p>
          Passboard منصة تعليمية خاصة توفر محتوى للتحضير لاختبارات الترخيص الطبي، بما يشمل أسئلة
          اختيار من متعدد وجلسات تدريبية واختبارات تجريبية ومدرّساً بالذكاء الاصطناعي.
        </p>
        <p>
          Passboard أداة تعليمية مستقلة وليست تابعة لأي جهة ترخيص رسمية. المحتوى مقدَّم لأغراض
          تعليمية فقط ولا يضمن النجاح في الاختبار.
        </p>
      </Section>

      <Section title="٣. الأهلية والوصول">
        <p>
          يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام المنصة. يُمنح الوصول وفق تقديرنا المطلق.
          أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك.
        </p>
      </Section>

      <Section title="٤. الاستخدام المقبول">
        <p>توافق على عدم:</p>
        <ul>
          <li>نسخ أي محتوى من المنصة أو توزيعه دون إذن كتابي مسبق.</li>
          <li>استخدام أدوات آلية أو برامج لاستخراج المحتوى.</li>
          <li>استخدام المنصة لأغراض غير مشروعة.</li>
          <li>انتحال شخصية أخرى أو تقديم معلومات مضللة.</li>
        </ul>
      </Section>

      <Section title="٥. الملكية الفكرية">
        <p>
          جميع محتويات المنصة — بما في ذلك الأسئلة والشروحات والتصميم والردود الذكية — مملوكة
          أو مرخّصة لـ Passboard وتخضع لقوانين حقوق الملكية الفكرية.
        </p>
      </Section>

      <Section title="٦. إخلاء المسؤولية">
        <p>
          تُقدَّم المنصة "كما هي" دون أي ضمانات. لا نضمن أن المحتوى مكتمل أو دقيق في جميع الأوقات.
          استخدامك للمنصة يكون على مسؤوليتك الخاصة.
        </p>
      </Section>

      <Section title="٧. التواصل">
        <p>
          لأي استفسارات حول هذه الشروط، تواصل معنا على{" "}
          <a href="mailto:legal@passboard.ai" className="text-amber-ink underline">legal@passboard.ai</a>.
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
