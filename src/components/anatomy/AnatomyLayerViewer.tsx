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

// HEAD — smooth oval, slightly wider mid-cranium
const SEG_HEAD = `
  M 130 8
  C 108 8  90 25  90 52
  C  90 73 103 89 117 95
  C 121 97 126 99 130 99
  C 134 99 139 97 143 95
  C 157 89 170 73 170 52
  C 170 25 152  8 130  8 Z`;

// NECK — connects chin to shoulder line
const SEG_NECK = `
  M 118 94
  C 117 102 116 110 116 116
  L 144 116
  C 144 110 143 102 142  94
  C 138 97 134 99 130 99
  C 126 99 122 97 118 94 Z`;

// TORSO — shoulder width → waist indent → hip flare → upper thigh level
const SEG_TORSO = `
  M 116 116
  C  95 116  72 118  54 124
  C  40 129  36 140  38 154
  C  40 167  50 181  54 197
  C  57 211  57 229  57 247
  C  57 263  58 279  60 293
  C  62 304  66 315  70 325
  C  74 334  78 346  80 358
  L 180 358
  C 182 346 186 334 190 325
  C 194 315 198 304 200 293
  C 202 279 203 263 203 247
  C 203 229 203 211 206 197
  C 210 181 220 167 222 154
  C 224 140 220 129 206 124
  C 188 118 165 116 144 116 Z`;

// RIGHT ARM — natural hang, tapered from shoulder to wrist
const SEG_ARM_R = `
  M 205 124
  C 220 126 234 138 240 155
  C 245 170 244 190 240 207
  C 237 220 233 232 230 243
  C 227 251 226 258 226 264
  C 226 268 226 272 227 274
  C 228 276 230 277 232 275
  C 233 271 233 265 232 257
  C 231 245 229 232 228 218
  C 227 202 227 184 224 168
  C 221 152 213 138 204 130
  C 200 125 200 119 202 117 Z`;

// LEFT ARM — mirror of right arm
const SEG_ARM_L = `
  M  55 124
  C  40 126  26 138  20 155
  C  15 170  16 190  20 207
  C  23 220  27 232  30 243
  C  33 251  34 258  34 264
  C  34 268  34 272  33 274
  C  32 276  30 277  28 275
  C  27 271  27 265  28 257
  C  29 245  31 232  32 218
  C  33 202  33 184  36 168
  C  39 152  47 138  56 130
  C  60 125  60 119  58 117 Z`;

// RIGHT HAND — paddle shape at end of arm
const SEG_HAND_R = `
  M 225 266
  C 222 276 221 286 222 294
  C 223 300 226 304 230 302
  C 234 299 235 292 234 284
  C 233 276 230 268 226 264 Z`;

// LEFT HAND
const SEG_HAND_L = `
  M  35 266
  C  38 276  39 286  38 294
  C  37 300  34 304  30 302
  C  26 299  25 292  26 284
  C  27 276  30 268  34 264 Z`;

// RIGHT LEG — outer and inner contours
const SEG_LEG_R = `
  M 180 358
  C 183 372 183 390 181 408
  C 179 424 175 438 172 450
  C 170 460 168 470 166 480
  C 165 488 164 494 165 500
  C 166 505 169 508 174 510
  C 180 512 187 511 191 507
  C 193 503 192 496 190 490
  C 188 482 185 472 182 460
  C 179 446 178 430 178 414
  C 178 399 179 384 180 370 Z`;

// LEFT LEG — mirror
const SEG_LEG_L = `
  M  80 358
  C  77 372  77 390  79 408
  C  81 424  85 438  88 450
  C  90 460  92 470  94 480
  C  95 488  96 494  95 500
  C  94 505  91 508  86 510
  C  80 512  73 511  69 507
  C  67 503  68 496  70 490
  C  72 482  75 472  78 460
  C  81 446  82 430  82 414
  C  82 399  81 384  80 370 Z`;

// RIGHT FOOT — elongated forward
const SEG_FOOT_R = `
  M 165 500
  C 164 506 165 512 170 516
  C 175 519 183 518 189 514
  C 193 510 193 504 191 499
  C 186 503 180 505 174 505
  C 170 505 167 502 165 500 Z`;

// LEFT FOOT
const SEG_FOOT_L = `
  M  95 500
  C  96 506  95 512  90 516
  C  85 519  77 518  71 514
  C  67 510  67 504  69 499
  C  74 503  80 505  86 505
  C  90 505  93 502  95 500 Z`;

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
  ['M 155 116 C 168 118 188 122 207 126 C 204 132 194 136 182 136 C 170 133 158 127 155 120 Z', 0.75],
  // Left trapezius
  ['M 105 116 C 92 118 72 122 53 126 C 56 132 66 136 78 136 C 90 133 102 127 105 120 Z', 0.75],
  // Right deltoid
  ['M 207 122 C 220 126 232 138 234 154 C 226 147 217 140 209 133 C 206 128 204 123 207 122 Z', 0.8],
  // Left deltoid
  ['M 53 122 C 40 126 28 138 26 154 C 34 147 43 140 51 133 C 54 128 56 123 53 122 Z', 0.8],
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
  ['M 234 152 C 238 166 238 182 234 196 C 230 201 226 200 224 196 C 224 182 226 166 230 154 Z', 0.8],
  // Left biceps
  ['M  26 152 C  22 166  22 182  26 196 C  30 201  34 200  36 196 C  36 182  34 166  30 154 Z', 0.8],
  // Right forearm flexors
  ['M 232 202 C 236 218 236 236 234 252 C 230 257 226 256 224 251 C 224 234 226 216 228 202 Z', 0.7],
  // Left forearm flexors
  ['M  28 202 C  24 218  24 236  26 252 C  30 257  34 256  36 251 C  36 234  34 216  32 202 Z', 0.7],
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
  { d: 'M 236 156 C 236 176 234 196 232 216 C 231 228 230 242 229 254', w: 1 },
  // Radial nerve R (dashed — posterior)
  { d: 'M 242 160 C 242 180 238 200 234 218', w: 1, dash: '3,2' },
  // Ulnar nerve R
  { d: 'M 230 162 C 229 182 228 202 227 220 C 227 234 226 248 226 260', w: 1 },
  // Median/musculocutaneous L
  { d: 'M  24 156 C  24 176  26 196  28 216 C  29 228  30 242  31 254', w: 1 },
  // Radial nerve L
  { d: 'M  18 160 C  18 180  22 200  26 218', w: 1, dash: '3,2' },
  // Ulnar nerve L
  { d: 'M  30 162 C  31 182  32 202  33 220 C  33 234  34 248  34 260', w: 1 },
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
  { d: 'M 131 116 C 148 114 166 114 184 116 C 200 118 218 124 234 136', type: 'artery', w: 2 },
  // Right brachial → radial
  { d: 'M 234 136 C 236 156 236 176 234 196 C 233 210 231 228 230 244', type: 'artery', w: 1.5 },
  // Right ulnar
  { d: 'M 232 148 C 232 168 231 188 230 208 C 229 224 228 242 227 258', type: 'artery', w: 1 },
  // Left subclavian → brachial
  { d: 'M 113 116 C  96 114  78 114  62 116 C  46 118  28 124  16 138', type: 'artery', w: 2 },
  // Left brachial → radial
  { d: 'M  16 138 C  14 158  14 178  16 198 C  17 212  19 230  20 246', type: 'artery', w: 1.5 },
  // Left ulnar
  { d: 'M  18 150 C  18 170  19 190  20 210 C  21 226  22 244  23 260', type: 'artery', w: 1 },

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
  { d: 'M 234 140 C 236 160 236 180 234 200 C 233 216 232 232 231 248', type: 'vein', w: 1 },
  // Left cephalic
  { d: 'M  16 140 C  14 160  14 180  16 200 C  17 216  18 232  19 248', type: 'vein', w: 1 },
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
