'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useAnatomyStore } from '@/store/anatomyStore';

// ── Props ──────────────────────────────────────────────────────

interface Props {
  lang: 'en' | 'ar';
  onNodeSelect: (nodeId: string) => void;
}

// ── System colours ─────────────────────────────────────────────

const C = {
  integumentary:  '#c8a070',
  muscular:       '#b83049',
  nervous:        '#d4a520',
  cardiovascular: { artery: '#e53e3e', vein: '#3a7bd5' },
  lymphatic:      '#38a169',
  respiratory:    '#76e4f7',
  digestive:      '#dd6b20',
  urinary:        '#805ad5',
  skeletal:       '#d4c5a9',
  bg:             '#0d0e12',
};

// ─────────────────────────────────────────────────────────────
// LAYER 1 — INTEGUMENTARY
// ViewBox 0 0 260 520, centre-x = 130
// Body drawn as clean separate segments, all filled with skin gradient.
// Standard 8-head anatomical proportions.
// ─────────────────────────────────────────────────────────────

// HEAD — proportional oval, 56px wide, slightly wider at mid-cranium
const SEG_HEAD = `M 130 8 C 110 8 100 24 100 46 C 100 64 111 74 120 80 C 124 82 127 83 130 83 C 133 83 136 82 140 80 C 149 74 160 64 160 46 C 160 24 150 8 130 8 Z`;

// NECK — 24px wide, connects chin to shoulder line
const SEG_NECK = `M 120 80 C 119 88 118 98 118 108 L 142 108 C 142 98 141 88 140 80 C 137 82 134 83 130 83 C 126 83 123 82 120 80 Z`;

// TORSO — shoulder width 76px → waist 64px → hips 84px → crotch, no arms
const SEG_TORSO = `
  M 118 108
  C 104 108 92 110 80 114
  C 70 118 66 128 67 140
  C 68 152 72 164 74 178
  C 76 192 77 208 77 224
  C 77 238 78 252 80 264
  C 82 274 84 284 87 294
  C 90 304 93 314 96 324
  C 99 332 101 344 102 358
  L 158 358
  C 159 344 161 332 164 324
  C 167 314 170 304 173 294
  C 176 284 178 274 180 264
  C 182 252 183 238 183 224
  C 183 208 184 192 186 178
  C 188 164 192 152 193 140
  C 194 128 190 118 180 114
  C 168 110 156 108 142 108
  Z
`;

// RIGHT arm: outer from shoulder to wrist, inner back up. Max x=210.
const SEG_ARM_R = `
  M 174 110
  C 184 108 196 110 206 118
  C 210 124 210 134 210 148
  C 209 162 207 176 205 190
  C 204 200 203 210 202 220
  C 202 226 202 232 203 238
  C 204 242 206 244 208 242
  C 210 238 210 230 209 222
  C 208 210 207 198 206 184
  C 205 168 205 152 206 138
  C 207 124 204 114 198 108
  C 192 104 184 106 174 110
  Z
`;

// LEFT arm: mirror. Min x=50.
const SEG_ARM_L = `
  M  86 110
  C  76 108  64 110  54 118
  C  50 124  50 134  50 148
  C  51 162  53 176  55 190
  C  56 200  57 210  58 220
  C  58 226  58 232  57 238
  C  56 242  54 244  52 242
  C  50 238  50 230  51 222
  C  52 210  53 198  54 184
  C  55 168  55 152  54 138
  C  53 124  56 114  62 108
  C  68 104  76 106  86 110
  Z
`;

// RIGHT HAND — paddle shape at end of arm
const SEG_HAND_R = `M 202 236 C 200 244 199 252 200 260 C 201 267 205 271 210 269 C 215 266 216 258 215 250 C 214 242 211 236 207 232 Z`;

// LEFT HAND
const SEG_HAND_L = `M  58 236 C  60 244  61 252  60 260 C  59 267  55 271  50 269 C  45 266  44 258  45 250 C  46 242  49 236  53 232 Z`;

// RIGHT LEG — outer and inner contours
const SEG_LEG_R = `
  M 158 358
  C 163 372 165 388 164 406
  C 163 422 159 436 156 448
  C 154 458 152 468 151 478
  C 150 486 150 494 153 500
  C 156 506 161 508 167 506
  C 172 504 174 498 173 490
  C 171 480 168 468 165 456
  C 162 442 160 426 159 410
  C 158 394 158 378 160 364
  Z
`;

// LEFT LEG — mirror
const SEG_LEG_L = `
  M 102 358
  C  97 372  95 388  96 406
  C  97 422 101 436 104 448
  C 106 458 108 468 109 478
  C 110 486 110 494 107 500
  C 104 506  99 508  93 506
  C  88 504  86 498  87 490
  C  89 480  92 468  95 456
  C  98 442 100 426 101 410
  C 102 394 102 378 100 364
  Z
`;

// RIGHT FOOT — elongated forward
const SEG_FOOT_R = `M 151 500 C 150 506 151 512 156 516 C 161 519 169 518 175 514 C 179 510 179 504 177 498 C 171 502 164 504 158 503 C 154 502 151 501 151 500 Z`;

// LEFT FOOT
const SEG_FOOT_L = `M 109 500 C 110 506 109 512 104 516 C  99 519  91 518  85 514 C  81 510  81 504  83 498 C  89 502  96 504 102 503 C 106 502 109 501 109 500 Z`;

// All skin segments rendered together
const SKIN_PARTS = [
  SEG_HEAD, SEG_NECK, SEG_TORSO,
  SEG_ARM_R, SEG_ARM_L,
  SEG_HAND_R, SEG_HAND_L,
  SEG_LEG_R, SEG_LEG_L,
  SEG_FOOT_R, SEG_FOOT_L,
];

// ─────────────────────────────────────────────────────────────
// LAYER 2 — MUSCULAR
// ─────────────────────────────────────────────────────────────

const MUSCLES_D: Array<[string, number?]> = [
  // Sternocleidomastoid R
  ['M 143 93 C 147 98 150 104 149 110 C 147 113 144 112 142 109 C 140 103 140 97 143 93 Z', 0.8],
  // Sternocleidomastoid L
  ['M 117 93 C 113 98 110 104 111 110 C 113 113 116 112 118 109 C 120 103 120 97 117 93 Z', 0.8],
  // Right trapezius
  ['M 155 116 C 168 118 183 122 192 126 C 190 132 182 136 174 136 C 164 133 158 127 155 120 Z', 0.75],
  // Left trapezius
  ['M 105 116 C 92 118 77 122 68 126 C 70 132 78 136 86 136 C 96 133 102 127 105 120 Z', 0.75],
  // Right deltoid
  ['M 180 120 C 190 124 202 132 206 148 C 200 142 192 136 184 128 C 180 124 179 120 180 120 Z', 0.8],
  // Left deltoid
  ['M 80 120 C 70 124 58 132 54 148 C 60 142 68 136 76 128 C 80 124 81 120 80 120 Z', 0.8],
  // Right pectoralis major
  ['M 130 119 C 143 119 156 123 164 130 C 168 138 168 152 164 162 C 156 167 143 167 130 163 Z', 0.7],
  // Left pectoralis major
  ['M 130 119 C 117 119 104 123 96 130 C 92 138 92 152 96 162 C 104 167 117 167 130 163 Z', 0.7],
  // Serratus anterior R
  ['M 165 162 C 172 167 176 175 174 185 C 170 190 165 188 162 181 C 160 174 162 165 165 162 Z', 0.7],
  ['M 165 177 C 172 182 176 190 174 200 C 170 204 165 202 162 195 C 160 188 162 179 165 177 Z', 0.6],
  // Serratus anterior L
  ['M  95 162 C  88 167  84 175  86 185 C  90 190  95 188  98 181 C 100 174  98 165  95 162 Z', 0.7],
  ['M  95 177 C  88 182  84 190  86 200 C  90 204  95 202  98 195 C 100 188  98 179  95 177 Z', 0.6],
  // Rectus abdominis segments
  ['M 119 163 L 119 189 C 123 190 128 190 131 189 L 131 163 C 128 162 123 162 119 163 Z', 0.75],
  ['M 119 193 L 119 219 C 123 220 128 220 131 219 L 131 193 C 128 192 123 192 119 193 Z', 0.75],
  ['M 119 223 L 119 247 C 123 248 128 248 131 247 L 131 223 C 128 222 123 222 119 223 Z', 0.7],
  // External oblique R
  ['M 131 163 C 143 164 157 170 165 182 C 163 198 159 214 154 226 C 145 231 137 230 131 225 Z', 0.65],
  // External oblique L
  ['M 119 163 C 107 164 93 170 85 182 C 87 198 91 214 96 226 C 105 231 113 230 119 225 Z', 0.65],
  // Right biceps
  ['M 206 152 C 210 166 210 182 206 196 C 202 201 198 200 196 196 C 196 182 198 166 202 154 Z', 0.8],
  // Left biceps
  ['M 54 152 C 50 166 50 182 54 196 C 58 201 62 200 64 196 C 64 182 62 166 58 154 Z', 0.8],
  // Right forearm flexors
  ['M 204 202 C 208 218 208 236 206 252 C 202 257 198 256 196 251 C 196 234 198 216 200 202 Z', 0.7],
  // Left forearm flexors
  ['M 56 202 C 52 218 52 236 54 252 C 58 257 62 256 64 251 C 64 234 62 216 60 202 Z', 0.7],
  // Right quadriceps — vastus lateralis
  ['M 178 372 C 182 390 183 410 182 430 C 178 437 173 436 170 430 C 169 410 169 388 171 370 Z', 0.7],
  // Right quadriceps — rectus femoris
  ['M 170 370 C 172 390 172 412 170 432 C 167 440 162 438 160 432 C 159 412 161 390 165 370 Z', 0.7],
  // Right vastus medialis (medial bulge near knee)
  ['M 161 416 C 162 428 162 440 160 449 C 156 455 151 453 149 447 C 149 435 152 421 157 416 Z', 0.65],
  // Left quadriceps — vastus lateralis
  ['M  82 372 C  78 390  77 410  78 430 C  82 437  87 436  90 430 C  91 410  91 388  89 370 Z', 0.7],
  // Left quadriceps — rectus femoris
  ['M  90 370 C  88 390  88 412  90 432 C  93 440  98 438 100 432 C 101 412  99 390  95 370 Z', 0.7],
  // Left vastus medialis
  ['M  99 416 C  98 428  98 440 100 449 C 104 455 109 453 111 447 C 111 435 108 421 103 416 Z', 0.65],
  // Right tibialis anterior
  ['M 178 452 C 180 468 180 484 178 498 C 174 504 170 502 168 497 C 168 481 170 464 174 452 Z', 0.75],
  // Left tibialis anterior
  ['M  82 452 C  80 468  80 484  82 498 C  86 504  90 502  92 497 C  92 481  90 464  86 452 Z', 0.75],
  // Right gastrocnemius
  ['M 183 462 C 187 479 187 495 183 510 C 178 514 173 512 171 506 C 171 490 174 472 179 460 Z', 0.65],
  // Left gastrocnemius
  ['M  77 462 C  73 479  73 495  77 510 C  82 514  87 512  89 506 C  89 490  86 472  81 460 Z', 0.65],
  // Tensor fasciae latae R
  ['M 180 356 C 186 366 188 378 183 390 C 178 394 174 392 172 385 C 172 373 174 362 180 356 Z', 0.65],
  // Tensor fasciae latae L
  ['M  80 356 C  74 366  72 378  77 390 C  82 394  86 392  88 385 C  88 373  86 362  80 356 Z', 0.65],
];

// ─────────────────────────────────────────────────────────────
// LAYER 3 — NERVOUS
// ─────────────────────────────────────────────────────────────

interface NervePath { d: string; w?: number; dash?: string; fill?: string; }

const NERVES: NervePath[] = [
  // Brain (filled ellipse inside skull)
  { d: 'M 112 22 C 110 34 110 48 114 56 C 118 62 124 66 130 66 C 136 66 142 62 146 56 C 150 48 150 34 148 22 C 144 16 136 14 130 14 C 124 14 116 16 112 22 Z', fill: C.nervous },
  // Cerebellum bulge
  { d: 'M 114 58 C 118 64 124 68 130 68 C 136 68 142 64 146 58 C 140 62 136 64 130 64 C 124 64 120 62 114 58 Z', fill: C.nervous },
  // Spinal cord — central, skull base to L5
  { d: 'M 130 95 L 130 282', w: 2.5 },
  // Brachial plexus R — roots fanning to arm
  { d: 'M 148 112 C 164 116 182 122 202 130', w: 1.5 },
  { d: 'M 148 116 C 165 121 184 130 204 140', w: 1.5 },
  { d: 'M 148 120 C 164 127 182 138 200 150', w: 1.5 },
  { d: 'M 148 124 C 163 132 180 144 196 158', w: 1 },
  // Brachial plexus L
  { d: 'M 112 112 C  96 116  78 122  58 130', w: 1.5 },
  { d: 'M 112 116 C  95 121  76 130  56 140', w: 1.5 },
  { d: 'M 112 120 C  96 127  78 138  60 150', w: 1.5 },
  { d: 'M 112 124 C  97 132  80 144  64 158', w: 1 },
  // Median/musculocutaneous R
  { d: 'M 204 156 C 204 176 202 196 200 216 C 199 228 198 242 197 254', w: 1 },
  // Radial nerve R (dashed — posterior)
  { d: 'M 208 160 C 208 180 206 200 204 218', w: 1, dash: '3,2' },
  // Ulnar nerve R
  { d: 'M 200 162 C 199 182 198 202 197 220 C 197 234 196 248 196 260', w: 1 },
  // Median/musculocutaneous L
  { d: 'M 56 156 C 56 176 58 196 60 216 C 61 228 62 242 63 254', w: 1 },
  // Radial nerve L
  { d: 'M 52 160 C 52 180 54 200 56 218', w: 1, dash: '3,2' },
  // Ulnar nerve L
  { d: 'M 60 162 C 61 182 62 202 63 220 C 63 234 64 248 64 260', w: 1 },
  // Femoral nerve R
  { d: 'M 168 366 C 170 384 173 404 174 424 C 174 442 173 460 172 478', w: 1.5 },
  // Femoral nerve L
  { d: 'M  92 366 C  90 384  87 404  86 424 C  86 442  87 460  88 478', w: 1.5 },
  // Sciatic nerve R (dashed — posterior)
  { d: 'M 172 372 C 176 392 178 414 178 436 C 178 456 176 474 174 492', w: 2, dash: '4,3' },
  // Sciatic nerve L
  { d: 'M  88 372 C  84 392  82 414  82 436 C  82 456  84 474  86 492', w: 2, dash: '4,3' },
  // Tibial nerve R
  { d: 'M 172 494 C 171 506 170 516 170 524', w: 1, dash: '3,2' },
  // Tibial nerve L
  { d: 'M  88 494 C  89 506  90 516  90 524', w: 1, dash: '3,2' },
  // Common peroneal R
  { d: 'M 176 492 C 182 504 184 518 180 530 C 177 540 171 546 168 554', w: 1 },
  // Common peroneal L
  { d: 'M  84 492 C  78 504  76 518  80 530 C  83 540  89 546  92 554', w: 1 },
];

// ─────────────────────────────────────────────────────────────
// LAYER 4 — CARDIOVASCULAR
// ─────────────────────────────────────────────────────────────

interface Vessel { d: string; type: 'artery' | 'vein' | 'heart'; w?: number; }

const VESSELS: Vessel[] = [
  // ── HEART (tilted, apex inferior-left) ──
  { d: 'M 120 148 C 118 140 112 136 110 144 C 110 154 118 164 128 174 C 134 168 142 160 146 152 C 150 144 150 136 145 134 C 140 132 136 138 134 146 C 132 140 126 136 120 148 Z', type: 'heart' },

  // ── ARTERIES ──────────────────────────────────────────────
  // Ascending aorta
  { d: 'M 130 142 C 129 134 129 126 131 118', type: 'artery', w: 3 },
  // Aortic arch
  { d: 'M 131 118 C 130 110 122 106 116 108 C 110 110 108 118 109 126', type: 'artery', w: 3 },
  // Descending thoracic aorta
  { d: 'M 109 126 C 109 142 110 160 111 178 C 112 196 113 214 114 230', type: 'artery', w: 2.5 },
  // Abdominal aorta
  { d: 'M 114 230 C 115 246 117 262 119 276', type: 'artery', w: 2.5 },
  // Right common iliac
  { d: 'M 119 276 C 126 284 138 292 150 298', type: 'artery', w: 2 },
  // Left common iliac
  { d: 'M 119 276 C 112 284 100 292  88 298', type: 'artery', w: 2 },
  // Right femoral artery
  { d: 'M 150 298 C 156 318 160 340 160 362 C 160 384 158 406 157 428 C 157 448 157 466 157 482', type: 'artery', w: 1.8 },
  // Left femoral artery
  { d: 'M  88 298 C  82 318  78 340  78 362 C  78 384  80 406  81 428 C  81 448  81 466  81 482', type: 'artery', w: 1.8 },
  // Right anterior tibial
  { d: 'M 160 434 C 162 454 164 472 165 488', type: 'artery', w: 1 },
  // Left anterior tibial
  { d: 'M  78 434 C  76 454  74 472  73 488', type: 'artery', w: 1 },
  // Right common carotid
  { d: 'M 129 120 C 134 112 138 102 140 92 C 141 86 140 80 138 76', type: 'artery', w: 2 },
  // Left common carotid
  { d: 'M 113 118 C 108 110 104 100 102 90 C 101 84 102 78 104 74', type: 'artery', w: 2 },
  // Right subclavian → brachial
  { d: 'M 131 116 C 148 114 164 114 180 116 C 193 118 204 124 206 130', type: 'artery', w: 2 },
  // Right brachial → radial
  { d: 'M 206 130 C 208 150 208 170 206 190 C 205 204 203 220 202 236', type: 'artery', w: 1.5 },
  // Right ulnar
  { d: 'M 204 148 C 204 168 203 188 202 208 C 201 224 200 240 199 256', type: 'artery', w: 1 },
  // Left subclavian → brachial
  { d: 'M 113 116 C 96 114 80 114 66 116 C 56 118 52 124 54 130', type: 'artery', w: 2 },
  // Left brachial → radial
  { d: 'M 54 130 C 52 150 52 170 54 190 C 55 204 57 220 58 236', type: 'artery', w: 1.5 },
  // Left ulnar
  { d: 'M 56 148 C 56 168 57 188 58 208 C 59 224 60 240 61 256', type: 'artery', w: 1 },

  // ── VEINS ─────────────────────────────────────────────────
  // Superior vena cava
  { d: 'M 138 146 C 139 136 140 124 138 116 C 136 110 132 108 130 112 C 128 116 128 126 130 138 L 132 146', type: 'vein', w: 2.5 },
  // Inferior vena cava
  { d: 'M 135 174 C 135 194 134 216 133 238 C 132 254 131 270 130 282', type: 'vein', w: 2.5 },
  // Right internal jugular
  { d: 'M 142 98 C 145 104 146 112 145 120', type: 'vein', w: 1.5 },
  // Left internal jugular
  { d: 'M 118 98 C 115 104 114 112 115 120', type: 'vein', w: 1.5 },
  // Right cephalic vein
  { d: 'M 206 134 C 208 154 208 174 206 194 C 205 210 204 228 203 244', type: 'vein', w: 1 },
  // Left cephalic
  { d: 'M 54 134 C 52 154 52 174 54 194 C 55 210 56 228 57 244', type: 'vein', w: 1 },
  // Right femoral vein
  { d: 'M 154 300 C 158 320 162 342 162 364 C 162 386 160 408 159 430 C 159 450 159 468 159 484', type: 'vein', w: 1.5 },
  // Left femoral vein
  { d: 'M  86 300 C  82 320  78 342  78 364 C  78 386  80 408  81 430 C  81 450  81 468  81 484', type: 'vein', w: 1.5 },
  // Great saphenous R
  { d: 'M 152 304 C 151 326 150 350 150 374 C 150 398 151 420 152 440 C 152 460 153 476 154 488', type: 'vein', w: 1 },
  // Great saphenous L
  { d: 'M  88 304 C  89 326  90 350  90 374 C  90 398  89 420  88 440 C  88 460  87 476  86 488', type: 'vein', w: 1 },
];

// ─────────────────────────────────────────────────────────────
// LAYER 5 — LYMPHATIC
// ─────────────────────────────────────────────────────────────

interface LymphEl { type: 'duct' | 'node' | 'vessel'; d?: string; cx?: number; cy?: number; r?: number; dash?: string; }

const LYMPH: LymphEl[] = [
  // Thoracic duct (left ascending)
  { type: 'duct', d: 'M 122 288 C 121 268 120 246 120 224 C 119 202 119 180 119 158 C 119 136 120 114 121 108', dash: '4,3' },
  // Right lymphatic duct (short)
  { type: 'duct', d: 'M 140 108 C 142 116 142 124 140 130', dash: '3,2' },
  // Cervical nodes
  { type: 'node', cx: 118, cy: 88, r: 4 },
  { type: 'node', cx: 142, cy: 88, r: 4 },
  // Supraclavicular
  { type: 'node', cx: 106, cy: 114, r: 3.5 },
  { type: 'node', cx: 154, cy: 114, r: 3.5 },
  // Axillary R
  { type: 'node', cx: 202, cy: 136, r: 4 },
  { type: 'node', cx: 206, cy: 148, r: 3.5 },
  // Axillary L
  { type: 'node', cx:  58, cy: 136, r: 4 },
  { type: 'node', cx:  54, cy: 148, r: 3.5 },
  // Para-aortic chain
  { type: 'node', cx: 120, cy: 222, r: 3.5 },
  { type: 'node', cx: 132, cy: 230, r: 3.5 },
  { type: 'node', cx: 122, cy: 241, r: 3 },
  { type: 'node', cx: 134, cy: 250, r: 3 },
  // Inguinal R
  { type: 'node', cx: 157, cy: 284, r: 4 },
  { type: 'node', cx: 163, cy: 294, r: 3.5 },
  // Inguinal L
  { type: 'node', cx: 103, cy: 284, r: 4 },
  { type: 'node', cx:  97, cy: 294, r: 3.5 },
  // Popliteal R
  { type: 'node', cx: 162, cy: 448, r: 3.5 },
  // Popliteal L
  { type: 'node', cx:  98, cy: 448, r: 3.5 },
  // Connecting vessels
  { type: 'vessel', d: 'M 142 88 C 152 100 202 134 202 136', dash: '3,3' },
  { type: 'vessel', d: 'M 118 88 C 108 100  58 134  58 136', dash: '3,3' },
  { type: 'vessel', d: 'M 206 148 C 198 170 165 244 157 284', dash: '3,3' },
  { type: 'vessel', d: 'M  54 148 C  62 170  95 244 103 284', dash: '3,3' },
  { type: 'vessel', d: 'M 157 294 C 160 348 162 396 162 448', dash: '3,3' },
  { type: 'vessel', d: 'M 103 294 C 100 348  98 396  98 448', dash: '3,3' },
];

// ─────────────────────────────────────────────────────────────
// LAYER 6 — RESPIRATORY
// ─────────────────────────────────────────────────────────────

const TRACHEA_D    = 'M 123 100 C 121 112 121 126 121 138 C 121 148 123 158 129 160 C 131 161 131 161 133 160 C 139 158 141 148 141 138 C 141 126 141 112 139 100 C 135 98 127 98 123 100 Z';
const BRONCHUS_R_D = 'M 133 160 C 140 162 154 164 164 170 C 168 174 168 179 164 182 C 157 178 144 174 136 170 Z';
const BRONCHUS_L_D = 'M 129 160 C 122 163 110 166 100 172 C  96 176  96 181 100 183 C 107 179 119 175 126 170 Z';
const LUNG_R_D = 'M 144 114 C 163 118 178 132 182 152 C 186 170 184 192 180 214 C 176 232 169 248 160 254 C 152 258 142 256 137 250 C 133 244 132 232 132 216 C 132 198 133 178 135 160 C 138 146 141 128 144 114 Z';
const LUNG_L_D = 'M 116 114 C  97 118  82 132  78 152 C  74 172  76 194  80 214 C  84 234  92 250 102 258 C 112 264 124 262 128 256 C 132 250 132 238 131 220 C 129 200 128 178 126 160 C 123 144 119 130 116 114 Z';
const FISSURE_R_H  = 'M 177 168 C 170 178 160 188 152 196';
const FISSURE_R_O  = 'M 180 206 C 172 218 164 230 157 240';
const FISSURE_L    = 'M  83 170 C  91 182 101 194 110 204';
const DIAPHRAGM_D  = 'M 68 248 C 80 236 104 230 130 230 C 156 230 180 236 192 248 C 182 260 160 264 130 264 C 100 264  78 260  68 248 Z';

// ─────────────────────────────────────────────────────────────
// LAYER 7 — DIGESTIVE
// ─────────────────────────────────────────────────────────────

const ESOPHAGUS_D  = 'M 127 100 C 126 114 125 130 125 146 C 126 156 128 162 130 164 C 132 162 134 156 135 146 C 135 130 134 114 133 100 C 131 98 129 98 127 100 Z';
const LIVER_D      = 'M 132 168 C 148 166 167 172 177 183 C 183 191 184 203 181 215 C 178 225 170 231 161 233 C 149 235 136 231 131 221 C 128 213 128 201 131 191 C 132 183 132 175 132 168 Z';
const GALLBLADDER_D= 'M 166 217 C 171 220 176 226 174 234 C 172 240 166 242 162 238 C 158 234 159 224 163 220 Z';
const STOMACH_D    = 'M 100 192 C  97 202  97 216 101 228 C 106 238 115 244 126 246 C 134 247 140 243 143 235 C 146 225 143 212 136 202 C 129 192 118 188 108 188 C 104 188 101 189 100 192 Z';
const PANCREAS_D   = 'M 104 226 C 116 223 130 223 144 225 C 156 226 166 230 172 236 C 166 242 153 244 140 244 C 126 244 110 242 100 234 C  98 231 101 227 104 226 Z';
const SMALL_INT_D  = `
  M 115 248 C 109 252 104 260 104 270 C 104 282 112 292 124 296 C 130 297 136 296 140 292
  C 148 286 150 274 148 262 C 146 250 139 242 130 240 C 121 238 113 242 115 248 Z
  M 118 256 C 116 262 116 270 120 276 C 124 280 130 280 134 276 C 138 272 138 264 134 258
  C 130 252 124 250 118 256 Z`;
const LARGE_INT_D  = `
  M 158 250 C 165 254 170 264 170 278 C 170 294 165 308 158 316
  L 150 320 C 142 322 132 322 122 320
  L 104 316 C  97 308  92 294  92 280 C  92 266  96 256 104 250
  C 108 244 112 242 118 242`;
const SIGMOID_D    = 'M 104 312 C 100 320 102 330 108 336 C 114 340 122 338 126 332 C 130 324 128 314 133 310 C 138 304 144 306 146 314';
const RECTUM_D     = 'M 120 320 C 118 330 118 342 120 352 C 122 360 126 364 130 364 C 134 364 138 360 140 352 C 142 342 142 330 140 320 C 136 316 124 316 120 320 Z';

// ─────────────────────────────────────────────────────────────
// LAYER 8 — URINARY
// ─────────────────────────────────────────────────────────────

// Right kidney — bean shape with pelvis cutout
const KIDNEY_R_D   = 'M 162 218 C 170 216 178 220 180 230 C 182 238 179 248 172 254 C 165 258 156 256 151 250 C 147 244 147 234 151 226 C 154 220 158 218 162 218 Z  M 159 230 C 161 232 162 236 161 240 C 160 243 157 244 155 242 C 153 240 153 236 155 232 Z';
const KIDNEY_L_D   = 'M  98 214 C  90 212  82 216  80 226 C  78 234  81 244  88 250 C  95 256 104 254 109 248 C 113 242 113 232 109 224 C 106 218 102 214  98 214 Z  M 101 226 C  99 228  98 232  99 236 C 100 239 103 240 105 238 C 107 236 107 232 105 228 Z';
const URETER_R_D   = 'M 154 252 C 151 264 150 278 151 292 C 152 302 153 312 155 322';
const URETER_L_D   = 'M 106 248 C 109 260 110 274 109 288 C 108 298 107 310 105 322';
const BLADDER_D    = 'M 113 304 C 109 310 107 320 109 332 C 111 344 121 354 130 354 C 139 354 149 344 151 332 C 153 320 151 310 147 304 C 143 298 136 294 130 294 C 124 294 117 298 113 304 Z';

// ─────────────────────────────────────────────────────────────
// LAYER 9 — SKELETAL
// ─────────────────────────────────────────────────────────────

// Skull — cranium + mandible
const SKULL_D      = 'M 97 16 C 92 26 90 40 92 54 C 94 66 100 76 108 82 C 112 86 118 88 122 90 L 122 96 L 138 96 L 138 90 C 142 88 148 86 152 82 C 160 76 166 66 168 54 C 170 40 168 26 163 16 C 157 10 148 8 130 8 C 112 8 103 10 97 16 Z';
const EYE_R_D      = 'M 152 48 C 154 44 150 39 143 39 C 139 41 137 45 139 49 C 141 52 148 52 152 48 Z';
const EYE_L_D      = 'M 108 48 C 106 44 110 39 117 39 C 121 41 123 45 121 49 C 119 52 112 52 108 48 Z';
const NASAL_D      = 'M 127 54 C 128 60 129 66 131 72 C 130 74 129 74 128 72 C 126 66 126 60 127 54 Z';
const ZYGOMA_R_D   = 'M 153 55 C 157 58 160 63 158 68 C 156 66 153 62 151 58 Z';
const ZYGOMA_L_D   = 'M 107 55 C 103 58 100 63 102 68 C 104 66 107 62 109 58 Z';
const MANDIBLE_D   = 'M 107 90 C 107 100 113 108 122 110 C 126 111 134 111 138 110 C 147 108 153 100 153 90 C 148 94 140 97 130 97 C 120 97 112 94 107 90 Z';
// Cervical vertebrae (7)
const CERV_VERTS   = Array.from({ length: 7 }, (_, i) =>
  `M 123 ${99 + i * 6} L 137 ${99 + i * 6} L 137 ${103 + i * 6} L 123 ${103 + i * 6} Z`
);
// Clavicles
const CLAV_R_D     = 'M 130 110 C 143 109 158 110 172 114 C 174 116 174 119 172 120 C 158 116 143 114 130 112 Z';
const CLAV_L_D     = 'M 130 110 C 117 109 102 110  88 114 C  86 116  86 119  88 120 C 102 116 117 114 130 112 Z';
// Sternum
const STERNUM_D    = 'M 123 112 C 121 124 120 140 120 156 C 120 172 121 190 123 204 C 124 208 127 210 130 210 C 133 210 136 208 137 204 C 139 190 140 172 140 156 C 140 140 139 124 137 112 C 134 110 126 110 123 112 Z  M 128 202 C 128 208 130 214 132 212 L 132 208 Z';
// Ribs R (9 pairs)
const RIBS_R: string[] = [
  'M 137 120 C 150 119 165 120 175 128 C 181 134 181 144 175 148',
  'M 137 126 C 153 125 169 128 179 138 C 185 146 185 156 179 162',
  'M 137 132 C 153 133 170 138 180 150 C 186 160 184 172 178 178',
  'M 137 138 C 153 141 168 148 176 160 C 182 172 180 186 174 192',
  'M 137 144 C 151 149 164 158 170 172 C 176 184 174 198 168 204',
  'M 137 150 C 149 157 160 168 164 182 C 168 194 164 208 158 214',
  'M 137 156 C 147 165 156 178 158 192 C 160 204 156 218 150 224',
  'M 137 162 C 145 172 151 186 150 200 C 149 212 145 224 139 230',
  'M 137 168 C 143 180 145 194 142 208 C 140 218 135 228 129 232',
];
const RIBS_L: string[] = [
  'M 123 120 C 110 119  95 120  85 128 C  79 134  79 144  85 148',
  'M 123 126 C 107 125  91 128  81 138 C  75 146  75 156  81 162',
  'M 123 132 C 107 133  90 138  80 150 C  74 160  76 172  82 178',
  'M 123 138 C 107 141  92 148  84 160 C  78 172  80 186  86 192',
  'M 123 144 C 109 149  96 158  90 172 C  84 184  86 198  92 204',
  'M 123 150 C 111 157 100 168  96 182 C  92 194  96 208 102 214',
  'M 123 156 C 113 165 104 178 102 192 C 100 204 104 218 110 224',
  'M 123 162 C 115 172 109 186 110 200 C 111 212 115 224 121 230',
  'M 123 168 C 117 180 115 194 118 208 C 120 218 125 228 131 232',
];
// Thoracic vertebrae (12)
const THOR_VERTS   = Array.from({ length: 12 }, (_, i) =>
  `M 123 ${156 + i * 8} L 137 ${156 + i * 8} L 137 ${162 + i * 8} L 123 ${162 + i * 8} Z`
);
// Lumbar vertebrae (5)
const LUMB_VERTS   = Array.from({ length: 5 }, (_, i) =>
  `M 121 ${256 + i * 9} L 139 ${256 + i * 9} L 139 ${263 + i * 9} L 121 ${263 + i * 9} Z`
);
// Pelvis
const ILIUM_R_D    = 'M 140 272 C 152 266 168 266 177 276 C 183 284 181 298 173 305 C 164 311 151 310 143 302 C 137 296 137 282 140 272 Z';
const ILIUM_L_D    = 'M 120 272 C 108 266  92 266  83 276 C  77 284  79 298  87 305 C  96 311 109 310 117 302 C 123 296 123 282 120 272 Z';
const SACRUM_D     = 'M 121 272 C 123 282 126 292 128 302 C 129 306 131 306 132 302 C 134 292 137 282 139 272 C 135 266 125 266 121 272 Z';
const PUBIS_D      = 'M 118 302 C 118 310 123 316 130 316 C 137 316 142 310 142 302 C 138 300 122 300 118 302 Z';
const ACETAB_R_D   = 'M 172 282 C 174 278 178 277 181 280 C 184 283 184 288 181 290 C 178 292 174 291 172 287 Z';
const ACETAB_L_D   = 'M  88 282 C  86 278  82 277  79 280 C  76 283  76 288  79 290 C  82 292  86 291  88 287 Z';
// Humerus
const HUM_R_D      = 'M 230 142 C 234 162 235 184 231 204 C 229 213 224 216 221 212 C 219 194 219 172 221 154 C 223 144 227 139 230 142 Z';
const HUM_L_D      = 'M  30 142 C  26 162  25 184  29 204 C  31 213  36 216  39 212 C  41 194  41 172  39 154 C  37 144  33 139  30 142 Z';
// Radius + Ulna R
const RAD_R_D      = 'M 228 212 C 230 232 231 254 230 272 C 229 282 225 286 222 282 C 221 262 221 240 222 220 C 224 212 226 210 228 212 Z';
const ULN_R_D      = 'M 221 212 C 221 232 221 254 220 272 C 220 282 216 284 214 280 C 214 260 215 238 216 218 C 217 211 219 209 221 212 Z';
const RAD_L_D      = 'M  32 212 C  30 232  29 254  30 272 C  31 282  35 286  38 282 C  39 262  39 240  38 220 C  36 212  34 210  32 212 Z';
const ULN_L_D      = 'M  39 212 C  39 232  39 254  40 272 C  40 282  44 284  46 280 C  46 260  45 238  44 218 C  43 211  41 209  39 212 Z';
// Hand bones (simplified fan)
const HAND_R_D     = 'M 213 276 C 211 284 210 294 211 304 C 213 312 218 314 223 310 C 226 304 226 294 225 284 C 223 276 219 272 216 272 Z';
const HAND_L_D     = 'M  47 276 C  49 284  50 294  49 304 C  47 312  42 314  37 310 C  34 304  34 294  35 284 C  37 276  41 272  44 272 Z';
// Femur
const FEM_R_D      = 'M 165 306 C 170 328 172 354 172 378 C 172 398 170 416 168 430 C 166 442 160 446 156 440 C 154 426 154 404 154 382 C 154 360 156 336 159 314 C 161 306 163 304 165 306 Z';
const FEM_L_D      = 'M  95 306 C  90 328  88 354  88 378 C  88 398  90 416  92 430 C  94 442 100 446 104 440 C 106 426 106 404 106 382 C 106 360 104 336 101 314 C  99 306  97 304  95 306 Z';
// Femoral head circles
const FH_R         = { cx: 170, cy: 304, r: 8 };
const FH_L         = { cx:  90, cy: 304, r: 8 };
// Patellae
const PAT_R_D      = 'M 154 434 C 152 440 152 448 154 454 C 156 458 160 459 164 457 C 168 454 169 448 167 442 C 165 436 160 433 156 433 Z';
const PAT_L_D      = 'M 106 434 C 108 440 108 448 106 454 C 104 458 100 459  96 457 C  92 454  91 448  93 442 C  95 436 100 433 104 433 Z';
// Tibia
const TIB_R_D      = 'M 158 456 C 160 476 162 498 162 516 C 160 520 156 520 152 518 C 149 514 148 496 148 476 C 148 456 150 438 155 456 Z';
const TIB_L_D      = 'M 102 456 C 100 476  98 498  98 516 C 100 520 104 520 108 518 C 111 514 112 496 112 476 C 112 456 110 438 105 456 Z';
// Fibula
const FIB_R_D      = 'M 168 458 C 170 478 171 500 170 516 C 170 520 167 521 165 517 C 164 499 164 477 165 460 C 166 450 168 448 168 458 Z';
const FIB_L_D      = 'M  92 458 C  90 478  89 500  90 516 C  90 520  93 521  95 517 C  96 499  96 477  95 460 C  94 450  92 448  92 458 Z';
// Foot bones
const FOOT_R_D     = 'M 152 516 C 152 520 154 524 158 526 C 164 528 172 526 176 520 C 178 516 176 512 172 510 C 167 508 157 508 152 516 Z';
const FOOT_L_D     = 'M 108 516 C 108 520 106 524 102 526 C  96 528  88 526  84 520 C  82 516  84 512  88 510 C  93 508 103 508 108 516 Z';
// Metatarsal lines R/L
const META_R = ['M 154 514 L 160 500', 'M 159 515 L 164 501', 'M 163 516 L 167 502', 'M 167 515 L 170 502', 'M 170 513 L 173 500'];
const META_L = ['M 106 514 L 100 500', 'M 101 515 L  96 501', 'M  97 516 L  93 502', 'M  93 515 L  90 502', 'M  90 513 L  87 500'];

// ─────────────────────────────────────────────────────────────
// CLICK REGIONS + LABELS
// ─────────────────────────────────────────────────────────────

interface ClickRegion {
  id: string; en: string; ar: string;
  x: number; y: number; w: number; h: number;
  lx: number; ly: number; side: 'left' | 'right';
}

const CLICK_REGIONS: ClickRegion[] = [
  { id: 'FMA:50801', en: 'Brain',            ar: 'الدماغ',          x: 96,  y: 12,  w: 68, h: 70,  lx: 220, ly: 30,  side: 'right' },
  { id: 'FMA:7088',  en: 'Heart',            ar: 'القلب',           x: 104, y: 134, w: 50, h: 46,  lx: 220, ly: 160, side: 'right' },
  { id: 'FMA:7310',  en: 'Right Lung',       ar: 'الرئة اليمنى',    x: 132, y: 112, w: 50, h: 136, lx: 220, ly: 178, side: 'right' },
  { id: 'FMA:7311',  en: 'Left Lung',        ar: 'الرئة اليسرى',    x: 78,  y: 112, w: 50, h: 140, lx: 32,  ly: 182, side: 'left'  },
  { id: 'FMA:7197',  en: 'Liver',            ar: 'الكبد',           x: 130, y: 164, w: 54, h: 72,  lx: 220, ly: 204, side: 'right' },
  { id: 'FMA:7148',  en: 'Stomach',          ar: 'المعدة',          x: 90,  y: 184, w: 58, h: 66,  lx: 32,  ly: 214, side: 'left'  },
  { id: 'FMA:7203',  en: 'Right Kidney',     ar: 'الكلية اليمنى',   x: 149, y: 212, w: 36, h: 46,  lx: 220, ly: 236, side: 'right' },
  { id: 'FMA:7204',  en: 'Left Kidney',      ar: 'الكلية اليسرى',   x: 76,  y: 208, w: 36, h: 44,  lx: 32,  ly: 232, side: 'left'  },
  { id: 'FMA:15900', en: 'Urinary Bladder',  ar: 'المثانة البولية', x: 106, y: 292, w: 48, h: 68,  lx: 220, ly: 326, side: 'right' },
  { id: 'FMA:9631',  en: 'Vertebral Column', ar: 'العمود الفقري',   x: 120, y: 96,  w: 20, h: 190, lx: 32,  ly: 192, side: 'left'  },
];

// Anatomical labels (Figure Component reference style)
interface AnatLabel { en: string; ar: string; x1: number; y1: number; lx: number; ly: number; side: 'left' | 'right'; }

const LABELS: AnatLabel[] = [
  { en: 'Temporal artery',          ar: 'الشريان الصدغي',           x1: 118, y1: 32,  lx: 28,  ly: 30,  side: 'left'  },
  { en: 'Jugular vein',             ar: 'الوريد الوداجي',            x1: 120, y1: 92,  lx: 28,  ly: 82,  side: 'left'  },
  { en: 'Superior vena cava',       ar: 'الوريد الأجوف العلوي',      x1: 135, y1: 136, lx: 28,  ly: 130, side: 'left'  },
  { en: 'Brachial artery',          ar: 'شريان العضد',               x1: 234, y1: 160, lx: 28,  ly: 164, side: 'left'  },
  { en: 'Inferior vena cava',       ar: 'الوريد الأجوف السفلي',      x1: 135, y1: 204, lx: 28,  ly: 200, side: 'left'  },
  { en: 'Femoral artery',           ar: 'شريان الفخذ',               x1: 157, y1: 344, lx: 28,  ly: 334, side: 'left'  },
  { en: 'Great saphenous vein',     ar: 'الوريد الصافن الكبير',      x1: 152, y1: 406, lx: 28,  ly: 394, side: 'left'  },
  { en: 'Anterior tibial artery',   ar: 'الشريان الظنبوبي الأمامي',  x1: 162, y1: 464, lx: 28,  ly: 452, side: 'left'  },
  { en: 'Common carotid',           ar: 'الشريان السباتي المشترك',    x1: 138, y1: 94,  lx: 232, ly: 88,  side: 'right' },
  { en: 'Aortic arch',              ar: 'قوس الأبهر',                x1: 116, y1: 114, lx: 232, ly: 110, side: 'right' },
  { en: 'Heart',                    ar: 'القلب',                     x1: 128, y1: 158, lx: 232, ly: 152, side: 'right' },
  { en: 'Abdominal aorta',          ar: 'الأبهر البطني',             x1: 116, y1: 248, lx: 232, ly: 240, side: 'right' },
  { en: 'Common iliac',             ar: 'الحرقفي المشترك',           x1: 141, y1: 292, lx: 232, ly: 282, side: 'right' },
  { en: 'Radial artery',            ar: 'الشريان الكعبري',           x1: 231, y1: 242, lx: 232, ly: 326, side: 'right' },
  { en: 'Posterior tibial artery',  ar: 'الشريان الظنبوبي الخلفي',   x1: 160, y1: 474, lx: 232, ly: 460, side: 'right' },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function AnatomyLayerViewer({ lang, onNodeSelect }: Props) {
  const { layerVisibility, selectedNodeId, showLabels } = useAnatomyStore();

  // Pan + zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan]   = useState({ x: 0, y: 0 });
  const isDragging      = useRef(false);
  const dragStart       = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const svgRef          = useRef<SVGSVGElement>(null);

  // Hover / selection
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pulse, setPulse]         = useState(0);

  // Pulse animation for selected node
  useEffect(() => {
    if (!selectedNodeId) { setPulse(0); return; }
    let frame = 0;
    let raf: number;
    const tick = () => {
      frame++;
      setPulse(Math.sin(frame * 0.07) * 0.5 + 0.5);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selectedNodeId]);

  // Scroll-to-zoom (cursor-centred)
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    setZoom((z) => Math.max(0.4, Math.min(5, z * factor)));
  }, []);

  // Mouse drag pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current  = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, []);

  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  // Touch pan
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1)
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const lv = layerVisibility as unknown as Record<string, boolean>;
  const op = (key: string): number => (lv[key] !== false ? 1 : 0);

  // Pan+zoom transform: keep figure centred at (130, 260) after scaling
  const tx = pan.x + 130 * (1 - zoom);
  const ty = pan.y + 260 * (1 - zoom);

  return (
    <div
      className="w-full h-full relative overflow-hidden select-none"
      style={{ background: C.bg, cursor: isDragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={() => { lastTouch.current = null; }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 260 520"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        onWheel={onWheel}
      >
        <defs>
          {/* Hover glow */}
          <filter id="glow-hover" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Selection pulse */}
          <filter id="glow-pulse" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={2 + pulse * 6} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Skin tone gradient — radial, lighter at chest/face */}
          <radialGradient id="skin-grad" cx="50%" cy="30%" r="65%">
            <stop offset="0%"   stopColor="#deb48a" />
            <stop offset="50%"  stopColor="#c8965a" />
            <stop offset="100%" stopColor="#a87040" />
          </radialGradient>
          <style>{`
            .anat-layer { transition: opacity 0.3s ease; }
            .anat-click { cursor: pointer; }
          `}</style>
        </defs>

        {/* ── Pan + zoom group ─────────────────────────────── */}
        <g transform={`translate(${tx},${ty}) scale(${zoom})`}>

          {/* ═══════════════════════════════════════════════════
              LAYER 1 — INTEGUMENTARY
              ═══════════════════════════════════════════════ */}
          <g className="anat-layer" opacity={op('integumentary')}>
            {SKIN_PARTS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="url(#skin-grad)"
                stroke={C.integumentary}
                strokeWidth={0.5}
                opacity={0.95}
              />
            ))}
            {/* Subtle navel indent */}
            <circle cx={130} cy={224} r={2} fill="#9a6030" opacity={0.4} />
            {/* Linea alba */}
            <line x1={130} y1={163} x2={130} y2={248}
              stroke="#9a6030" strokeWidth={0.4} strokeDasharray="3,3" opacity={0.3} />
          </g>

          {/* ═══════════════════════════════════════════════════
              LAYER 2 — MUSCULAR
              ═══════════════════════════════════════════════ */}
          <g className="anat-layer" opacity={op('muscular')}>
            {MUSCLES_D.map(([d, fo], i) => (
              <path
                key={i}
                d={d}
                fill={C.muscular}
                stroke={C.muscular}
                strokeWidth={0.4}
                fillOpacity={fo ?? 0.75}
                strokeOpacity={0.6}
              />
            ))}
            {/* Tendinous inscriptions across rectus abdominis */}
            {[190, 222].map((y) => (
              <line
                key={y}
                x1={117} y1={y} x2={133} y2={y}
                stroke="#7a1020" strokeWidth={0.8} strokeLinecap="round"
              />
            ))}
          </g>

          {/* ═══════════════════════════════════════════════════
              LAYER 3 — NERVOUS
              ═══════════════════════════════════════════════ */}
          <g className="anat-layer" opacity={op('nervous')}>
            {NERVES.map((n, i) => (
              <path
                key={i}
                d={n.d}
                fill={n.fill ?? 'none'}
                fillOpacity={n.fill ? 0.9 : undefined}
                stroke={n.fill ? 'none' : C.nervous}
                strokeWidth={n.w ?? 1}
                strokeDasharray={n.dash}
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* ═══════════════════════════════════════════════════
              LAYER 4 — CARDIOVASCULAR
              ═══════════════════════════════════════════════ */}
          <g className="anat-layer" opacity={op('cardiovascular')}>
            {VESSELS.map((v, i) => {
              if (v.type === 'heart') {
                return (
                  <path
                    key={i}
                    d={v.d}
                    fill={C.cardiovascular.artery}
                    stroke="#ff6868"
                    strokeWidth={0.8}
                    opacity={0.95}
                  />
                );
              }
              return (
                <path
                  key={i}
                  d={v.d}
                  fill="none"
                  stroke={v.type === 'artery' ? C.cardiovascular.artery : C.cardiovascular.vein}
                  strokeWidth={v.w ?? 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.88}
                />
              );
            })}
          </g>

          {/* ═══════════════════════════════════════════════════
              LAYER 5 — LYMPHATIC
              ═══════════════════════════════════════════════ */}
          <g className="anat-layer" opacity={op('lymphatic')}>
            {LYMPH.map((el, i) => {
              if (el.type === 'node') {
                return (
                  <circle
                    key={i}
                    cx={el.cx} cy={el.cy} r={el.r ?? 3.5}
                    fill={C.lymphatic}
                    stroke="#2d8a56"
                    strokeWidth={0.5}
                    opacity={0.88}
                  />
                );
              }
              return (
                <path
                  key={i}
                  d={el.d}
                  fill="none"
                  stroke={C.lymphatic}
                  strokeWidth={el.type === 'duct' ? 2 : 1}
                  strokeDasharray={el.dash ?? '4,3'}
                  strokeLinecap="round"
                  opacity={0.8}
                />
              );
            })}
          </g>

          {/* ═══════════════════════════════════════════════════
              LAYER 6 — RESPIRATORY
              ═══════════════════════════════════════════════ */}
          <g className="anat-layer" opacity={op('respiratory')}>
            <path d={LUNG_R_D}     fill={C.respiratory} fillOpacity={0.28} stroke={C.respiratory} strokeWidth={1} />
            <path d={LUNG_L_D}     fill={C.respiratory} fillOpacity={0.28} stroke={C.respiratory} strokeWidth={1} />
            <path d={FISSURE_R_H}  fill="none" stroke={C.respiratory} strokeWidth={0.6} strokeDasharray="2,2" opacity={0.6} />
            <path d={FISSURE_R_O}  fill="none" stroke={C.respiratory} strokeWidth={0.6} strokeDasharray="2,2" opacity={0.6} />
            <path d={FISSURE_L}    fill="none" stroke={C.respiratory} strokeWidth={0.6} strokeDasharray="2,2" opacity={0.6} />
            <path d={TRACHEA_D}    fill={C.respiratory} fillOpacity={0.55} stroke={C.respiratory} strokeWidth={0.8} />
            <path d={BRONCHUS_R_D} fill={C.respiratory} fillOpacity={0.45} stroke={C.respiratory} strokeWidth={0.8} />
            <path d={BRONCHUS_L_D} fill={C.respiratory} fillOpacity={0.45} stroke={C.respiratory} strokeWidth={0.8} />
            <path d={DIAPHRAGM_D}  fill={C.respiratory} fillOpacity={0.15} stroke={C.respiratory} strokeWidth={1} />
          </g>

          {/* ═══════════════════════════════════════════════════
              LAYER 7 — DIGESTIVE
              ═══════════════════════════════════════════════ */}
          <g className="anat-layer" opacity={op('digestive')}>
            <path d={ESOPHAGUS_D}    fill={C.digestive} fillOpacity={0.65} stroke={C.digestive} strokeWidth={0.6} />
            <path d={LIVER_D}        fill="#c05621"     fillOpacity={0.78} stroke={C.digestive} strokeWidth={0.8} />
            <path d={GALLBLADDER_D}  fill="#c8a020"     fillOpacity={0.85} stroke="#b08010"     strokeWidth={0.6} />
            <path d={STOMACH_D}      fill={C.digestive} fillOpacity={0.7}  stroke={C.digestive} strokeWidth={0.8} />
            <path d={PANCREAS_D}     fill={C.digestive} fillOpacity={0.6}  stroke={C.digestive} strokeWidth={0.6} />
            <path d={SMALL_INT_D}    fill={C.digestive} fillOpacity={0.5}  stroke={C.digestive} strokeWidth={0.8} />
            <path d={LARGE_INT_D}    fill="none" stroke={C.digestive} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.82} />
            <path d={SIGMOID_D}      fill="none" stroke={C.digestive} strokeWidth={3.5} strokeLinecap="round" opacity={0.82} />
            <path d={RECTUM_D}       fill={C.digestive} fillOpacity={0.65} stroke={C.digestive} strokeWidth={0.7} />
          </g>

          {/* ═══════════════════════════════════════════════════
              LAYER 8 — URINARY
              ═══════════════════════════════════════════════ */}
          <g className="anat-layer" opacity={op('urinary')}>
            <path d={KIDNEY_R_D} fill={C.urinary} fillOpacity={0.82} stroke={C.urinary} strokeWidth={0.8} fillRule="evenodd" />
            <path d={KIDNEY_L_D} fill={C.urinary} fillOpacity={0.82} stroke={C.urinary} strokeWidth={0.8} fillRule="evenodd" />
            <path d={URETER_R_D} fill="none" stroke={C.urinary} strokeWidth={1.5} strokeLinecap="round" />
            <path d={URETER_L_D} fill="none" stroke={C.urinary} strokeWidth={1.5} strokeLinecap="round" />
            <path d={BLADDER_D}  fill={C.urinary} fillOpacity={0.72} stroke={C.urinary} strokeWidth={0.8} />
          </g>

          {/* ═══════════════════════════════════════════════════
              LAYER 9 — SKELETAL
              ═══════════════════════════════════════════════ */}
          <g className="anat-layer" opacity={op('skeletal')}>
            <path d={SKULL_D}    fill={C.skeletal} fillOpacity={0.92} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={EYE_R_D}    fill={C.bg} />
            <path d={EYE_L_D}    fill={C.bg} />
            <path d={NASAL_D}    fill={C.skeletal} fillOpacity={0.7} />
            <path d={ZYGOMA_R_D} fill={C.skeletal} fillOpacity={0.65} />
            <path d={ZYGOMA_L_D} fill={C.skeletal} fillOpacity={0.65} />
            <path d={MANDIBLE_D} fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            {CERV_VERTS.map((d, i) => <path key={`cv${i}`} d={d} fill={C.skeletal} fillOpacity={0.88} />)}
            <path d={CLAV_R_D}  fill={C.skeletal} fillOpacity={0.9}  stroke={C.skeletal} strokeWidth={1} />
            <path d={CLAV_L_D}  fill={C.skeletal} fillOpacity={0.9}  stroke={C.skeletal} strokeWidth={1} />
            <path d={STERNUM_D} fill={C.skeletal} fillOpacity={0.92} stroke={C.skeletal} strokeWidth={0.4} fillRule="evenodd" />
            {RIBS_R.map((d, i) => <path key={`rr${i}`} d={d} fill="none" stroke={C.skeletal} strokeWidth={1.2} strokeLinecap="round" opacity={0.85} />)}
            {RIBS_L.map((d, i) => <path key={`rl${i}`} d={d} fill="none" stroke={C.skeletal} strokeWidth={1.2} strokeLinecap="round" opacity={0.85} />)}
            {THOR_VERTS.map((d, i) => <path key={`tv${i}`} d={d} fill={C.skeletal} fillOpacity={0.88} />)}
            {LUMB_VERTS.map((d, i) => <path key={`lv${i}`} d={d} fill={C.skeletal} fillOpacity={0.88} />)}
            <path d={ILIUM_R_D}  fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={ILIUM_L_D}  fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={SACRUM_D}   fill={C.skeletal} fillOpacity={0.92} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={PUBIS_D}    fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={ACETAB_R_D} fill={C.bg} stroke={C.skeletal} strokeWidth={0.6} />
            <path d={ACETAB_L_D} fill={C.bg} stroke={C.skeletal} strokeWidth={0.6} />
            <path d={HUM_R_D}    fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={HUM_L_D}    fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={RAD_R_D}    fill={C.skeletal} fillOpacity={0.84} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={ULN_R_D}    fill={C.skeletal} fillOpacity={0.84} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={RAD_L_D}    fill={C.skeletal} fillOpacity={0.84} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={ULN_L_D}    fill={C.skeletal} fillOpacity={0.84} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={HAND_R_D}   fill={C.skeletal} fillOpacity={0.8}  stroke={C.skeletal} strokeWidth={0.4} />
            <path d={HAND_L_D}   fill={C.skeletal} fillOpacity={0.8}  stroke={C.skeletal} strokeWidth={0.4} />
            <circle cx={FH_R.cx} cy={FH_R.cy} r={FH_R.r} fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <circle cx={FH_L.cx} cy={FH_L.cy} r={FH_L.r} fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={FEM_R_D}    fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={FEM_L_D}    fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={PAT_R_D}    fill={C.skeletal} fillOpacity={0.92} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={PAT_L_D}    fill={C.skeletal} fillOpacity={0.92} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={TIB_R_D}    fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={TIB_L_D}    fill={C.skeletal} fillOpacity={0.88} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={FIB_R_D}    fill={C.skeletal} fillOpacity={0.78} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={FIB_L_D}    fill={C.skeletal} fillOpacity={0.78} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={FOOT_R_D}   fill={C.skeletal} fillOpacity={0.84} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={FOOT_L_D}   fill={C.skeletal} fillOpacity={0.84} stroke={C.skeletal} strokeWidth={0.4} />
            {META_R.map((d, i) => <path key={`mr${i}`} d={d} fill="none" stroke={C.skeletal} strokeWidth={0.8} strokeLinecap="round" opacity={0.7} />)}
            {META_L.map((d, i) => <path key={`ml${i}`} d={d} fill="none" stroke={C.skeletal} strokeWidth={0.8} strokeLinecap="round" opacity={0.7} />)}
          </g>

          {/* ═══════════════════════════════════════════════════
              CLICKABLE REGION OVERLAYS
              ═══════════════════════════════════════════════ */}
          {CLICK_REGIONS.map((r) => {
            const isSel = selectedNodeId === r.id;
            const isHov = hoveredId === r.id;
            return (
              <rect
                key={r.id}
                className="anat-click"
                x={r.x} y={r.y} width={r.w} height={r.h}
                rx={8}
                fill="white"
                opacity={isSel ? 0.12 + pulse * 0.10 : isHov ? 0.09 : 0}
                filter={isSel ? 'url(#glow-pulse)' : isHov ? 'url(#glow-hover)' : undefined}
                onClick={(e) => { e.stopPropagation(); onNodeSelect(r.id); }}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}

          {/* ═══════════════════════════════════════════════════
              ANATOMICAL LABELS (Figure Component reference style)
              ═══════════════════════════════════════════════ */}
          {showLabels && LABELS.map((lb, i) => {
            const isRight = lb.side === 'right';
            const label   = lang === 'ar' ? lb.ar : lb.en;
            return (
              <g key={i} pointerEvents="none" opacity={0.85}>
                <line
                  x1={lb.x1} y1={lb.y1} x2={lb.lx} y2={lb.ly}
                  stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="2,2" opacity={0.5}
                />
                <circle cx={lb.x1} cy={lb.y1} r={1.2} fill="#94a3b8" opacity={0.6} />
                <text
                  x={lb.lx} y={lb.ly}
                  fontSize={6.5}
                  fill="#94a3b8"
                  textAnchor={isRight ? 'start' : 'end'}
                  dominantBaseline="middle"
                  style={{ fontFamily: 'ui-monospace,"SF Mono",monospace', letterSpacing: '0.012em' }}
                >
                  {label}
                </text>
              </g>
            );
          })}

        </g>{/* end pan+zoom group */}

        {/* Zoom hint — static, outside pan group */}
        <text
          x={130} y={514}
          fontSize={5.5}
          fill="rgba(255,255,255,0.18)"
          textAnchor="middle"
          pointerEvents="none"
        >
          {lang === 'ar' ? 'عجلة للتكبير · سحب للتحريك' : 'scroll to zoom · drag to pan'}
        </text>
      </svg>
    </div>
  );
}
