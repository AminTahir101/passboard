'use client';

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { useAnatomyStore } from '@/store/anatomyStore';

interface Props {
  lang: 'en' | 'ar';
  onNodeSelect: (nodeId: string) => void;
}

interface ClickRegion {
  id: string; en: string; ar: string;
  x: number; y: number; w: number; h: number;
  lx: number; ly: number; side: 'left' | 'right';
}

// ViewBox: -170 0 740 920  (center x=200, y=0-920)
// Coordinates match Corpus Humanum reference atlas exactly.

const CLICK_REGIONS: ClickRegion[] = [
  { id: 'FMA:50801', en: 'Brain',            ar: 'الدماغ',          x: 160, y: 18,  w: 80,  h: 70,  lx: 380, ly: 36,  side: 'right' },
  { id: 'FMA:7088',  en: 'Heart',            ar: 'القلب',           x: 182, y: 218, w: 54,  h: 66,  lx: 380, ly: 250, side: 'right' },
  { id: 'FMA:7310',  en: 'Right Lung',       ar: 'الرئة اليمنى',    x: 145, y: 192, w: 62,  h: 130, lx: 380, ly: 258, side: 'right' },
  { id: 'FMA:7311',  en: 'Left Lung',        ar: 'الرئة اليسرى',    x: 207, y: 192, w: 52,  h: 130, lx: -20, ly: 258, side: 'left'  },
  { id: 'FMA:7197',  en: 'Liver',            ar: 'الكبد',           x: 140, y: 302, w: 106, h: 58,  lx: 380, ly: 328, side: 'right' },
  { id: 'FMA:7148',  en: 'Stomach',          ar: 'المعدة',          x: 204, y: 290, w: 54,  h: 74,  lx: -20, ly: 328, side: 'left'  },
  { id: 'FMA:7203',  en: 'Right Kidney',     ar: 'الكلية اليمنى',   x: 152, y: 322, w: 44,  h: 62,  lx: 380, ly: 352, side: 'right' },
  { id: 'FMA:7204',  en: 'Left Kidney',      ar: 'الكلية اليسرى',   x: 207, y: 322, w: 44,  h: 62,  lx: -20, ly: 352, side: 'left'  },
  { id: 'FMA:15900', en: 'Urinary Bladder',  ar: 'المثانة البولية', x: 168, y: 378, w: 66,  h: 68,  lx: 380, ly: 412, side: 'right' },
  { id: 'FMA:9631',  en: 'Vertebral Column', ar: 'العمود الفقري',   x: 188, y: 88,  w: 24,  h: 310, lx: -20, ly: 240, side: 'left'  },
];

interface AnatLabel { en: string; ar: string; x1: number; y1: number; lx: number; ly: number; side: 'left' | 'right'; }

const LABELS: AnatLabel[] = [
  { en: 'Common carotid',        ar: 'الشريان السباتي المشترك',   x1: 194, y1: 120, lx: 380, ly: 108, side: 'right' },
  { en: 'Aortic arch',           ar: 'قوس الأبهر',               x1: 188, y1: 182, lx: 380, ly: 172, side: 'right' },
  { en: 'Heart',                 ar: 'القلب',                    x1: 200, y1: 252, lx: 380, ly: 244, side: 'right' },
  { en: 'Abdominal aorta',       ar: 'الأبهر البطني',            x1: 196, y1: 328, lx: 380, ly: 318, side: 'right' },
  { en: 'Femoral artery',        ar: 'شريان الفخذ',              x1: 178, y1: 490, lx: 380, ly: 480, side: 'right' },
  { en: 'Anterior tibial',       ar: 'الشريان الظنبوبي الأمامي', x1: 174, y1: 630, lx: 380, ly: 620, side: 'right' },
  { en: 'Jugular vein',          ar: 'الوريد الوداجي',           x1: 196, y1: 104, lx: -20, ly: 96,  side: 'left'  },
  { en: 'Brachial artery',       ar: 'شريان العضد',              x1: 282, y1: 240, lx: -20, ly: 232, side: 'left'  },
  { en: 'Femoral vein',          ar: 'وريد الفخذ',               x1: 222, y1: 490, lx: -20, ly: 480, side: 'left'  },
];

// ── SVG layer content from Corpus Humanum reference atlas ─────

const LAYER_INTEGUMENTARY = `<path fill="url(#fgSkin)" d="M201 18 C181 18 161 31 158 58 C156 74 157 90 160 104 C162 114 166 122 172 128 C176 133 180 138 181 146 C182 152 182 158 181 162 C170 168 150 170 132 174 C118 178 108 188 105 206 C102 222 103 236 102 256 C100 290 96 330 92 372 C88 400 80 440 72 494 C66 506 60 524 57 544 C55 552 60 556 64 550 C63 566 63 590 70 602 C76 610 86 606 89 596 C92 580 91 550 90 520 C90 510 92 504 94 498 C100 460 108 420 113 386 C118 350 122 300 128 264 C131 250 136 240 144 240 C142 280 146 330 154 368 C158 392 150 410 144 436 C138 470 134 520 138 580 C140 620 144 650 148 676 C150 700 142 720 141 748 C140 790 150 830 156 856 C158 872 150 884 154 894 C160 904 182 908 192 902 C196 896 190 884 188 868 C186 840 192 790 194 760 C196 730 190 710 190 690 C190 650 194 590 197 540 C198 520 199 510 201 506 Z"></path>
<path fill="url(#fgSkin)" transform="matrix(-1 0 0 1 400 0)" d="M201 18 C181 18 161 31 158 58 C156 74 157 90 160 104 C162 114 166 122 172 128 C176 133 180 138 181 146 C182 152 182 158 181 162 C170 168 150 170 132 174 C118 178 108 188 105 206 C102 222 103 236 102 256 C100 290 96 330 92 372 C88 400 80 440 72 494 C66 506 60 524 57 544 C55 552 60 556 64 550 C63 566 63 590 70 602 C76 610 86 606 89 596 C92 580 91 550 90 520 C90 510 92 504 94 498 C100 460 108 420 113 386 C118 350 122 300 128 264 C131 250 136 240 144 240 C142 280 146 330 154 368 C158 392 150 410 144 436 C138 470 134 520 138 580 C140 620 144 650 148 676 C150 700 142 720 141 748 C140 790 150 830 156 856 C158 872 150 884 154 894 C160 904 182 908 192 902 C196 896 190 884 188 868 C186 840 192 790 194 760 C196 730 190 710 190 690 C190 650 194 590 197 540 C198 520 199 510 201 506 Z"></path>
<g>
<path d="M158 82 C152 82 151 96 156 104 C158 106 160 104 160 100 Z" fill="#C99A82"></path>
<circle cx="168" cy="258" r="3.4" fill="#B47C68" opacity="0.8"></circle>
<path d="M196 262 C184 272 166 270 152 258 M190 172 C176 168 160 172 144 172 M156 670 C164 680 176 680 184 670 M116 372 C110 378 104 378 98 374" fill="none" stroke="#A47662" stroke-width="0.8" opacity="0.45"></path>
<path d="M177 81 C181 84 188 84 192 81" fill="none" stroke="#8E6250" stroke-width="1" opacity="0.6"></path>
</g>
<g transform="matrix(-1 0 0 1 400 0)">
<path d="M158 82 C152 82 151 96 156 104 C158 106 160 104 160 100 Z" fill="#C99A82"></path>
<circle cx="168" cy="258" r="3.4" fill="#B47C68" opacity="0.8"></circle>
<path d="M196 262 C184 272 166 270 152 258 M190 172 C176 168 160 172 144 172 M156 670 C164 680 176 680 184 670 M116 372 C110 378 104 378 98 374" fill="none" stroke="#A47662" stroke-width="0.8" opacity="0.45"></path>
<path d="M177 81 C181 84 188 84 192 81" fill="none" stroke="#8E6250" stroke-width="1" opacity="0.6"></path>
</g>
<ellipse cx="200" cy="392" rx="2.2" ry="3.2" fill="#946654"></ellipse>
<path d="M200 86 L200 99 C198 102 195 102 194 100" fill="none" stroke="#A47662" stroke-width="0.8" opacity="0.5"></path>
<path d="M192 114 C196 116.5 204 116.5 208 114" fill="none" stroke="#A0645A" stroke-width="1" opacity="0.55"></path>
</g>

<g opacity="{{lab.skin}}" style="transition: opacity .5s ease" pointer-events="none">
<path d="M178 36 H-24 M200 392 H-24 M78 560 H-24 M246 92 H424 M232 258 H424 M233 676 H424" fill="none" stroke="#E9E4DA" stroke-opacity="0.38" stroke-width="0.8"></path>
<g fill="#F1ECE2"><circle cx="178" cy="36" r="2.2"></circle><circle cx="200" cy="392" r="2.2"></circle><circle cx="78" cy="560" r="2.2"></circle><circle cx="246" cy="92" r="2.2"></circle><circle cx="232" cy="258" r="2.2"></circle><circle cx="233" cy="676" r="2.2"></circle></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="end"><text x="-30" y="40">Scalp</text><text x="-30" y="396">Umbilicus</text><text x="-30" y="564">Palm</text></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="start"><text x="430" y="96">Auricle</text><text x="430" y="262">Areola</text><text x="430" y="680">Knee</text></g>
</g>

<g opacity="{{lab.muscle}}" style="transition: opacity .5s ease" pointer-events="none">
<path d="M180 44 H-24 M108 214 H-24 M112 310 H-24 M193 340 H-24 M166 380 H-24 M167 540 H-24 M146 600 H-24 M159 770 H-24 M228 112 H424 M222 148 H424 M240 215 H424 M250 276 H424 M297 440 H424 M237 560 H424 M214 750 H424" fill="none" stroke="#E9E4DA" stroke-opacity="0.38" stroke-width="0.8"></path>
<g fill="#F1ECE2"><circle cx="180" cy="44" r="2.2"></circle><circle cx="108" cy="214" r="2.2"></circle><circle cx="112" cy="310" r="2.2"></circle><circle cx="193" cy="340" r="2.2"></circle><circle cx="166" cy="380" r="2.2"></circle><circle cx="167" cy="540" r="2.2"></circle><circle cx="146" cy="600" r="2.2"></circle><circle cx="159" cy="770" r="2.2"></circle><circle cx="228" cy="112" r="2.2"></circle><circle cx="222" cy="148" r="2.2"></circle><circle cx="240" cy="215" r="2.2"></circle><circle cx="250" cy="276" r="2.2"></circle><circle cx="297" cy="440" r="2.2"></circle><circle cx="237" cy="560" r="2.2"></circle><circle cx="214" cy="750" r="2.2"></circle></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="end"><text x="-30" y="48">Frontalis</text><text x="-30" y="218">Deltoid</text><text x="-30" y="314">Biceps brachii</text><text x="-30" y="344">Rectus abdominis</text><text x="-30" y="384">External oblique</text><text x="-30" y="544">Sartorius</text><text x="-30" y="604">Vastus lateralis</text><text x="-30" y="774">Tibialis anterior</text></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="start"><text x="430" y="116">Masseter</text><text x="430" y="152">Sternocleidomastoid</text><text x="430" y="219">Pectoralis major</text><text x="430" y="280">Serratus anterior</text><text x="430" y="444">Forearm flexors</text><text x="430" y="564">Rectus femoris</text><text x="430" y="754">Gastrocnemius</text></g>
</g>

<g opacity="{{lab.nervous}}" style="transition: opacity .5s ease" pointer-events="none">
<path d="M176 56 H-24 M166 104 H-24 M170 196 H-24 M111 360 H-24 M159 540 H-24 M169 640 H-24 M157 780 H-24 M200 260 H424 M248 289 H424 M203 410 H424 M294 432 H424 M229 790 H424" fill="none" stroke="#E9E4DA" stroke-opacity="0.38" stroke-width="0.8"></path>
<g fill="#F1ECE2"><circle cx="176" cy="56" r="2.2"></circle><circle cx="166" cy="104" r="2.2"></circle><circle cx="170" cy="196" r="2.2"></circle><circle cx="111" cy="360" r="2.2"></circle><circle cx="159" cy="540" r="2.2"></circle><circle cx="169" cy="640" r="2.2"></circle><circle cx="157" cy="780" r="2.2"></circle><circle cx="200" cy="260" r="2.2"></circle><circle cx="248" cy="289" r="2.2"></circle><circle cx="203" cy="410" r="2.2"></circle><circle cx="294" cy="432" r="2.2"></circle><circle cx="229" cy="790" r="2.2"></circle></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="end"><text x="-30" y="60">Cerebrum</text><text x="-30" y="108">Facial nerve</text><text x="-30" y="200">Brachial plexus</text><text x="-30" y="364">Median nerve</text><text x="-30" y="544">Femoral nerve</text><text x="-30" y="644">Sciatic nerve</text><text x="-30" y="784">Common fibular nerve</text></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="start"><text x="430" y="264">Spinal cord</text><text x="430" y="293">Intercostal nerves</text><text x="430" y="414">Cauda equina</text><text x="430" y="436">Ulnar nerve</text><text x="430" y="794">Tibial nerve</text></g>
</g>

<g opacity="{{lab.cardio}}" style="transition: opacity .5s ease" pointer-events="none">
<path d="M166 72 H-24 M182 140 H-24 M194 204 H-24 M125 300 H-24 M195 380 H-24 M171 540 H-24 M193 630 H-24 M164 780 H-24 M213 150 H424 M222 200 H424 M224 252 H424 M204 330 H424 M212 436 H424 M316 470 H424 M215 780 H424" fill="none" stroke="#E9E4DA" stroke-opacity="0.38" stroke-width="0.8"></path>
<g fill="#F1ECE2"><circle cx="166" cy="72" r="2.2"></circle><circle cx="182" cy="140" r="2.2"></circle><circle cx="194" cy="204" r="2.2"></circle><circle cx="125" cy="300" r="2.2"></circle><circle cx="195" cy="380" r="2.2"></circle><circle cx="171" cy="540" r="2.2"></circle><circle cx="193" cy="630" r="2.2"></circle><circle cx="164" cy="780" r="2.2"></circle><circle cx="213" cy="150" r="2.2"></circle><circle cx="222" cy="200" r="2.2"></circle><circle cx="224" cy="252" r="2.2"></circle><circle cx="204" cy="330" r="2.2"></circle><circle cx="212" cy="436" r="2.2"></circle><circle cx="316" cy="470" r="2.2"></circle><circle cx="215" cy="780" r="2.2"></circle></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="end"><text x="-30" y="76">Temporal artery</text><text x="-30" y="144">Jugular vein</text><text x="-30" y="208">Superior vena cava</text><text x="-30" y="304">Brachial artery</text><text x="-30" y="384">Inferior vena cava</text><text x="-30" y="544">Femoral artery</text><text x="-30" y="634">Great saphenous vein</text><text x="-30" y="784">Anterior tibial artery</text></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="start"><text x="430" y="154">Common carotid</text><text x="430" y="204">Aortic arch</text><text x="430" y="256">Heart</text><text x="430" y="334">Abdominal aorta</text><text x="430" y="440">Common iliac</text><text x="430" y="474">Radial artery</text><text x="430" y="784">Posterior tibial artery</text></g>
</g>

<g opacity="{{lab.lymph}}" style="transition: opacity .5s ease" pointer-events="none">
<path d="M178 140 H-24 M146 246 H-24 M120 340 H-24 M198 380 H-24 M176 476 H-24 M178 690 H-24 M204 204 H424 M197 280 H424 M240 316 H424 M288 374 H424 M212 400 H424" fill="none" stroke="#E9E4DA" stroke-opacity="0.38" stroke-width="0.8"></path>
<g fill="#F1ECE2"><circle cx="178" cy="140" r="2.2"></circle><circle cx="146" cy="246" r="2.2"></circle><circle cx="120" cy="340" r="2.2"></circle><circle cx="198" cy="380" r="2.2"></circle><circle cx="176" cy="476" r="2.2"></circle><circle cx="178" cy="690" r="2.2"></circle><circle cx="204" cy="204" r="2.2"></circle><circle cx="197" cy="280" r="2.2"></circle><circle cx="240" cy="316" r="2.2"></circle><circle cx="288" cy="374" r="2.2"></circle><circle cx="212" cy="400" r="2.2"></circle></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="end"><text x="-30" y="144">Cervical nodes</text><text x="-30" y="250">Axillary nodes</text><text x="-30" y="344">Lymphatic vessels</text><text x="-30" y="384">Cisterna chyli</text><text x="-30" y="480">Inguinal nodes</text><text x="-30" y="694">Popliteal nodes</text></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="start"><text x="430" y="208">Thymus</text><text x="430" y="284">Thoracic duct</text><text x="430" y="320">Spleen</text><text x="430" y="378">Cubital nodes</text><text x="430" y="404">Mesenteric nodes</text></g>
</g>

<g opacity="{{lab.resp}}" style="transition: opacity .5s ease" pointer-events="none">
<path d="M194 140 H-24 M198 180 H-24 M160 236 H-24 M172 258 H-24 M176 288 H-24 M170 307 H-24 M216 226 H424 M244 262 H424 M214 282 H424 M236 302 H424" fill="none" stroke="#E9E4DA" stroke-opacity="0.38" stroke-width="0.8"></path>
<g fill="#F1ECE2"><circle cx="194" cy="140" r="2.2"></circle><circle cx="198" cy="180" r="2.2"></circle><circle cx="160" cy="236" r="2.2"></circle><circle cx="172" cy="258" r="2.2"></circle><circle cx="176" cy="288" r="2.2"></circle><circle cx="170" cy="307" r="2.2"></circle><circle cx="216" cy="226" r="2.2"></circle><circle cx="244" cy="262" r="2.2"></circle><circle cx="214" cy="282" r="2.2"></circle><circle cx="236" cy="302" r="2.2"></circle></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="end"><text x="-30" y="144">Larynx</text><text x="-30" y="184">Trachea</text><text x="-30" y="240">Right lung · 3 lobes</text><text x="-30" y="262">Horizontal fissure</text><text x="-30" y="292">Oblique fissure</text><text x="-30" y="311">Diaphragm</text></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="start"><text x="430" y="230">Left main bronchus</text><text x="430" y="266">Left lung · 2 lobes</text><text x="430" y="286">Cardiac notch</text><text x="430" y="306">Bronchioles</text></g>
</g>

<g opacity="{{lab.digest}}" style="transition: opacity .5s ease" pointer-events="none">
<path d="M201 180 H-24 M166 332 H-24 M172 356 H-24 M162 410 H-24 M166 444 H-24 M164 466 H-24 M236 330 H424 M241 356 H424 M214 410 H424 M241 432 H424 M214 464 H424 M200 486 H424" fill="none" stroke="#E9E4DA" stroke-opacity="0.38" stroke-width="0.8"></path>
<g fill="#F1ECE2"><circle cx="201" cy="180" r="2.2"></circle><circle cx="166" cy="332" r="2.2"></circle><circle cx="172" cy="356" r="2.2"></circle><circle cx="162" cy="410" r="2.2"></circle><circle cx="166" cy="444" r="2.2"></circle><circle cx="164" cy="466" r="2.2"></circle><circle cx="236" cy="330" r="2.2"></circle><circle cx="241" cy="356" r="2.2"></circle><circle cx="214" cy="410" r="2.2"></circle><circle cx="241" cy="432" r="2.2"></circle><circle cx="214" cy="464" r="2.2"></circle><circle cx="200" cy="486" r="2.2"></circle></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="end"><text x="-30" y="184">Esophagus</text><text x="-30" y="336">Liver</text><text x="-30" y="360">Gallbladder</text><text x="-30" y="414">Ascending colon</text><text x="-30" y="448">Cecum</text><text x="-30" y="470">Appendix</text></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="start"><text x="430" y="334">Stomach</text><text x="430" y="360">Pancreas</text><text x="430" y="414">Small intestine</text><text x="430" y="436">Descending colon</text><text x="430" y="468">Sigmoid colon</text><text x="430" y="490">Rectum</text></g>
</g>

<g opacity="{{lab.urinary}}" style="transition: opacity .5s ease" pointer-events="none">
<path d="M172 326 H-24 M162 352 H-24 M190 420 H-24 M218 354 H424 M208 488 H424" fill="none" stroke="#E9E4DA" stroke-opacity="0.38" stroke-width="0.8"></path>
<g fill="#F1ECE2"><circle cx="172" cy="326" r="2.2"></circle><circle cx="162" cy="352" r="2.2"></circle><circle cx="190" cy="420" r="2.2"></circle><circle cx="218" cy="354" r="2.2"></circle><circle cx="208" cy="488" r="2.2"></circle></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="end"><text x="-30" y="330">Adrenal gland</text><text x="-30" y="356">Kidney</text><text x="-30" y="424">Ureter</text></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="start"><text x="430" y="358">Renal pelvis</text><text x="430" y="492">Urinary bladder</text></g>
</g>

<g opacity="{{lab.skeleton}}" style="transition: opacity .5s ease" pointer-events="none">
<path d="M172 46 H-24 M150 172 H-24 M110 290 H-24 M152 430 H-24 M80 470 H-24 M152 560 H-24 M77 590 H-24 M170 780 H-24 M224 118 H424 M200 228 H424 M250 252 H424 M208 392 H424 M206 470 H424 M233 684 H424 M226 884 H424" fill="none" stroke="#E9E4DA" stroke-opacity="0.38" stroke-width="0.8"></path>
<g fill="#F1ECE2"><circle cx="172" cy="46" r="2.2"></circle><circle cx="150" cy="172" r="2.2"></circle><circle cx="110" cy="290" r="2.2"></circle><circle cx="152" cy="430" r="2.2"></circle><circle cx="80" cy="470" r="2.2"></circle><circle cx="152" cy="560" r="2.2"></circle><circle cx="77" cy="590" r="2.2"></circle><circle cx="170" cy="780" r="2.2"></circle><circle cx="224" cy="118" r="2.2"></circle><circle cx="200" cy="228" r="2.2"></circle><circle cx="250" cy="252" r="2.2"></circle><circle cx="208" cy="392" r="2.2"></circle><circle cx="206" cy="470" r="2.2"></circle><circle cx="233" cy="684" r="2.2"></circle><circle cx="226" cy="884" r="2.2"></circle></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="end"><text x="-30" y="50">Cranium</text><text x="-30" y="176">Clavicle</text><text x="-30" y="294">Humerus</text><text x="-30" y="434">Ilium</text><text x="-30" y="474">Radius</text><text x="-30" y="564">Femur</text><text x="-30" y="594">Phalanges</text><text x="-30" y="784">Tibia</text></g>
<g fill="#E9E4DA" font-size="12.5" text-anchor="start"><text x="430" y="122">Mandible</text><text x="430" y="232">Sternum</text><text x="430" y="256">Ribs</text><text x="430" y="396">Lumbar vertebrae</text><text x="430" y="474">Sacrum</text><text x="430" y="688">Patella</text><text x="430" y="888">Metatarsals</text></g>`;

const LAYER_MUSCULAR = `<path fill="#3A1018" d="M201 18 C181 18 161 31 158 58 C156 74 157 90 160 104 C162 114 166 122 172 128 C176 133 180 138 181 146 C182 152 182 158 181 162 C170 168 150 170 132 174 C118 178 108 188 105 206 C102 222 103 236 102 256 C100 290 96 330 92 372 C88 400 80 440 72 494 C66 506 60 524 57 544 C55 552 60 556 64 550 C63 566 63 590 70 602 C76 610 86 606 89 596 C92 580 91 550 90 520 C90 510 92 504 94 498 C100 460 108 420 113 386 C118 350 122 300 128 264 C131 250 136 240 144 240 C142 280 146 330 154 368 C158 392 150 410 144 436 C138 470 134 520 138 580 C140 620 144 650 148 676 C150 700 142 720 141 748 C140 790 150 830 156 856 C158 872 150 884 154 894 C160 904 182 908 192 902 C196 896 190 884 188 868 C186 840 192 790 194 760 C196 730 190 710 190 690 C190 650 194 590 197 540 C198 520 199 510 201 506 Z"></path>
<path fill="#3A1018" transform="matrix(-1 0 0 1 400 0)" d="M201 18 C181 18 161 31 158 58 C156 74 157 90 160 104 C162 114 166 122 172 128 C176 133 180 138 181 146 C182 152 182 158 181 162 C170 168 150 170 132 174 C118 178 108 188 105 206 C102 222 103 236 102 256 C100 290 96 330 92 372 C88 400 80 440 72 494 C66 506 60 524 57 544 C55 552 60 556 64 550 C63 566 63 590 70 602 C76 610 86 606 89 596 C92 580 91 550 90 520 C90 510 92 504 94 498 C100 460 108 420 113 386 C118 350 122 300 128 264 C131 250 136 240 144 240 C142 280 146 330 154 368 C158 392 150 410 144 436 C138 470 134 520 138 580 C140 620 144 650 148 676 C150 700 142 720 141 748 C140 790 150 830 156 856 C158 872 150 884 154 894 C160 904 182 908 192 902 C196 896 190 884 188 868 C186 840 192 790 194 760 C196 730 190 710 190 690 C190 650 194 590 197 540 C198 520 199 510 201 506 Z"></path>
<g>
<g fill="url(#fgMuscle)" stroke="#5C1A25" stroke-width="0.7">
<path d="M160 64 C160 56 164 50 168 46 C168 56 166 66 164 76 L159 84 C158 78 159 70 160 64 Z"></path>
<path d="M168 44 C178 30 192 26 201 26 L201 62 C190 60 178 62 164 66 C163 58 165 50 168 44 Z"></path>
<ellipse cx="184" cy="80" rx="11" ry="8.5"></ellipse>
<path d="M196 82 L201 82 L201 102 L193 102 Z"></path>
<path d="M168 94 C176 100 184 108 190 114 L187 117 C180 110 172 102 166 98 Z"></path>
<path d="M164 98 C164 110 168 120 174 126 L180 118 C178 110 174 102 170 96 Z"></path>
<path d="M201 108 C194 108 188 110 186 114 C188 119 194 121 201 121 Z"></path>
<path d="M193 136 L200 136 L200 172 L194 172 Z"></path>
<path d="M164 112 C176 130 188 152 197 170 L190 172 C180 156 168 134 160 116 Z"></path>
<path d="M181 146 C170 158 150 166 130 172 L134 178 C152 174 170 168 186 162 Z"></path>
<path d="M146 252 C154 256 162 262 168 268 C160 268 152 264 147 262 Z"></path>
<path d="M147 268 C156 272 164 278 170 284 C162 284 154 280 148 278 Z"></path>
<path d="M148 284 C156 288 164 294 170 300 C162 300 155 296 149 294 Z"></path>
<path d="M148 300 C152 330 156 360 158 384 C156 400 152 416 150 428 C162 442 176 454 187 464 L187 400 C185 360 182 320 178 290 C168 288 156 292 148 300 Z"></path>
<rect x="187" y="272" width="12" height="26" rx="4"></rect>
<rect x="187" y="302" width="12" height="30" rx="4"></rect>
<rect x="187" y="336" width="12" height="30" rx="4"></rect>
<rect x="187" y="370" width="12" height="96" rx="5"></rect>
<path d="M198 176 L198 262 C190 270 170 270 156 260 C146 252 136 240 128 226 C134 214 140 196 146 182 C160 178 176 176 198 176 Z"></path>
<path d="M132 172 C116 176 104 192 103 216 C102 234 106 250 112 262 C116 248 120 232 126 222 C132 210 138 196 144 184 Z"></path>
<path d="M122 264 C126 300 122 340 116 372 L113 364 C118 330 120 296 118 262 Z"></path>
<path d="M108 262 C102 292 100 330 104 362 C107 370 112 370 114 362 C120 330 124 292 122 262 C118 252 112 252 108 262 Z"></path>
<path d="M112 380 C116 410 108 450 94 494 L88 494 C96 456 102 418 104 384 Z"></path>
<path d="M96 372 C88 400 80 440 74 492 L80 494 C86 450 94 410 104 380 Z"></path>
<path d="M70 506 C62 520 60 536 64 546 C70 540 76 528 80 512 Z"></path>
<path d="M148 440 C142 456 140 474 142 490 L152 492 C152 474 154 456 156 444 Z"></path>
<path d="M192 500 C184 520 176 560 176 600 C182 610 188 600 192 590 C196 560 198 530 198 506 Z"></path>
<path d="M144 480 C138 520 138 590 148 650 C152 666 158 668 162 656 C156 600 152 530 152 486 Z"></path>
<path d="M176 590 C186 610 192 640 190 664 C184 672 174 670 170 658 C170 630 172 606 176 590 Z"></path>
<path d="M158 470 C152 520 154 590 162 650 C164 660 170 662 172 650 C176 590 172 520 164 474 Z"></path>
<path d="M150 436 C160 470 176 560 186 640 C188 660 190 676 190 690 L184 690 C182 670 178 650 174 630 C166 560 152 480 144 444 Z"></path>
<path d="M148 710 C142 740 146 790 154 836 L158 836 C152 790 150 740 154 712 Z"></path>
<path d="M156 700 C150 740 152 800 160 848 L166 848 C164 800 162 740 164 704 Z"></path>
<path d="M182 700 C194 720 196 760 190 790 C186 800 180 790 178 778 C176 750 176 720 182 700 Z"></path>
<path d="M178 790 C182 810 184 830 184 848 L178 848 C176 830 174 810 174 792 Z"></path>
</g>
<ellipse cx="184" cy="80" rx="5" ry="3" fill="#1A0A0D"></ellipse>
<path d="M188 114 L201 114" stroke="#1A0A0D" stroke-width="1.2"></path>
<ellipse cx="167" cy="680" rx="7" ry="10" fill="#E9DCCB" opacity="0.9"></ellipse>
<g fill="none" stroke="#E9DCCB" stroke-linecap="round">
<path d="M200.5 268 L200.5 470" stroke-width="1.6"></path>
<path d="M150 436 C164 450 180 466 196 480" stroke-width="1.4" opacity="0.7"></path>
<path d="M74 492 L94 496" stroke-width="2"></path>
<path d="M156 852 L188 852" stroke-width="2.4"></path>
<path d="M162 862 L160 894 M168 864 L170 898 M174 864 L180 900 M180 862 L188 898" stroke-width="1"></path>
</g>
<path d="M196 190 L132 222 M196 210 L132 226 M196 232 L134 230 M190 252 L136 234 M120 182 L114 250 M130 182 L122 236 M138 186 L130 220 M113 270 L110 356 M163 480 L166 648 M147 492 L154 650 M182 520 L180 596 M160 712 L162 840 M176 36 L172 62 M186 30 L184 60 M194 28 L194 60" fill="none" stroke="#F5B6BE" stroke-width="0.6" opacity="0.35"></path>
</g>
<g transform="matrix(-1 0 0 1 400 0)">
<g fill="url(#fgMuscle)" stroke="#5C1A25" stroke-width="0.7">
<path d="M160 64 C160 56 164 50 168 46 C168 56 166 66 164 76 L159 84 C158 78 159 70 160 64 Z"></path>
<path d="M168 44 C178 30 192 26 201 26 L201 62 C190 60 178 62 164 66 C163 58 165 50 168 44 Z"></path>
<ellipse cx="184" cy="80" rx="11" ry="8.5"></ellipse>
<path d="M196 82 L201 82 L201 102 L193 102 Z"></path>
<path d="M168 94 C176 100 184 108 190 114 L187 117 C180 110 172 102 166 98 Z"></path>
<path d="M164 98 C164 110 168 120 174 126 L180 118 C178 110 174 102 170 96 Z"></path>
<path d="M201 108 C194 108 188 110 186 114 C188 119 194 121 201 121 Z"></path>
<path d="M193 136 L200 136 L200 172 L194 172 Z"></path>
<path d="M164 112 C176 130 188 152 197 170 L190 172 C180 156 168 134 160 116 Z"></path>
<path d="M181 146 C170 158 150 166 130 172 L134 178 C152 174 170 168 186 162 Z"></path>
<path d="M146 252 C154 256 162 262 168 268 C160 268 152 264 147 262 Z"></path>
<path d="M147 268 C156 272 164 278 170 284 C162 284 154 280 148 278 Z"></path>
<path d="M148 284 C156 288 164 294 170 300 C162 300 155 296 149 294 Z"></path>
<path d="M148 300 C152 330 156 360 158 384 C156 400 152 416 150 428 C162 442 176 454 187 464 L187 400 C185 360 182 320 178 290 C168 288 156 292 148 300 Z"></path>
<rect x="187" y="272" width="12" height="26" rx="4"></rect>
<rect x="187" y="302" width="12" height="30" rx="4"></rect>
<rect x="187" y="336" width="12" height="30" rx="4"></rect>
<rect x="187" y="370" width="12" height="96" rx="5"></rect>
<path d="M198 176 L198 262 C190 270 170 270 156 260 C146 252 136 240 128 226 C134 214 140 196 146 182 C160 178 176 176 198 176 Z"></path>
<path d="M132 172 C116 176 104 192 103 216 C102 234 106 250 112 262 C116 248 120 232 126 222 C132 210 138 196 144 184 Z"></path>
<path d="M122 264 C126 300 122 340 116 372 L113 364 C118 330 120 296 118 262 Z"></path>
<path d="M108 262 C102 292 100 330 104 362 C107 370 112 370 114 362 C120 330 124 292 122 262 C118 252 112 252 108 262 Z"></path>
<path d="M112 380 C116 410 108 450 94 494 L88 494 C96 456 102 418 104 384 Z"></path>
<path d="M96 372 C88 400 80 440 74 492 L80 494 C86 450 94 410 104 380 Z"></path>
<path d="M70 506 C62 520 60 536 64 546 C70 540 76 528 80 512 Z"></path>
<path d="M148 440 C142 456 140 474 142 490 L152 492 C152 474 154 456 156 444 Z"></path>
<path d="M192 500 C184 520 176 560 176 600 C182 610 188 600 192 590 C196 560 198 530 198 506 Z"></path>
<path d="M144 480 C138 520 138 590 148 650 C152 666 158 668 162 656 C156 600 152 530 152 486 Z"></path>
<path d="M176 590 C186 610 192 640 190 664 C184 672 174 670 170 658 C170 630 172 606 176 590 Z"></path>
<path d="M158 470 C152 520 154 590 162 650 C164 660 170 662 172 650 C176 590 172 520 164 474 Z"></path>
<path d="M150 436 C160 470 176 560 186 640 C188 660 190 676 190 690 L184 690 C182 670 178 650 174 630 C166 560 152 480 144 444 Z"></path>
<path d="M148 710 C142 740 146 790 154 836 L158 836 C152 790 150 740 154 712 Z"></path>
<path d="M156 700 C150 740 152 800 160 848 L166 848 C164 800 162 740 164 704 Z"></path>
<path d="M182 700 C194 720 196 760 190 790 C186 800 180 790 178 778 C176 750 176 720 182 700 Z"></path>
<path d="M178 790 C182 810 184 830 184 848 L178 848 C176 830 174 810 174 792 Z"></path>
</g>
<ellipse cx="184" cy="80" rx="5" ry="3" fill="#1A0A0D"></ellipse>
<path d="M188 114 L201 114" stroke="#1A0A0D" stroke-width="1.2"></path>
<ellipse cx="167" cy="680" rx="7" ry="10" fill="#E9DCCB" opacity="0.9"></ellipse>
<g fill="none" stroke="#E9DCCB" stroke-linecap="round">
<path d="M200.5 268 L200.5 470" stroke-width="1.6"></path>
<path d="M150 436 C164 450 180 466 196 480" stroke-width="1.4" opacity="0.7"></path>
<path d="M74 492 L94 496" stroke-width="2"></path>
<path d="M156 852 L188 852" stroke-width="2.4"></path>
<path d="M162 862 L160 894 M168 864 L170 898 M174 864 L180 900 M180 862 L188 898" stroke-width="1"></path>
</g>
<path d="M196 190 L132 222 M196 210 L132 226 M196 232 L134 230 M190 252 L136 234 M120 182 L114 250 M130 182 L122 236 M138 186 L130 220 M113 270 L110 356 M163 480 L166 648 M147 492 L154 650 M182 520 L180 596 M160 712 L162 840 M176 36 L172 62 M186 30 L184 60 M194 28 L194 60" fill="none" stroke="#F5B6BE" stroke-width="0.6" opacity="0.35"></path>
</g>`;

const LAYER_NERVOUS = `<path d="M200 30 C222 30 236 42 236 58 C236 70 230 78 220 82 L180 82 C170 78 164 70 164 58 C164 42 178 30 200 30 Z" fill="url(#fgBrain)" stroke="#8A6514" stroke-width="0.8"></path>
<path d="M200 31 L200 81" fill="none" stroke="#8A6514" stroke-width="1.4"></path>
<g fill="none" stroke="#8A6514" stroke-width="1.1" stroke-linecap="round">
<path d="M170 50 C176 42 184 50 190 42 C194 38 196 44 198 40 M166 60 C172 54 178 64 186 56 C190 52 194 60 198 54 M168 70 C176 64 182 74 190 66 C194 62 196 70 198 66 M174 78 C180 74 186 80 192 76"></path>
<path transform="matrix(-1 0 0 1 400 0)" d="M170 50 C176 42 184 50 190 42 C194 38 196 44 198 40 M166 60 C172 54 178 64 186 56 C190 52 194 60 198 54 M168 70 C176 64 182 74 190 66 C194 62 196 70 198 66 M174 78 C180 74 186 80 192 76"></path>
</g>
<g filter="url(#fgGlow)" fill="none" stroke="#F2C14E" stroke-linecap="round" stroke-linejoin="round">
<path d="M200 82 L200 96" stroke-width="5"></path>
<path d="M200 96 L200 362" stroke-width="4"></path>
<path d="M200 362 L194 470 M200 362 L206 470 M200 362 L200 484 M200 362 L190 456 M200 362 L210 456" stroke-width="1.2"></path>
<g>
<path d="M200 190 L160 200 M200 208 L156 218 M200 226 L152 236 M200 244 L150 254 M200 262 L150 272 M200 280 L152 290 M200 298 L156 308 M200 316 L160 326" stroke-width="0.8" opacity="0.8"></path>
<path d="M198 158 C180 180 160 200 140 232" stroke-width="2.2"></path>
<path d="M140 232 C126 290 116 340 108 380 C102 420 92 460 84 500" stroke-width="1.8"></path>
<path d="M142 236 C130 300 118 360 112 384 C108 430 96 470 90 502" stroke-width="1.4"></path>
<path d="M138 234 C116 260 104 300 100 360 C92 410 82 450 74 492" stroke-width="1.4"></path>
<path d="M84 500 L72 556 L68 590 M84 500 L78 598 M86 502 L86 594 M90 502 L90 580 M80 500 L62 546" stroke-width="0.8"></path>
<path d="M162 104 L176 96 M162 106 L178 108 M162 108 L180 118 M162 104 L170 88" stroke-width="0.9"></path>
<path d="M198 430 C186 450 170 470 162 500 C158 540 160 580 164 620 M162 500 C170 530 176 560 180 600" stroke-width="1.8"></path>
<path d="M198 478 C186 500 176 520 172 560 C168 620 168 680 168 700" stroke-width="2.6"></path>
<path d="M168 700 C170 760 172 820 176 860 L176 896 M176 860 L186 898" stroke-width="1.6"></path>
<path d="M168 700 C160 720 156 780 160 850 L166 896" stroke-width="1.2"></path>
</g>
<g transform="matrix(-1 0 0 1 400 0)">
<path d="M200 190 L160 200 M200 208 L156 218 M200 226 L152 236 M200 244 L150 254 M200 262 L150 272 M200 280 L152 290 M200 298 L156 308 M200 316 L160 326" stroke-width="0.8" opacity="0.8"></path>
<path d="M198 158 C180 180 160 200 140 232" stroke-width="2.2"></path>
<path d="M140 232 C126 290 116 340 108 380 C102 420 92 460 84 500" stroke-width="1.8"></path>
<path d="M142 236 C130 300 118 360 112 384 C108 430 96 470 90 502" stroke-width="1.4"></path>
<path d="M138 234 C116 260 104 300 100 360 C92 410 82 450 74 492" stroke-width="1.4"></path>
<path d="M84 500 L72 556 L68 590 M84 500 L78 598 M86 502 L86 594 M90 502 L90 580 M80 500 L62 546" stroke-width="0.8"></path>
<path d="M162 104 L176 96 M162 106 L178 108 M162 108 L180 118 M162 104 L170 88" stroke-width="0.9"></path>
<path d="M198 430 C186 450 170 470 162 500 C158 540 160 580 164 620 M162 500 C170 530 176 560 180 600" stroke-width="1.8"></path>
<path d="M198 478 C186 500 176 520 172 560 C168 620 168 680 168 700" stroke-width="2.6"></path>
<path d="M168 700 C170 760 172 820 176 860 L176 896 M176 860 L186 898" stroke-width="1.6"></path>
<path d="M168 700 C160 720 156 780 160 850 L166 896" stroke-width="1.2"></path>
</g>
</g>`;

const LAYER_CARDIOVASCULAR = `<g filter="url(#fgGlow)" fill="none" stroke-linecap="round" stroke-linejoin="round">
<g stroke="#4C7DF0">
<path d="M194 228 L194 182" stroke-width="5"></path>
<path d="M194 252 L194 300 C194 360 196 400 198 424" stroke-width="5.5"></path>
<path d="M202 228 C198 220 192 214 182 218 C174 222 166 230 160 240 M204 228 C210 220 220 216 232 222 C238 226 242 234 244 242" stroke-width="3"></path>
<path d="M194 348 L184 356 M194 348 L216 356 M194 312 L178 318" stroke-width="2"></path>
<g>
<path d="M194 182 C180 180 164 186 150 198 C144 210 142 222 142 232" stroke-width="3"></path>
<path d="M142 232 C132 280 122 340 116 380 C112 420 100 464 92 500" stroke-width="2"></path>
<path d="M150 184 C130 180 114 196 106 230 C100 290 96 340 94 376 C88 420 78 460 72 494" stroke-width="1.8"></path>
<path d="M96 380 L114 372" stroke-width="1.4"></path>
<path d="M190 182 C186 160 182 140 178 124" stroke-width="2.6"></path>
<path d="M170 102 C160 88 160 66 166 50" stroke-width="1.2"></path>
<path d="M198 424 C192 436 182 450 180 466" stroke-width="3.4"></path>
<path d="M180 466 C177 520 176 590 182 640 C184 662 182 684 178 700" stroke-width="2.6"></path>
<path d="M182 470 C190 520 194 600 192 680 C192 740 190 810 186 860 L182 896" stroke-width="1.8"></path>
<path d="M178 700 C186 760 188 820 188 862" stroke-width="1.4"></path>
</g>
<g transform="matrix(-1 0 0 1 400 0)">
<path d="M194 182 C180 180 164 186 150 198 C144 210 142 222 142 232" stroke-width="3"></path>
<path d="M142 232 C132 280 122 340 116 380 C112 420 100 464 92 500" stroke-width="2"></path>
<path d="M150 184 C130 180 114 196 106 230 C100 290 96 340 94 376 C88 420 78 460 72 494" stroke-width="1.8"></path>
<path d="M96 380 L114 372" stroke-width="1.4"></path>
<path d="M190 182 C186 160 182 140 178 124" stroke-width="2.6"></path>
<path d="M170 102 C160 88 160 66 166 50" stroke-width="1.2"></path>
<path d="M198 424 C192 436 182 450 180 466" stroke-width="3.4"></path>
<path d="M180 466 C177 520 176 590 182 640 C184 662 182 684 178 700" stroke-width="2.6"></path>
<path d="M182 470 C190 520 194 600 192 680 C192 740 190 810 186 860 L182 896" stroke-width="1.8"></path>
<path d="M178 700 C186 760 188 820 188 862" stroke-width="1.4"></path>
</g>
</g>
<g stroke="#E5484D">
<path d="M206 224 C204 208 212 196 222 198 C230 200 230 212 222 222" stroke-width="6"></path>
<path d="M222 222 C214 240 206 262 204 290 C204 360 202 400 200 420" stroke-width="5"></path>
<path d="M210 200 C204 190 196 182 190 178" stroke-width="3.4"></path>
<path d="M216 199 L210 178" stroke-width="2.6"></path>
<path d="M204 336 L184 350 M204 336 L216 350" stroke-width="2"></path>
<path d="M210 246 C200 244 182 246 168 254 M214 250 C224 248 236 252 244 258" stroke-width="2"></path>
<g>
<path d="M190 176 C188 160 186 140 182 126 C180 116 176 108 172 100" stroke-width="2.6"></path>
<path d="M172 100 C164 88 164 70 170 52 C174 44 180 38 186 34" stroke-width="1.2"></path>
<path d="M182 126 C184 116 186 108 184 98" stroke-width="1.2"></path>
<path d="M190 178 C176 178 160 184 146 196 C140 206 138 216 138 228" stroke-width="3"></path>
<path d="M138 228 C130 270 120 330 112 376" stroke-width="2.4"></path>
<path d="M112 376 C104 410 90 456 80 496" stroke-width="1.8"></path>
<path d="M112 376 C110 420 100 460 90 500" stroke-width="1.6"></path>
<path d="M80 498 C76 522 90 530 92 502" stroke-width="1.2"></path>
<path d="M78 520 L66 548 M82 528 L72 590 M86 530 L80 600 M90 528 L88 596" stroke-width="0.9"></path>
<path d="M200 420 C194 432 184 446 174 464" stroke-width="3.6"></path>
<path d="M174 464 C170 520 170 590 176 640 C178 662 176 684 172 700" stroke-width="2.8"></path>
<path d="M172 480 C162 510 158 540 158 570" stroke-width="1.6"></path>
<path d="M170 704 C162 760 164 820 168 860 L172 896" stroke-width="1.6"></path>
<path d="M176 704 C184 760 186 820 186 862 L184 890" stroke-width="1.6"></path>
</g>
<g transform="matrix(-1 0 0 1 400 0)">
<path d="M190 176 C188 160 186 140 182 126 C180 116 176 108 172 100" stroke-width="2.6"></path>
<path d="M172 100 C164 88 164 70 170 52 C174 44 180 38 186 34" stroke-width="1.2"></path>
<path d="M182 126 C184 116 186 108 184 98" stroke-width="1.2"></path>
<path d="M190 178 C176 178 160 184 146 196 C140 206 138 216 138 228" stroke-width="3"></path>
<path d="M138 228 C130 270 120 330 112 376" stroke-width="2.4"></path>
<path d="M112 376 C104 410 90 456 80 496" stroke-width="1.8"></path>
<path d="M112 376 C110 420 100 460 90 500" stroke-width="1.6"></path>
<path d="M80 498 C76 522 90 530 92 502" stroke-width="1.2"></path>
<path d="M78 520 L66 548 M82 528 L72 590 M86 530 L80 600 M90 528 L88 596" stroke-width="0.9"></path>
<path d="M200 420 C194 432 184 446 174 464" stroke-width="3.6"></path>
<path d="M174 464 C170 520 170 590 176 640 C178 662 176 684 172 700" stroke-width="2.8"></path>
<path d="M172 480 C162 510 158 540 158 570" stroke-width="1.6"></path>
<path d="M170 704 C162 760 164 820 168 860 L172 896" stroke-width="1.6"></path>
<path d="M176 704 C184 760 186 820 186 862 L184 890" stroke-width="1.6"></path>
</g>
</g>
</g>
<path d="M196 222 C190 230 190 246 198 258 C204 268 214 276 220 280 C228 270 234 256 232 242 C230 228 220 220 210 224 C206 218 200 218 196 222 Z" fill="url(#fgHeart)" stroke="#6B1520" stroke-width="0.8"></path>
<path d="M196 222 C190 228 190 240 194 248 C198 242 200 232 200 224 Z" fill="#3E63C8" opacity="0.9"></path>
<path d="M206 236 C214 246 220 260 222 274 M214 232 C222 240 228 250 230 262" fill="none" stroke="#FFB3B5" stroke-width="1" opacity="0.7"></path>`;

const LAYER_LYMPHATIC = `<g filter="url(#fgGlow)">
<path d="M194 192 C190 200 192 214 198 218 L200 210 L202 218 C208 214 210 200 206 192 C204 188 196 188 194 192 Z" fill="#3FC7A8" opacity="0.8"></path>
<path d="M198 384 C198 330 196 270 198 220 C200 200 206 188 214 184" fill="none" stroke="#3FC7A8" stroke-width="1.6" stroke-linecap="round"></path>
<ellipse cx="198" cy="380" rx="3.2" ry="7" fill="#3FC7A8"></ellipse>
<path d="M232 302 C242 302 248 312 246 324 C244 334 236 338 230 332 C226 324 226 310 232 302 Z" fill="#24927B" stroke="#9BF0DA" stroke-width="0.8"></path>
<g fill="none" stroke="#3FC7A8" stroke-width="1.1" stroke-linecap="round" opacity="0.85">
<path d="M178 124 C180 140 184 160 194 186 M146 240 C134 290 120 340 112 376 C106 420 94 460 84 500 L76 560 M150 250 C140 300 128 350 120 380 M146 250 C156 280 166 320 172 360 C176 400 176 440 174 468 M180 476 C186 440 192 410 198 384 M176 474 C174 540 178 620 178 690 C176 760 174 820 176 864 L176 896 M184 486 C190 560 190 630 184 690"></path>
<path transform="matrix(-1 0 0 1 400 0)" d="M178 124 C180 140 184 160 194 186 M146 240 C134 290 120 340 112 376 C106 420 94 460 84 500 L76 560 M150 250 C140 300 128 350 120 380 M146 250 C156 280 166 320 172 360 C176 400 176 440 174 468 M180 476 C186 440 192 410 198 384 M176 474 C174 540 178 620 178 690 C176 760 174 820 176 864 L176 896 M184 486 C190 560 190 630 184 690"></path>
</g>
</g>
<g fill="#9BF0DA" stroke="#1F8A73" stroke-width="1">
<circle cx="190" cy="396" r="3"></circle><circle cx="204" cy="388" r="3"></circle><circle cx="214" cy="400" r="3"></circle><circle cx="198" cy="410" r="3"></circle><circle cx="186" cy="412" r="3"></circle>
<g>
<circle cx="176" cy="128" r="2.8"></circle><circle cx="180" cy="138" r="2.8"></circle><circle cx="178" cy="150" r="2.8"></circle><circle cx="184" cy="158" r="2.8"></circle>
<circle cx="146" cy="236" r="2.8"></circle><circle cx="150" cy="246" r="2.8"></circle><circle cx="142" cy="246" r="2.8"></circle><circle cx="148" cy="256" r="2.8"></circle>
<circle cx="112" cy="374" r="2.8"></circle>
<circle cx="172" cy="470" r="2.8"></circle><circle cx="180" cy="476" r="2.8"></circle><circle cx="168" cy="480" r="2.8"></circle><circle cx="186" cy="484" r="2.8"></circle>
<circle cx="178" cy="690" r="2.8"></circle><circle cx="172" cy="698" r="2.8"></circle>
</g>
<g transform="matrix(-1 0 0 1 400 0)">
<circle cx="176" cy="128" r="2.8"></circle><circle cx="180" cy="138" r="2.8"></circle><circle cx="178" cy="150" r="2.8"></circle><circle cx="184" cy="158" r="2.8"></circle>
<circle cx="146" cy="236" r="2.8"></circle><circle cx="150" cy="246" r="2.8"></circle><circle cx="142" cy="246" r="2.8"></circle><circle cx="148" cy="256" r="2.8"></circle>
<circle cx="112" cy="374" r="2.8"></circle>
<circle cx="172" cy="470" r="2.8"></circle><circle cx="180" cy="476" r="2.8"></circle><circle cx="168" cy="480" r="2.8"></circle><circle cx="186" cy="484" r="2.8"></circle>
<circle cx="178" cy="690" r="2.8"></circle><circle cx="172" cy="698" r="2.8"></circle>
</g>
</g>`;

const LAYER_RESPIRATORY = `<path d="M190 196 C176 196 160 210 152 236 C146 260 146 292 150 316 C164 318 180 314 194 306 C196 280 194 240 192 210 Z" fill="url(#fgLung)" fill-opacity="0.94" stroke="#A8506C" stroke-width="0.8"></path>
<path d="M210 196 C224 196 240 210 248 236 C254 260 254 292 250 316 C236 318 222 314 208 306 C212 296 218 288 216 276 C214 268 208 264 206 258 C206 240 206 220 210 196 Z" fill="url(#fgLung)" fill-opacity="0.94" stroke="#A8506C" stroke-width="0.8"></path>
<path d="M152 260 C168 256 180 262 192 250 M156 292 C170 286 184 290 194 286 M248 256 C232 262 220 272 214 280" fill="none" stroke="#A8506C" stroke-width="1" opacity="0.8"></path>
<path d="M178 236 L166 252 L158 270 M178 236 L170 268 L166 296 M178 236 L184 270 L180 300 M166 252 L156 250 M170 268 L160 282 M222 236 L234 252 L242 270 M222 236 L230 268 L234 296 M222 236 L216 270 L220 300 M234 252 L244 250 M230 268 L240 282" fill="none" stroke="#B9607C" stroke-width="1.4" stroke-linecap="round" opacity="0.85"></path>
<path d="M200 212 C196 222 188 228 178 236 M200 212 C206 222 214 228 222 236" fill="none" stroke="#F39BB4" stroke-width="5" stroke-linecap="round"></path>
<path d="M200 148 L200 214" fill="none" stroke="#F39BB4" stroke-width="8"></path>
<path d="M200 148 L200 214" fill="none" stroke="#B9607C" stroke-width="8" stroke-dasharray="1.3 3"></path>
<path d="M193 132 L207 132 L205 148 L195 148 Z" fill="#F39BB4" stroke="#A8506C" stroke-width="0.8"></path>
<path d="M148 320 C168 300 190 308 200 316 C210 308 232 300 252 320" fill="none" stroke="#F7C6D4" stroke-width="2.2" opacity="0.55"></path>`;

const LAYER_DIGESTIVE = `<path d="M201 140 C201 200 203 262 212 300" fill="none" stroke="#B5663F" stroke-width="6" stroke-linecap="round"></path>
<path d="M201 140 C201 200 203 262 212 300" fill="none" stroke="#EDB088" stroke-width="2.6" stroke-linecap="round"></path>
<path d="M196 362 C210 356 226 354 240 350 C244 356 236 364 222 368 C210 370 200 370 196 362 Z" fill="#D9A05B" stroke="#8C5E25" stroke-width="0.7"></path>
<path d="M210 298 C222 292 236 298 242 310 C250 326 250 344 240 356 C230 366 212 368 200 362 C194 358 196 350 204 348 C216 346 224 340 226 330 C226 320 220 310 210 304 Z" fill="url(#fgStomach)" stroke="#8A4A33" stroke-width="0.8"></path>
<path d="M232 314 C238 328 238 344 230 354 M223 320 C229 332 227 346 217 354" fill="none" stroke="#B36A48" stroke-width="1" opacity="0.6"></path>
<path d="M150 318 C170 306 196 312 214 318 C226 320 236 324 240 330 C228 340 210 348 196 350 C180 354 162 354 152 348 C146 340 146 328 150 318 Z" fill="url(#fgLiver)" stroke="#4A1A14" stroke-width="0.8"></path>
<path d="M202 314 C204 326 206 338 208 347" fill="none" stroke="#4A1A14" stroke-width="1" opacity="0.7"></path>
<path d="M166 322 C176 318 190 318 200 322" fill="none" stroke="#D27A66" stroke-width="1.2" opacity="0.45"></path>
<ellipse cx="172" cy="355" rx="5" ry="7" fill="#7DB86A" stroke="#3E6B33" stroke-width="0.7"></ellipse>
<path d="M180 392 C190 384 200 396 210 388 C222 382 228 396 218 402 C206 410 196 398 186 404 C176 410 178 422 190 420 C202 418 210 412 220 418 C230 426 222 436 210 432 C198 428 190 436 184 440 C178 446 186 456 198 450 C208 444 216 448 222 452" fill="none" stroke="#8E4E39" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M180 392 C190 384 200 396 210 388 C222 382 228 396 218 402 C206 410 196 398 186 404 C176 410 178 422 190 420 C202 418 210 412 220 418 C230 426 222 436 210 432 C198 428 190 436 184 440 C178 446 186 456 198 450 C208 444 216 448 222 452" fill="none" stroke="#E3A182" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M180 392 C190 384 200 396 210 388 C222 382 228 396 218 402 C206 410 196 398 186 404 C176 410 178 422 190 420 C202 418 210 412 220 418 C230 426 222 436 210 432 C198 428 190 436 184 440 C178 446 186 456 198 450 C208 444 216 448 222 452" fill="none" stroke="#F6CDB5" stroke-width="1.6" stroke-linecap="round" opacity="0.5"></path>
<path d="M166 452 C160 460 161 468 166 470" fill="none" stroke="#C97B5A" stroke-width="3.5" stroke-linecap="round"></path>
<path d="M168 446 C160 430 158 400 162 376 C170 366 186 372 200 370 C214 368 228 366 238 374 C244 390 244 420 240 440 C236 456 222 462 210 466 C204 468 200 474 200 484" fill="none" stroke="#7A3F2A" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M168 446 C160 430 158 400 162 376 C170 366 186 372 200 370 C214 368 228 366 238 374 C244 390 244 420 240 440 C236 456 222 462 210 466 C204 468 200 474 200 484" fill="none" stroke="#C97B5A" stroke-width="11.5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M168 446 C160 430 158 400 162 376 C170 366 186 372 200 370 C214 368 228 366 238 374 C244 390 244 420 240 440 C236 456 222 462 210 466 C204 468 200 474 200 484" fill="none" stroke="#9B5A40" stroke-width="11.5" stroke-dasharray="1.8 7" opacity="0.7"></path>`;

const LAYER_URINARY = `<g>
<path d="M166 330 C168 320 178 318 184 328 C178 330 172 332 166 330 Z" fill="#D7BCFF"></path>
<path d="M176 330 C166 330 160 340 160 352 C160 366 166 376 176 376 C182 376 186 370 184 364 C182 358 182 350 184 344 C186 336 182 330 176 330 Z" fill="url(#fgKidney)" stroke="#4E2C86" stroke-width="0.8"></path>
<path d="M184 348 C178 348 174 354 176 360 C178 364 182 362 184 358" fill="#DCC8FB"></path>
<path d="M184 358 C188 384 190 420 192 450 C193 464 194 472 192 478" fill="none" stroke="#B794F0" stroke-width="2.2" stroke-linecap="round"></path>
</g>
<g transform="matrix(-1 0 0 1 400 0)">
<path d="M166 330 C168 320 178 318 184 328 C178 330 172 332 166 330 Z" fill="#D7BCFF"></path>
<path d="M176 330 C166 330 160 340 160 352 C160 366 166 376 176 376 C182 376 186 370 184 364 C182 358 182 350 184 344 C186 336 182 330 176 330 Z" fill="url(#fgKidney)" stroke="#4E2C86" stroke-width="0.8"></path>
<path d="M184 348 C178 348 174 354 176 360 C178 364 182 362 184 358" fill="#DCC8FB"></path>
<path d="M184 358 C188 384 190 420 192 450 C193 464 194 472 192 478" fill="none" stroke="#B794F0" stroke-width="2.2" stroke-linecap="round"></path>
</g>
<path d="M188 476 C186 486 190 498 200 500 C210 498 214 486 212 476 C206 472 194 472 188 476 Z" fill="#B794F0" stroke="#6B44A8" stroke-width="0.8"></path>
<path d="M200 500 L200 508" stroke="#B794F0" stroke-width="2" stroke-linecap="round"></path>`;

const LAYER_SKELETAL = `<g>
<path d="M126 180 C138 186 150 200 156 250 C150 254 144 254 140 250 C134 228 128 204 124 184 Z" fill="#E9E1CF" opacity="0.3"></path>
<path d="M200 446 C192 436 184 424 172 418 C162 414 152 416 149 428 C147 440 151 454 158 462 C162 468 164 474 168 480 C174 490 184 498 200 502 L200 494 C192 490 186 484 184 476 C182 466 190 458 200 458 Z" fill="url(#fgBone)" stroke="#6F6757" stroke-width="0.8"></path>
<ellipse cx="166" cy="436" rx="9" ry="11" fill="#CFC5B0" opacity="0.55"></ellipse>
<g fill="none" stroke="#5E5748" stroke-linecap="round" stroke-linejoin="round">
<path d="M121 198 C116 250 110 310 104 362" stroke-width="11"></path>
<path d="M110 378 C104 420 96 460 90 494" stroke-width="7"></path>
<path d="M99 380 C92 420 82 460 74 494" stroke-width="7.5"></path>
<path d="M74 508 L64 532 L58 546 M79 512 L72 552 L68 572 L68 590 M83 512 L78 556 L77 578 L78 598 M87 512 L84 556 L85 576 L86 594 M90 510 L89 550 L90 568 L90 582" stroke-width="4.4"></path>
<path d="M160 466 L144 474" stroke-width="10"></path>
<path d="M144 482 C148 540 156 610 164 664" stroke-width="12"></path>
<path d="M169 696 C169 750 170 810 171 852" stroke-width="11"></path>
<path d="M155 702 C156 760 158 810 160 854" stroke-width="6"></path>
<path d="M160 870 L154 894 M166 872 L164 900 M172 872 L174 902 M178 872 L183 902 M184 870 L192 898" stroke-width="4.4"></path>
</g>
<g fill="none" stroke="#EDE6D6" stroke-linecap="round" stroke-linejoin="round">
<path d="M121 198 C116 250 110 310 104 362" stroke-width="8.6"></path>
<path d="M110 378 C104 420 96 460 90 494" stroke-width="5"></path>
<path d="M99 380 C92 420 82 460 74 494" stroke-width="5.5"></path>
<path d="M74 508 L64 532 L58 546 M79 512 L72 552 L68 572 L68 590 M83 512 L78 556 L77 578 L78 598 M87 512 L84 556 L85 576 L86 594 M90 510 L89 550 L90 568 L90 582" stroke-width="2.8"></path>
<path d="M160 466 L144 474" stroke-width="8"></path>
<path d="M144 482 C148 540 156 610 164 664" stroke-width="9.5"></path>
<path d="M169 696 C169 750 170 810 171 852" stroke-width="8.5"></path>
<path d="M155 702 C156 760 158 810 160 854" stroke-width="4"></path>
<path d="M160 870 L154 894 M166 872 L164 900 M172 872 L174 902 M178 872 L183 902 M184 870 L192 898" stroke-width="3"></path>
</g>
<g fill="url(#fgBone)" stroke="#6F6757" stroke-width="0.8">
<circle cx="123" cy="192" r="10"></circle>
<ellipse cx="103" cy="368" rx="11" ry="6"></ellipse>
<ellipse cx="83" cy="503" rx="11" ry="7"></ellipse>
<circle cx="160" cy="466" r="9"></circle>
<circle cx="143" cy="476" r="7"></circle>
<ellipse cx="166" cy="672" rx="14" ry="7"></ellipse>
<ellipse cx="169" cy="694" rx="13" ry="5"></ellipse>
<ellipse cx="167" cy="684" rx="7" ry="8"></ellipse>
<ellipse cx="170" cy="864" rx="11" ry="6"></ellipse>
<circle cx="178" cy="856" r="4"></circle>
</g>
</g>
<g transform="matrix(-1 0 0 1 400 0)">
<path d="M126 180 C138 186 150 200 156 250 C150 254 144 254 140 250 C134 228 128 204 124 184 Z" fill="#E9E1CF" opacity="0.3"></path>
<path d="M200 446 C192 436 184 424 172 418 C162 414 152 416 149 428 C147 440 151 454 158 462 C162 468 164 474 168 480 C174 490 184 498 200 502 L200 494 C192 490 186 484 184 476 C182 466 190 458 200 458 Z" fill="url(#fgBone)" stroke="#6F6757" stroke-width="0.8"></path>
<ellipse cx="166" cy="436" rx="9" ry="11" fill="#CFC5B0" opacity="0.55"></ellipse>
<g fill="none" stroke="#5E5748" stroke-linecap="round" stroke-linejoin="round">
<path d="M121 198 C116 250 110 310 104 362" stroke-width="11"></path>
<path d="M110 378 C104 420 96 460 90 494" stroke-width="7"></path>
<path d="M99 380 C92 420 82 460 74 494" stroke-width="7.5"></path>
<path d="M74 508 L64 532 L58 546 M79 512 L72 552 L68 572 L68 590 M83 512 L78 556 L77 578 L78 598 M87 512 L84 556 L85 576 L86 594 M90 510 L89 550 L90 568 L90 582" stroke-width="4.4"></path>
<path d="M160 466 L144 474" stroke-width="10"></path>
<path d="M144 482 C148 540 156 610 164 664" stroke-width="12"></path>
<path d="M169 696 C169 750 170 810 171 852" stroke-width="11"></path>
<path d="M155 702 C156 760 158 810 160 854" stroke-width="6"></path>
<path d="M160 870 L154 894 M166 872 L164 900 M172 872 L174 902 M178 872 L183 902 M184 870 L192 898" stroke-width="4.4"></path>
</g>
<g fill="none" stroke="#EDE6D6" stroke-linecap="round" stroke-linejoin="round">
<path d="M121 198 C116 250 110 310 104 362" stroke-width="8.6"></path>
<path d="M110 378 C104 420 96 460 90 494" stroke-width="5"></path>
<path d="M99 380 C92 420 82 460 74 494" stroke-width="5.5"></path>
<path d="M74 508 L64 532 L58 546 M79 512 L72 552 L68 572 L68 590 M83 512 L78 556 L77 578 L78 598 M87 512 L84 556 L85 576 L86 594 M90 510 L89 550 L90 568 L90 582" stroke-width="2.8"></path>
<path d="M160 466 L144 474" stroke-width="8"></path>
<path d="M144 482 C148 540 156 610 164 664" stroke-width="9.5"></path>
<path d="M169 696 C169 750 170 810 171 852" stroke-width="8.5"></path>
<path d="M155 702 C156 760 158 810 160 854" stroke-width="4"></path>
<path d="M160 870 L154 894 M166 872 L164 900 M172 872 L174 902 M178 872 L183 902 M184 870 L192 898" stroke-width="3"></path>
</g>
<g fill="url(#fgBone)" stroke="#6F6757" stroke-width="0.8">
<circle cx="123" cy="192" r="10"></circle>
<ellipse cx="103" cy="368" rx="11" ry="6"></ellipse>
<ellipse cx="83" cy="503" rx="11" ry="7"></ellipse>
<circle cx="160" cy="466" r="9"></circle>
<circle cx="143" cy="476" r="7"></circle>
<ellipse cx="166" cy="672" rx="14" ry="7"></ellipse>
<ellipse cx="169" cy="694" rx="13" ry="5"></ellipse>
<ellipse cx="167" cy="684" rx="7" ry="8"></ellipse>
<ellipse cx="170" cy="864" rx="11" ry="6"></ellipse>
<circle cx="178" cy="856" r="4"></circle>
</g>
</g>
<g fill="url(#fgBone)" stroke="#6F6757" stroke-width="0.8">
<rect x="193" y="138" width="14" height="4" rx="1.5"></rect>
<rect x="193" y="143" width="14" height="4" rx="1.5"></rect>
<rect x="193" y="148" width="14" height="4" rx="1.5"></rect>
<rect x="193" y="153" width="14" height="4" rx="1.5"></rect>
<rect x="193" y="158" width="14" height="4" rx="1.5"></rect>
<rect x="193" y="163" width="14" height="4" rx="1.5"></rect>
<rect x="193" y="168" width="14" height="4" rx="1.5"></rect>
<rect x="192" y="174" width="16" height="11" rx="3"></rect>
<rect x="192" y="188.5" width="16" height="11" rx="3"></rect>
<rect x="192" y="203" width="16" height="11" rx="3"></rect>
<rect x="192" y="217.5" width="16" height="11" rx="3"></rect>
<rect x="192" y="232" width="16" height="11" rx="3"></rect>
<rect x="192" y="246.5" width="16" height="11" rx="3"></rect>
<rect x="192" y="261" width="16" height="11" rx="3"></rect>
<rect x="192" y="275.5" width="16" height="11" rx="3"></rect>
<rect x="192" y="290" width="16" height="11" rx="3"></rect>
<rect x="192" y="304.5" width="16" height="11" rx="3"></rect>
<rect x="192" y="319" width="16" height="11" rx="3"></rect>
<rect x="192" y="333.5" width="16" height="11" rx="3"></rect>
<rect x="189" y="350" width="22" height="15" rx="4"></rect>
<rect x="189" y="368" width="22" height="15" rx="4"></rect>
<rect x="189" y="386" width="22" height="15" rx="4"></rect>
<rect x="189" y="404" width="22" height="15" rx="4"></rect>
<rect x="189" y="422" width="22" height="15" rx="4"></rect>
<path d="M186 442 L214 442 L207 492 L193 492 Z"></path>
<path d="M196 494 L204 494 L200 506 Z"></path>
<path d="M200 22 C224 22 240 40 240 64 C240 80 236 90 232 96 C230 104 226 108 222 110 L178 110 C174 108 170 104 168 96 C164 90 160 80 160 64 C160 40 176 22 200 22 Z"></path>
<path d="M168 98 C168 112 174 124 186 131 C192 134 208 134 214 131 C226 124 232 112 232 98 L226 100 C224 112 218 120 208 124 L192 124 C182 120 176 112 174 100 Z"></path>
</g>
<g fill="#6F6757">
<circle cx="194" cy="454" r="1.6"></circle><circle cx="206" cy="454" r="1.6"></circle>
<circle cx="195" cy="466" r="1.6"></circle><circle cx="205" cy="466" r="1.6"></circle>
<circle cx="196" cy="478" r="1.5"></circle><circle cx="204" cy="478" r="1.5"></circle>
</g>
<g fill="#0B0E13" opacity="0.9">
<ellipse cx="185" cy="80" rx="10" ry="9"></ellipse>
<ellipse cx="215" cy="80" rx="10" ry="9"></ellipse>
<path d="M200 88 C196 92 193 100 195 104 L205 104 C207 100 204 92 200 88 Z"></path>
</g>
<path d="M170 92 C176 96 184 96 190 94 M210 94 C216 96 224 96 230 92" fill="none" stroke="#6F6757" stroke-width="1"></path>
<path d="M185 109.5 L215 109.5 M187 118.5 L213 118.5" fill="none" stroke="#F3EDE1" stroke-width="6" stroke-dasharray="2.4 1.2"></path>
</g>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<g>
<path d="M193 182 C182 180 176 172 166 184 C163 194 166 206 172 212 M193 194 C182 192 168 184 158 196 C155 206 158 218 164 224 M193 206 C182 204 162 196 152 208 C149 218 152 230 158 236 M193 218 C182 216 160 208 150 220 C147 230 150 242 156 248 M193 230 C182 228 158 220 148 232 C145 242 148 254 154 260 M193 242 C182 240 158 232 148 244 C145 254 148 266 154 272 M193 254 C182 252 159 244 149 256 C146 266 149 278 155 284 M190 268 C179 264 160 256 150 268 C147 278 150 290 156 296 M184 282 C175 276 162 268 152 280 C149 290 152 302 158 308 M178 296 C170 288 164 282 156 292 C153 302 156 312 162 318 M156 306 C153 314 155 322 160 328 M161 318 C158 324 160 332 163 336" stroke="#5E5748" stroke-width="5.4" opacity="0.85"></path>
<path d="M193 182 C182 180 176 172 166 184 C163 194 166 206 172 212 M193 194 C182 192 168 184 158 196 C155 206 158 218 164 224 M193 206 C182 204 162 196 152 208 C149 218 152 230 158 236 M193 218 C182 216 160 208 150 220 C147 230 150 242 156 248 M193 230 C182 228 158 220 148 232 C145 242 148 254 154 260 M193 242 C182 240 158 232 148 244 C145 254 148 266 154 272 M193 254 C182 252 159 244 149 256 C146 266 149 278 155 284 M190 268 C179 264 160 256 150 268 C147 278 150 290 156 296 M184 282 C175 276 162 268 152 280 C149 290 152 302 158 308 M178 296 C170 288 164 282 156 292 C153 302 156 312 162 318 M156 306 C153 314 155 322 160 328 M161 318 C158 324 160 332 163 336" stroke="#EDE6D6" stroke-width="3.8" opacity="0.92"></path>
<path d="M196 272 C186 286 172 300 162 316" stroke="#CFC6B2" stroke-width="3"></path>
<path d="M193 172 C178 166 160 172 142 170 C135 170 129 172 125 177" stroke="#5E5748" stroke-width="7"></path>
<path d="M193 172 C178 166 160 172 142 170 C135 170 129 172 125 177" stroke="#EDE6D6" stroke-width="5"></path>
</g>
<g transform="matrix(-1 0 0 1 400 0)">
<path d="M193 182 C182 180 176 172 166 184 C163 194 166 206 172 212 M193 194 C182 192 168 184 158 196 C155 206 158 218 164 224 M193 206 C182 204 162 196 152 208 C149 218 152 230 158 236 M193 218 C182 216 160 208 150 220 C147 230 150 242 156 248 M193 230 C182 228 158 220 148 232 C145 242 148 254 154 260 M193 242 C182 240 158 232 148 244 C145 254 148 266 154 272 M193 254 C182 252 159 244 149 256 C146 266 149 278 155 284 M190 268 C179 264 160 256 150 268 C147 278 150 290 156 296 M184 282 C175 276 162 268 152 280 C149 290 152 302 158 308 M178 296 C170 288 164 282 156 292 C153 302 156 312 162 318 M156 306 C153 314 155 322 160 328 M161 318 C158 324 160 332 163 336" stroke="#5E5748" stroke-width="5.4" opacity="0.85"></path>
<path d="M193 182 C182 180 176 172 166 184 C163 194 166 206 172 212 M193 194 C182 192 168 184 158 196 C155 206 158 218 164 224 M193 206 C182 204 162 196 152 208 C149 218 152 230 158 236 M193 218 C182 216 160 208 150 220 C147 230 150 242 156 248 M193 230 C182 228 158 220 148 232 C145 242 148 254 154 260 M193 242 C182 240 158 232 148 244 C145 254 148 266 154 272 M193 254 C182 252 159 244 149 256 C146 266 149 278 155 284 M190 268 C179 264 160 256 150 268 C147 278 150 290 156 296 M184 282 C175 276 162 268 152 280 C149 290 152 302 158 308 M178 296 C170 288 164 282 156 292 C153 302 156 312 162 318 M156 306 C153 314 155 322 160 328 M161 318 C158 324 160 332 163 336" stroke="#EDE6D6" stroke-width="3.8" opacity="0.92"></path>
<path d="M196 272 C186 286 172 300 162 316" stroke="#CFC6B2" stroke-width="3"></path>
<path d="M193 172 C178 166 160 172 142 170 C135 170 129 172 125 177" stroke="#5E5748" stroke-width="7"></path>
<path d="M193 172 C178 166 160 172 142 170 C135 170 129 172 125 177" stroke="#EDE6D6" stroke-width="5"></path>
</g>
</g>
<g fill="url(#fgBone)" stroke="#6F6757" stroke-width="0.8">
<path d="M188 172 L212 172 L210 192 L190 192 Z"></path>
<path d="M191 194 L209 194 L207 264 L193 264 Z"></path>
<path d="M196 266 L204 266 L200 280 Z"></path>`;


// ── SvgLayer helper — injects raw SVG HTML into a <g> ─────────
// We use a ref + useLayoutEffect because dangerouslySetInnerHTML
// parses in HTML namespace; direct innerHTML on an SVG element
// uses SVG namespace and correctly creates SVGPathElement etc.

function SvgLayer({
  html, opacity, transition = 'opacity .5s',
}: { html: string; opacity: number; transition?: string }) {
  const ref = useRef<SVGGElement>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, [html]);
  return <g ref={ref} opacity={opacity} style={{ transition }} />;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function AnatomyLayerViewer({ lang, onNodeSelect }: Props) {
  const { layerVisibility, selectedNodeId, showLabels } = useAnatomyStore();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan]   = useState({ x: 0, y: 0 });
  const isDragging      = useRef(false);
  const dragStart       = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const svgRef          = useRef<SVGSVGElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pulse, setPulse]         = useState(0);

  useEffect(() => {
    if (!selectedNodeId) { setPulse(0); return; }
    let frame = 0;
    let raf: number;
    const tick = () => { frame++; setPulse(Math.sin(frame * 0.07) * 0.5 + 0.5); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selectedNodeId]);

  const op = useCallback((key: keyof typeof layerVisibility) => layerVisibility[key] ? 1 : 0, [layerVisibility]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z * (e.deltaY > 0 ? 0.9 : 1.1), 0.4), 6));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({ x: dragStart.current.panX + (e.clientX - dragStart.current.x), y: dragStart.current.panY + (e.clientY - dragStart.current.y) });
  }, []);

  const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const lastTouchDist = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
    } else {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, panX: pan.x, panY: pan.y };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastTouchDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.sqrt(dx * dx + dy * dy);
      setZoom((z) => Math.min(Math.max(z * d / lastTouchDist.current!, 0.4), 6));
      lastTouchDist.current = d;
    } else if (e.touches.length === 1 && isDragging.current) {
      setPan({ x: dragStart.current.panX + (e.touches[0].clientX - dragStart.current.x), y: dragStart.current.panY + (e.touches[0].clientY - dragStart.current.y) });
    }
  }, []);

  const handleTouchEnd = useCallback(() => { isDragging.current = false; lastTouchDist.current = null; }, []);

  // Convert pan from screen px to SVG units
  const svgW = svgRef.current?.clientWidth  ?? 740;
  const svgH = svgRef.current?.clientHeight ?? 920;
  const panSvgX = (pan.x / svgW) * 740;
  const panSvgY = (pan.y / svgH) * 920;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: '#0B0E13', cursor: isDragging.current ? 'grabbing' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <svg
        ref={svgRef}
        viewBox="-170 0 740 920"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        style={{ display: 'block', userSelect: 'none' }}
      >
        <defs>
          <linearGradient id="fgSkin" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#A57B66"/>
            <stop offset="0.6" stopColor="#DDB69D"/>
            <stop offset="1" stopColor="#EBCDB8"/>
          </linearGradient>
          <linearGradient id="fgMuscle" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7E2636"/>
            <stop offset="0.5" stopColor="#C85A6C"/>
            <stop offset="1" stopColor="#8E2E40"/>
          </linearGradient>
          <linearGradient id="fgBone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#C9BEA6"/>
            <stop offset="0.5" stopColor="#F3EDE1"/>
            <stop offset="1" stopColor="#C9BEA6"/>
          </linearGradient>
          <linearGradient id="fgLung" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#C9607E"/>
            <stop offset="0.5" stopColor="#F5AFC3"/>
            <stop offset="1" stopColor="#D9789A"/>
          </linearGradient>
          <linearGradient id="fgLiver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B0503F"/>
            <stop offset="1" stopColor="#6B2620"/>
          </linearGradient>
          <linearGradient id="fgHeart" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F0646A"/>
            <stop offset="1" stopColor="#8E1C27"/>
          </linearGradient>
          <linearGradient id="fgBrain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F8D888"/>
            <stop offset="1" stopColor="#C9962C"/>
          </linearGradient>
          <linearGradient id="fgStomach" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F0B892"/>
            <stop offset="1" stopColor="#C9774E"/>
          </linearGradient>
          <linearGradient id="fgKidney" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#BE97F0"/>
            <stop offset="1" stopColor="#7348B8"/>
          </linearGradient>
          <filter id="fgGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-hover" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-pulse" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Pan + zoom group, centred on body (200, 460) */}
        <g transform={`translate(${panSvgX},${panSvgY}) scale(${zoom})`}
           style={{ transformOrigin: '200px 460px' }}>

          {/* Decorative rings */}
          <circle cx="200" cy="460" r="355" fill="none" stroke="#E9E4DA" strokeOpacity="0.07" strokeWidth="1"/>
          <circle cx="200" cy="460" r="300" fill="none" stroke="#E9E4DA" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="2 6"/>

          {/* ═══ LAYER 1 — INTEGUMENTARY ═══ */}
          <SvgLayer html={LAYER_INTEGUMENTARY} opacity={op('integumentary')} />

          {/* ═══ LAYER 2 — MUSCULAR ═══ */}
          <SvgLayer html={LAYER_MUSCULAR} opacity={op('muscular')} />

          {/* ═══ LAYER 3 — NERVOUS ═══ */}
          <SvgLayer html={LAYER_NERVOUS} opacity={op('nervous')} />

          {/* ═══ LAYER 4 — CARDIOVASCULAR ═══ */}
          <SvgLayer html={LAYER_CARDIOVASCULAR} opacity={op('cardiovascular')} />

          {/* ═══ LAYER 5 — LYMPHATIC ═══ */}
          <SvgLayer html={LAYER_LYMPHATIC} opacity={op('lymphatic')} />

          {/* ═══ LAYER 6 — RESPIRATORY ═══ */}
          <SvgLayer html={LAYER_RESPIRATORY} opacity={op('respiratory')} />

          {/* ═══ LAYER 7 — DIGESTIVE ═══ */}
          <SvgLayer html={LAYER_DIGESTIVE} opacity={op('digestive')} />

          {/* ═══ LAYER 8 — URINARY ═══ */}
          <SvgLayer html={LAYER_URINARY} opacity={op('urinary')} />

          {/* ═══ LAYER 9 — SKELETAL ═══ */}
          <SvgLayer html={LAYER_SKELETAL} opacity={op('skeletal')} />

          {/* ═══ CLICK REGIONS ═══ */}
          {CLICK_REGIONS.map((r) => {
            const isSel = selectedNodeId === r.id;
            const isHov = hoveredId === r.id;
            return (
              <rect
                key={r.id}
                x={r.x} y={r.y} width={r.w} height={r.h} rx={12}
                fill="white"
                opacity={isSel ? 0.12 + pulse * 0.10 : isHov ? 0.08 : 0}
                filter={isSel ? 'url(#glow-pulse)' : isHov ? 'url(#glow-hover)' : undefined}
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); onNodeSelect(r.id); }}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}

          {/* ═══ LABELS ═══ */}
          {showLabels && LABELS.map((lb, i) => {
            const label = lang === 'ar' ? lb.ar : lb.en;
            const isRight = lb.side === 'right';
            return (
              <g key={i} pointerEvents="none" opacity={0.82}>
                <line
                  x1={lb.x1} y1={lb.y1} x2={lb.lx} y2={lb.ly}
                  stroke="#94a3b8" strokeWidth={0.7} strokeDasharray="3,3" opacity={0.5}
                />
                <circle cx={lb.x1} cy={lb.y1} r={2} fill="#94a3b8" opacity={0.6} />
                <text
                  x={lb.lx} y={lb.ly}
                  fontSize={9.5}
                  fill="#94a3b8"
                  textAnchor={isRight ? 'start' : 'end'}
                  dominantBaseline="middle"
                  style={{ fontFamily: 'ui-monospace,"SF Mono",monospace', letterSpacing: '0.01em' }}
                >
                  {label}
                </text>
              </g>
            );
          })}

        </g>

        <text x="200" y="912" fontSize="8.5" fill="rgba(255,255,255,0.14)" textAnchor="middle" pointerEvents="none">
          {lang === 'ar' ? 'عجلة للتكبير · سحب للتحريك' : 'scroll to zoom · drag to pan'}
        </text>
      </svg>
    </div>
  );
}
