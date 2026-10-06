'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useAnatomyStore } from '@/store/anatomyStore';

// ── Props ─────────────────────────────────────────────────────

interface Props {
  lang: 'en' | 'ar';
  onNodeSelect: (nodeId: string) => void;
}

// ── System colours ────────────────────────────────────────────

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

// ── SVG path data constants ───────────────────────────────────

// INTEGUMENTARY — full body silhouette
// ViewBox 0 0 260 520; centre x=130
const PATH_SILHOUETTE =
  // Start at top of head, go clockwise
  'M130,10 ' +
  // Head: right side
  'C158,10 164,26 164,50 C164,74 152,88 148,91 ' +
  // Right side of neck
  'C150,95 152,100 154,103 ' +
  // Right shoulder trapezius
  'C162,104 178,106 205,108 ' +
  // Right arm outer edge down to elbow
  'C218,112 226,120 228,135 C230,148 226,162 224,178 ' +
  // Right forearm outer
  'C222,196 220,216 220,232 C220,248 221,264 222,278 ' +
  // Right hand
  'C222,285 224,292 222,300 C220,308 216,312 214,314 ' +
  'C212,316 210,316 208,314 C210,310 212,306 210,302 ' +
  'C208,304 206,308 204,310 C202,308 203,302 201,298 ' +
  'C199,302 198,308 196,308 C194,304 196,296 194,292 ' +
  'C192,296 190,302 188,302 C186,298 188,286 190,278 ' +
  // Right hip / outer thigh
  'C195,272 198,265 198,260 ' +
  'C202,248 204,238 204,228 ' +
  // Right outer thigh down
  'C205,214 206,200 205,190 C204,180 202,170 200,162 ' +
  // Right knee area
  'C198,148 198,136 196,122 ' +
  // Pull in for waist area — connect at groin
  'C197,115 197,108 198,100 C199,92 200,84 200,78 ' +
  // Redo more cleanly — using simplified path
  // RESET to a simpler, cleaner silhouette
  'Z';

// Cleaner silhouette as a single closed path
const PATH_BODY_SILHOUETTE =
  // Head (start top, clockwise)
  'M130,10 ' +
  'C152,10 164,26 164,50 C164,70 156,84 149,90 ' +
  // Right neck
  'C151,94 153,100 154,104 ' +
  // Right shoulder swell
  'C162,105 182,106 205,110 ' +
  // Right deltoid / upper arm outer — arm hangs at slight angle
  'C216,114 224,124 226,140 ' +
  // Right elbow outer
  'C228,156 226,172 224,186 ' +
  // Right forearm outer
  'C222,200 220,218 220,238 ' +
  // Right wrist/hand outer edge
  'C220,254 222,268 222,280 C222,292 220,302 218,308 ' +
  // Fingertips right (simplified)
  'C216,314 212,316 210,314 C212,308 212,302 210,298 ' +
  'C208,302 206,310 204,312 C202,308 202,298 200,294 ' +
  'C198,298 196,306 194,308 C192,304 192,294 190,288 ' +
  'C188,292 186,300 184,300 C182,294 184,282 186,272 ' +
  // Right hip outer
  'C190,262 194,254 196,244 ' +
  // Right thigh outer
  'C198,230 200,216 200,200 C200,186 198,172 196,160 ' +
  // Right knee bump
  'C194,152 192,144 193,136 ' +
  // Right shin
  'C194,122 196,110 196,100 ' +
  // Right side above hip — connect torso down to legs
  // Re-approach: let torso be wider at hip then legs separate
  // This "Z" approach won't work for separate legs; use M for each leg
  // Switching to two separate paths — see below
  'Z';

// BETTER APPROACH: Body as distinct path with leg separation
// Left and right leg outlines, torso, arms, head all in one path
// Using a figure-8 style path that handles inner leg gap

const PATH_SKIN = [
  // === TORSO + HEAD + ARMS (main silhouette) ===
  // Start at left foot inner (to trace inner leg up)
  // Actually trace the OUTER contour of entire body
  // HEAD — start at top
  'M130,12',
  // Right head
  'C153,12 165,28 165,52 C165,72 157,86 150,91',
  // Right neck
  'C152,95 154,101 155,105',
  // Right shoulder flare
  'C164,106 183,108 206,112',
  // Right outer arm down to elbow
  'C218,116 226,128 228,144 C230,160 226,176 224,190',
  // Right forearm outer to wrist
  'C222,204 220,222 220,240 C220,256 221,270 222,282',
  // Right hand — simplified 4 fingers cascade
  'C222,290 222,300 220,308 C218,314 214,316 212,314',
  'C214,308 214,302 212,298 C210,302 208,310 206,312',
  'C204,308 204,298 202,294 C200,298 198,306 196,308',
  'C194,304 194,294 192,290 C190,294 188,300 186,300',
  'C184,296 186,284 188,274',
  // Right hip outer
  'C192,264 196,254 198,244',
  // Right outer thigh
  'C200,230 202,214 202,198 C202,182 200,168 198,156',
  // Right outer knee & shin
  'C196,144 194,132 195,118 C196,106 197,96 198,88',
  // INNER right thigh — path goes inward at crotch
  'C198,104 196,116 194,124 C192,136 192,150 192,164',
  'C192,178 192,192 191,206 C190,220 188,236 186,250',
  // Right inner calf
  'C184,262 182,276 182,288 C182,296 183,304 182,310',
  // Right inner ankle & foot
  'C181,315 179,318 178,320 C172,320 168,318 164,316',
  'C160,316 156,318 155,320 C150,320 146,316 146,312',
  'C146,308 147,304 148,300',
  // Right inner leg up (between legs gap)
  'C150,290 152,276 152,262 C152,248 150,232 149,216',
  'C148,200 148,184 148,170 C148,156 149,142 150,130',
  // Crotch / pubic area
  'C150,122 148,116 138,114 C132,113 128,113 122,114',
  // Left inner thigh down
  'C112,116 111,122 110,130 C111,142 112,156 112,170',
  'C112,184 112,200 111,216 C110,232 108,248 108,262',
  'C108,276 110,290 112,300',
  // Left inner ankle & foot
  'C113,304 114,308 114,312 C114,316 110,320 105,320',
  'C102,318 98,316 95,316 C91,318 88,320 82,320',
  'C80,318 78,316 78,310',
  // Left inner calf
  'C77,304 78,296 78,288 C78,276 76,262 74,250',
  // Left outer shin
  'C72,236 70,220 69,206 C68,192 68,178 68,164',
  'C68,150 68,136 67,124 C66,116 64,106 62,96',
  // Left outer knee & thigh
  'C60,108 58,120 58,132 C58,146 60,160 62,172',
  'C64,184 65,198 64,212 C62,226 60,240 62,252',
  // Left hip outer
  'C64,258 66,266 70,272',
  // Left hand (fingers) outer
  'C72,282 74,292 74,296 C72,300 70,304 72,310',
  'C74,312 76,312 78,308 C80,298 80,294 82,298',
  'C84,304 84,308 86,308 C88,302 88,294 90,290',
  'C92,296 92,302 94,306 C96,308 98,304 98,300',
  'C98,296 98,290 98,284',
  // Left wrist inner
  'C100,270 100,256 100,240 C100,222 98,204 36,190',
  // Oops — redo left arm properly
].join(' ') + 'Z';

// ─── Use a hand-crafted, cleaner single-path silhouette ──────

const BODY_D = `
M 130 12
C 153 12 166 29 166 53
C 166 73 157 87 150 92
C 152 96 154 102 156 106
C 165 107 184 109 207 113
C 219 117 228 130 230 147
C 232 163 228 179 226 193
C 224 207 222 223 222 241
C 222 257 223 271 223 283
C 223 291 223 301 221 309
C 219 315 215 317 213 315
C 215 309 215 303 213 299
C 211 303 209 311 207 313
C 205 309 205 299 203 295
C 201 299 199 307 197 309
C 195 305 195 295 193 291
C 191 295 189 301 187 301
C 185 297 187 285 189 275
C 193 265 197 255 199 245
C 201 231 203 215 203 199
C 203 183 201 169 199 157
C 197 147 196 139 196 129
C 197 119 198 111 198 103
C 197 113 196 123 194 131
C 192 143 192 157 191 171
C 190 185 189 199 188 213
C 187 227 186 241 185 255
C 184 267 183 279 183 291
C 183 299 183 307 182 313
C 180 319 176 321 172 319
C 168 317 165 317 163 319
C 161 319 157 317 156 313
C 156 309 157 305 158 301
C 158 293 156 279 155 265
C 154 251 153 235 153 219
C 153 203 154 189 154 175
C 154 161 155 147 155 133
C 155 121 152 115 140 113
C 136 112 124 112 120 113
C 108 115 105 121 105 133
C 105 147 106 161 106 175
C 106 189 107 203 107 219
C 107 235 106 251 104 265
C 103 279 102 293 102 301
C 103 305 104 309 104 313
C 103 317 99 319 97 319
C 95 317 92 317 88 319
C 84 321 80 319 78 313
C 77 307 77 299 77 291
C 77 279 76 267 75 255
C 74 241 73 227 72 213
C 71 199 70 185 69 171
C 68 157 68 143 66 131
C 64 123 62 113 61 103
C 61 111 62 119 63 129
C 63 139 62 147 60 157
C 58 169 57 183 57 199
C 57 215 59 231 61 245
C 63 255 67 265 71 275
C 73 285 75 297 73 301
C 71 305 69 305 67 301
C 65 297 65 291 63 287
C 61 291 61 297 59 299
C 57 301 55 297 55 291
C 55 285 57 275 55 271
C 53 275 51 281 49 281
C 47 277 49 265 51 255
C 45 265 43 277 41 277
C 39 271 41 257 43 245
C 37 253 35 263 33 263
C 31 259 35 243 37 231
C 33 227 31 237 29 239
C 27 235 29 219 33 207
C 32 203 30 211 28 213
C 26 209 26 193 30 181
C 28 177 26 183 24 183
C 22 177 24 159 28 145
C 30 131 40 117 54 113
C 77 109 96 107 104 106
C 106 102 108 96 110 92
C 103 87 94 73 94 53
C 94 29 107 12 130 12
Z`;

// ── LAYER PATH DATA ───────────────────────────────────────────

// MUSCULAR layer paths
const MUSCLES_D: string[] = [
  // Sternocleidomastoid R
  'M143,92 C148,97 151,103 150,108 C148,110 145,110 143,108 C141,103 140,97 143,92 Z',
  // Sternocleidomastoid L
  'M117,92 C112,97 109,103 110,108 C112,110 115,110 117,108 C119,103 120,97 117,92 Z',
  // Right trapezius
  'M156,106 C170,110 190,114 207,115 C204,120 196,124 186,126 C175,124 163,118 158,112 Z',
  // Left trapezius
  'M104,106 C90,110 70,114 53,115 C56,120 64,124 74,126 C85,124 97,118 102,112 Z',
  // Right deltoid
  'M207,113 C218,117 226,126 228,140 C222,136 214,130 208,126 C205,122 205,117 207,113 Z',
  // Left deltoid
  'M53,113 C42,117 34,126 32,140 C38,136 46,130 52,126 C55,122 55,117 53,113 Z',
  // Right pectoralis major
  'M130,112 C140,112 150,114 158,118 C162,126 162,138 158,148 C150,152 140,152 130,148 L130,112 Z',
  // Left pectoralis major
  'M130,112 C120,112 110,114 102,118 C98,126 98,138 102,148 C110,152 120,152 130,148 L130,112 Z',
  // Serratus anterior R
  'M160,150 C170,155 174,162 174,172 C168,176 162,174 158,168 C156,162 156,154 160,150 Z',
  // Serratus anterior L
  'M100,150 C90,155 86,162 86,172 C92,176 98,174 102,168 C104,162 104,154 100,150 Z',
  // Rectus abdominis (6 segments with inscriptions)
  'M118,152 C118,162 118,172 118,182 C122,183 128,183 132,182 L132,152 C128,151 122,151 118,152 Z',
  'M118,186 C118,196 118,206 118,216 C122,217 128,217 132,216 L132,186 C128,185 122,185 118,186 Z',
  'M118,220 C118,230 118,240 118,250 C122,251 128,251 132,250 L132,220 C128,219 122,219 118,220 Z',
  // Tendinous inscriptions
  'M116,184 C120,183 126,183 134,184',
  'M116,218 C120,217 126,217 134,218',
  // External oblique R
  'M132,152 C142,153 152,158 158,168 C156,182 152,196 148,208 C140,212 134,212 132,208 Z',
  // External oblique L
  'M118,152 C108,153 98,158 92,168 C94,182 98,196 102,208 C110,212 116,212 118,208 Z',
  // Right biceps
  'M220,136 C224,148 224,162 220,174 C216,178 212,177 210,173 C210,161 212,147 216,137 Z',
  // Left biceps
  'M40,136 C36,148 36,162 40,174 C44,178 48,177 50,173 C50,161 48,147 44,137 Z',
  // Right brachioradialis/forearm
  'M218,178 C222,192 223,208 222,224 C218,228 214,227 212,222 C212,206 214,190 216,178 Z',
  // Left brachioradialis
  'M42,178 C38,192 37,208 38,224 C42,228 46,227 48,222 C48,206 46,190 44,178 Z',
  // Right quadriceps
  'M166,272 C170,286 172,302 172,318 C168,326 162,328 158,324 C156,308 156,290 158,274 Z',
  'M158,272 C160,286 160,302 158,318 C154,326 148,326 146,320 C146,304 148,286 152,272 Z',
  // Left quadriceps
  'M94,272 C90,286 88,302 88,318 C92,326 98,328 102,324 C104,308 104,290 102,274 Z',
  'M102,272 C100,286 100,302 102,318 C106,326 112,326 114,320 C114,304 112,286 108,272 Z',
  // Right tibialis anterior
  'M168,332 C170,346 170,362 168,376 C164,380 160,378 158,374 C158,360 160,344 164,332 Z',
  // Left tibialis anterior
  'M92,332 C90,346 90,362 92,376 C96,380 100,378 102,374 C102,360 100,344 96,332 Z',
  // Right gastrocnemius
  'M172,340 C178,356 178,372 174,386 C169,390 164,388 162,383 C162,368 165,350 170,338 Z',
  // Left gastrocnemius
  'M88,340 C82,356 82,372 86,386 C91,390 96,388 98,383 C98,368 95,350 90,338 Z',
];

// NERVOUS layer — brain, spinal cord, major nerves
// Drawn as strokes only
interface NervePath {
  d: string;
  strokeW?: number;
  dash?: string;
}
const NERVES: NervePath[] = [
  // Brain (rough oval inside skull)
  { d: 'M112,22 C110,32 110,44 114,52 C118,58 124,62 130,62 C136,62 142,58 146,52 C150,44 150,32 148,22 C144,16 136,14 130,14 C124,14 116,16 112,22 Z' },
  // Spinal cord
  { d: 'M130,95 L130,270', strokeW: 2 },
  // Brachial plexus R — fan from C5-T1 to arm
  { d: 'M148,107 C160,110 175,116 195,124', strokeW: 1.5 },
  { d: 'M148,110 C162,114 178,120 198,130', strokeW: 1.5 },
  { d: 'M148,113 C162,118 176,126 194,138', strokeW: 1.5 },
  // Brachial plexus L
  { d: 'M112,107 C100,110 85,116 65,124', strokeW: 1.5 },
  { d: 'M112,110 C98,114 82,120 62,130', strokeW: 1.5 },
  { d: 'M112,113 C98,118 84,126 66,138', strokeW: 1.5 },
  // Radial nerve R
  { d: 'M220,140 C222,158 220,178 216,196', strokeW: 1 },
  // Median nerve R
  { d: 'M216,150 C216,168 215,188 214,206', strokeW: 1 },
  // Ulnar nerve R
  { d: 'M212,152 C211,170 210,190 209,210', strokeW: 1 },
  // Radial nerve L
  { d: 'M40,140 C38,158 40,178 44,196', strokeW: 1 },
  // Median nerve L
  { d: 'M44,150 C44,168 45,188 46,206', strokeW: 1 },
  // Femoral nerve R (anterior thigh)
  { d: 'M166,268 C168,284 170,302 170,320', strokeW: 1.5 },
  // Femoral nerve L
  { d: 'M94,268 C92,284 90,302 90,320', strokeW: 1.5 },
  // Sciatic nerve R — dashed (posterior)
  { d: 'M168,274 C172,292 172,312 170,332 C168,350 166,366 166,382', strokeW: 2, dash: '4,3' },
  // Sciatic nerve L
  { d: 'M92,274 C88,292 88,312 90,332 C92,350 94,366 94,382', strokeW: 2, dash: '4,3' },
  // Tibial nerve R
  { d: 'M168,338 L167,390', strokeW: 1, dash: '3,2' },
  // Tibial nerve L
  { d: 'M92,338 L93,390', strokeW: 1, dash: '3,2' },
  // Common peroneal R
  { d: 'M170,330 C176,340 178,352 176,366', strokeW: 1 },
  // Common peroneal L
  { d: 'M90,330 C84,340 82,352 84,366', strokeW: 1 },
];

// CARDIOVASCULAR layer
interface VesselPath {
  d: string;
  type: 'artery' | 'vein';
  strokeW?: number;
}
const VESSELS: VesselPath[] = [
  // ── ARTERIES ───────────────────────────────────────────────
  // Heart shape (filled artery)
  { d: 'M120,148 C118,140 112,136 112,144 C112,152 120,160 130,168 C140,160 148,152 148,144 C148,136 142,140 140,148 C138,142 132,138 130,142 C128,138 122,142 120,148 Z', type: 'artery', strokeW: 1.5 },
  // Ascending aorta
  { d: 'M130,148 C128,138 128,128 130,120', type: 'artery', strokeW: 3 },
  // Aortic arch
  { d: 'M130,120 C130,112 122,108 116,110 C110,112 108,118 110,124', type: 'artery', strokeW: 3 },
  // Descending thoracic aorta
  { d: 'M110,124 C108,138 108,154 110,168 C112,182 114,196 114,210', type: 'artery', strokeW: 2.5 },
  // Abdominal aorta
  { d: 'M114,210 L126,270', type: 'artery', strokeW: 2.5 },
  // Right common iliac
  { d: 'M126,270 C132,278 144,284 152,290', type: 'artery', strokeW: 2 },
  // Left common iliac
  { d: 'M126,270 C120,278 108,284 100,290', type: 'artery', strokeW: 2 },
  // Right femoral artery
  { d: 'M152,290 C158,308 162,328 162,350 C162,370 160,390 160,410', type: 'artery', strokeW: 2 },
  // Left femoral artery
  { d: 'M100,290 C94,308 90,328 90,350 C90,370 92,390 92,410', type: 'artery', strokeW: 2 },
  // Right common carotid
  { d: 'M128,120 C138,114 144,106 144,98 C144,90 140,82 136,78', type: 'artery', strokeW: 2 },
  // Left common carotid
  { d: 'M116,118 C106,112 100,104 100,96 C100,88 104,80 108,76', type: 'artery', strokeW: 2 },
  // Right subclavian → brachial
  { d: 'M130,120 C146,118 162,116 176,116 C192,118 210,122 222,132', type: 'artery', strokeW: 2 },
  // Right brachial → radial
  { d: 'M222,132 C224,150 224,168 222,186 C220,202 218,218 218,236', type: 'artery', strokeW: 1.5 },
  // Right ulnar
  { d: 'M220,148 C220,166 219,184 218,202 C217,218 216,234 216,250', type: 'artery', strokeW: 1 },
  // Left subclavian → brachial
  { d: 'M130,120 C114,118 98,116 84,116 C68,118 50,122 38,132', type: 'artery', strokeW: 2 },
  // Left brachial → radial
  { d: 'M38,132 C36,150 36,168 38,186 C40,202 42,218 42,236', type: 'artery', strokeW: 1.5 },

  // ── VEINS ──────────────────────────────────────────────────
  // Inferior vena cava → heart
  { d: 'M130,168 L130,240', type: 'vein', strokeW: 2.5 },
  // Superior vena cava
  { d: 'M134,148 C136,136 136,124 134,116 C132,110 128,108 126,112 C124,116 124,126 126,136 L128,148', type: 'vein', strokeW: 2 },
  // Right jugular
  { d: 'M142,94 C146,100 148,108 146,116', type: 'vein', strokeW: 1.5 },
  // Left jugular
  { d: 'M118,94 C114,100 112,108 114,116', type: 'vein', strokeW: 1.5 },
  // Right femoral vein
  { d: 'M156,292 C160,310 163,330 162,352 C161,372 159,392 159,412', type: 'vein', strokeW: 1.5 },
  // Left femoral vein
  { d: 'M104,292 C100,310 97,330 98,352 C99,372 101,392 101,412', type: 'vein', strokeW: 1.5 },
  // Great saphenous vein R — medial leg
  { d: 'M158,300 C157,320 156,342 156,364 C156,386 157,404 158,420', type: 'vein', strokeW: 1, },
  // Great saphenous vein L
  { d: 'M102,300 C103,320 104,342 104,364 C104,386 103,404 102,420', type: 'vein', strokeW: 1 },
];

// LYMPHATIC layer
interface LymphElement {
  type: 'duct' | 'node' | 'vessel';
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  dash?: string;
}
const LYMPH: LymphElement[] = [
  // Thoracic duct (left side of spine, dashed)
  { type: 'duct', d: 'M122,100 C120,120 118,140 118,160 C118,180 118,200 118,220 C118,240 120,260 121,272', dash: '4,3' },
  // Right lymphatic duct (short, upper right chest)
  { type: 'duct', d: 'M138,102 C140,110 140,118 138,124', dash: '3,2' },
  // Cervical nodes bilateral
  { type: 'node', cx: 142, cy: 88 },
  { type: 'node', cx: 118, cy: 88 },
  // Axillary nodes R
  { type: 'node', cx: 196, cy: 132 },
  { type: 'node', cx: 200, cy: 140 },
  // Axillary nodes L
  { type: 'node', cx: 64, cy: 132 },
  { type: 'node', cx: 60, cy: 140 },
  // Para-aortic nodes
  { type: 'node', cx: 122, cy: 218 },
  { type: 'node', cx: 138, cy: 224 },
  { type: 'node', cx: 124, cy: 234 },
  { type: 'node', cx: 136, cy: 244 },
  // Inguinal nodes R
  { type: 'node', cx: 158, cy: 272 },
  { type: 'node', cx: 164, cy: 280 },
  // Inguinal nodes L
  { type: 'node', cx: 102, cy: 272 },
  { type: 'node', cx: 96, cy: 280 },
  // Lymph vessels connecting
  { type: 'vessel', d: 'M142,88 C148,100 196,132 196,132', dash: '3,3' },
  { type: 'vessel', d: 'M118,88 C112,100 64,132 64,132', dash: '3,3' },
  { type: 'vessel', d: 'M196,140 C188,160 166,200 158,272', dash: '3,3' },
  { type: 'vessel', d: 'M64,140 C72,160 94,200 102,272', dash: '3,3' },
];

// RESPIRATORY layer
const TRACHEA_D = 'M122,103 C120,110 120,120 120,130 C120,140 122,148 128,150 C130,151 130,151 132,150 C138,148 140,140 140,130 C140,120 140,110 138,103 C134,101 126,101 122,103 Z';
const RIGHT_BRONCHUS_D = 'M132,150 C138,152 148,152 156,156 C160,158 162,162 160,166 C154,164 144,162 136,160 L132,150 Z';
const LEFT_BRONCHUS_D = 'M128,150 C122,152 112,154 104,158 C100,162 100,166 104,168 C110,166 120,164 126,162 L128,150 Z';
const RIGHT_LUNG_D = 'M142,112 C158,114 172,124 178,140 C182,156 180,176 176,196 C172,214 164,230 156,238 C148,242 138,240 132,236 C128,232 126,222 126,208 C126,190 128,168 132,150 C136,138 140,122 142,112 Z';
const LEFT_LUNG_D = 'M118,112 C102,114 88,124 82,140 C78,158 80,178 84,198 C88,216 96,232 104,240 C112,246 122,244 128,240 C132,236 134,226 134,210 C134,192 132,170 128,152 C124,138 120,124 118,112 Z';
const DIAPHRAGM_D = 'M78,238 C90,228 112,224 130,224 C148,224 170,228 182,238 C174,248 156,252 130,252 C104,252 86,248 78,238 Z';

// DIGESTIVE layer
const ESOPHAGUS_D = 'M126,103 C125,114 124,128 124,142 C125,150 127,156 130,158 C133,156 135,150 136,142 C136,128 135,114 134,103 C131,101 129,101 126,103 Z';
const STOMACH_D = 'M98,188 C96,196 96,208 100,218 C104,226 112,230 122,232 C130,232 136,228 138,222 C140,214 138,202 132,194 C126,186 116,182 108,182 C103,182 99,184 98,188 Z';
const LIVER_D = 'M134,164 C148,162 164,166 174,174 C180,180 182,190 180,200 C178,208 170,214 162,216 C150,218 136,214 130,206 C126,200 126,190 130,182 C132,176 133,170 134,164 Z';
const GALLBLADDER_D = 'M168,200 C172,202 176,208 174,214 C172,218 167,220 163,218 C159,214 160,206 163,202 C165,200 167,199 168,200 Z';
const PANCREAS_D = 'M102,218 C112,216 124,216 136,216 C146,216 156,218 162,222 C158,228 148,230 136,230 C124,230 110,228 100,224 C98,222 100,220 102,218 Z';
const SMALL_INT_D = 'M100,232 C96,240 96,252 98,264 C102,276 110,282 118,284 C126,286 134,284 140,278 C148,270 150,256 148,242 C146,230 140,222 132,220 C120,218 104,224 100,232 Z M108,240 C110,248 114,258 120,262 C126,264 132,260 134,252 C132,244 126,238 118,238 C114,238 110,238 108,240 Z';
const LARGE_INT_D = `
M164,236 C170,240 174,250 174,262 C174,276 170,288 164,296
C158,300 150,298 144,292 C148,288 152,280 152,268 C152,258 150,248 148,242
M164,296 C162,300 158,302 154,304 C146,308 136,310 126,310
M126,310 C116,308 106,304 100,298 C94,290 92,278 94,266
C96,254 100,244 100,236 C102,230 106,228 110,228
M94,266 C90,276 88,290 92,300 C96,306 104,308 114,308
`;
const RECTUM_D = 'M120,296 C118,304 118,314 120,322 C122,328 126,332 130,332 C134,332 138,328 140,322 C142,314 142,304 140,296 C136,292 124,292 120,296 Z';

// URINARY layer
const RIGHT_KIDNEY_D = 'M156,212 C162,210 170,212 174,218 C178,224 178,234 174,240 C170,246 162,248 156,244 C150,240 148,232 148,224 C148,216 152,212 156,212 Z';
const LEFT_KIDNEY_D = 'M84,208 C78,206 70,208 66,214 C62,220 62,232 66,238 C70,244 78,246 84,242 C90,238 92,230 92,222 C92,214 88,210 84,208 Z';
const RIGHT_URETER_D = 'M154,240 C153,250 152,262 152,272 C152,278 152,284 154,290';
const LEFT_URETER_D = 'M86,238 C87,248 88,260 108,272 C109,278 109,284 109,290';
const BLADDER_D = 'M112,270 C108,274 106,282 108,290 C110,298 120,304 130,304 C140,304 150,298 152,290 C154,282 152,274 148,270 C144,266 134,264 130,264 C124,264 116,266 112,270 Z';

// SKELETAL layer — bones
const SKULL_D = 'M96,16 C92,24 90,36 92,48 C94,60 100,70 108,76 C112,78 116,80 120,82 L120,90 L140,90 L140,82 C144,80 148,78 152,76 C160,70 166,60 168,48 C170,36 168,24 164,16 C158,10 148,8 130,8 C112,8 102,10 96,16 Z';
const LEFT_EYE_SOCKET_D = 'M108,44 C106,40 110,36 116,36 C120,38 122,42 120,46 C118,48 112,48 108,44 Z';
const RIGHT_EYE_SOCKET_D = 'M152,44 C154,40 150,36 144,36 C140,38 138,42 140,46 C142,48 148,48 152,44 Z';
const NASAL_BONE_D = 'M127,50 C128,56 130,62 132,68 C131,70 129,70 128,68 C126,62 126,56 127,50 Z';
const MANDIBLE_D = 'M108,88 C108,96 114,102 122,104 C126,105 134,105 138,104 C146,102 152,96 152,88 C148,90 140,92 130,92 C120,92 112,90 108,88 Z';
// Cervical vertebrae (7)
const CERV_VERTS = Array.from({ length: 7 }, (_, i) =>
  `M124,${96 + i * 6} L136,${96 + i * 6} L136,${100 + i * 6} L124,${100 + i * 6} Z`
);
// Clavicles
const RIGHT_CLAVICLE_D = 'M130,106 C142,105 156,105 170,108 C172,110 172,112 170,114 C156,110 142,108 130,108 Z';
const LEFT_CLAVICLE_D = 'M130,106 C118,105 104,105 90,108 C88,110 88,112 90,114 C104,110 118,108 130,108 Z';
// Sternum
const STERNUM_D = 'M124,108 C122,120 121,136 121,152 C121,168 122,184 124,196 C126,198 134,198 136,196 C138,184 139,168 139,152 C139,136 138,120 136,108 C133,106 127,106 124,108 Z';
// Ribs (pairs) — simplified as curved strokes
const RIBS_R: string[] = [
  'M136,116 C148,115 162,116 170,122 C176,128 176,136 170,140',
  'M136,122 C150,121 164,122 174,130 C180,136 180,146 174,150',
  'M136,128 C150,127 166,130 176,138 C182,146 182,156 176,160',
  'M136,134 C150,135 166,138 176,148 C182,156 182,168 176,172',
  'M136,140 C150,141 164,146 172,156 C178,166 178,178 172,182',
  'M136,146 C150,149 162,154 168,164 C174,174 174,186 168,190',
  'M136,152 C148,155 158,162 162,172 C166,182 164,194 158,198',
  'M136,158 C146,162 154,170 156,180 C158,190 156,200 150,204',
  'M136,164 C144,168 150,176 150,186 C150,196 148,204 142,208',
];
const RIBS_L: string[] = [
  'M124,116 C112,115 98,116 90,122 C84,128 84,136 90,140',
  'M124,122 C110,121 96,122 86,130 C80,136 80,146 86,150',
  'M124,128 C110,127 94,130 84,138 C78,146 78,156 84,160',
  'M124,134 C110,135 94,138 84,148 C78,156 78,168 84,172',
  'M124,140 C110,141 96,146 88,156 C82,166 82,178 88,182',
  'M124,146 C110,149 98,154 92,164 C86,174 86,186 92,190',
  'M124,152 C112,155 102,162 98,172 C94,182 96,194 102,198',
  'M124,158 C114,162 106,170 104,180 C102,190 104,200 110,204',
  'M124,164 C116,168 110,176 110,186 C110,196 112,204 118,208',
];
// Thoracic & lumbar vertebrae
const THORACIC_VERTS = Array.from({ length: 12 }, (_, i) =>
  `M124,${152 + i * 8} L136,${152 + i * 8} L136,${158 + i * 8} L124,${158 + i * 8} Z`
);
const LUMBAR_VERTS = Array.from({ length: 5 }, (_, i) =>
  `M122,${252 + i * 8} L138,${252 + i * 8} L138,${258 + i * 8} L122,${258 + i * 8} Z`
);
// Pelvis
const ILIUM_R_D = 'M138,268 C148,264 160,264 166,270 C170,276 168,286 162,290 C154,294 144,292 138,286 C134,280 134,272 138,268 Z';
const ILIUM_L_D = 'M122,268 C112,264 100,264 94,270 C90,276 92,286 98,290 C106,294 116,292 122,286 C126,280 126,272 122,268 Z';
const SACRUM_D = 'M122,268 C124,276 126,284 128,290 C129,292 131,292 132,290 C134,284 136,276 138,268 C134,264 126,264 122,268 Z';
const PUBIS_D = 'M118,290 C118,296 122,300 130,300 C138,300 142,296 142,290 C138,288 122,288 118,290 Z';
// Long bones
const HUMERUS_R_D = 'M222,134 C224,152 224,172 220,190 C218,198 214,200 212,196 C210,178 210,158 212,140 C215,132 220,130 222,134 Z';
const HUMERUS_L_D = 'M38,134 C36,152 36,172 40,190 C42,198 46,200 48,196 C50,178 50,158 48,140 C45,132 40,130 38,134 Z';
const RADIUS_R_D = 'M218,196 C219,214 218,232 216,248 C214,256 210,258 208,254 C208,236 210,218 212,200 C214,196 216,194 218,196 Z';
const ULNA_R_D = 'M212,196 C212,214 212,232 212,248 C212,256 208,258 206,254 C206,236 207,218 208,200 C209,196 211,194 212,196 Z';
const RADIUS_L_D = 'M42,196 C41,214 42,232 44,248 C46,256 50,258 52,254 C52,236 50,218 48,200 C46,196 44,194 42,196 Z';
const ULNA_L_D = 'M48,196 C48,214 48,232 48,248 C48,256 52,258 54,254 C54,236 53,218 52,200 C51,196 49,194 48,196 Z';
// Hand bones (simplified)
const HAND_R_D = 'M204,254 C202,260 200,268 200,276 C200,282 204,284 208,282 C212,278 214,270 215,262 C214,256 210,252 206,252 C204,252 204,254 204,254 Z';
const HAND_L_D = 'M56,254 C58,260 60,268 60,276 C60,282 56,284 52,282 C48,278 46,270 45,262 C46,256 50,252 54,252 C56,252 56,254 56,254 Z';
// Femur R & L
const FEMUR_R_D = 'M162,292 C166,310 168,332 168,354 C168,370 166,386 164,398 C162,406 156,408 154,402 C152,388 152,366 152,346 C152,326 154,308 156,294 C158,288 160,288 162,292 Z';
const FEMUR_L_D = 'M98,292 C94,310 92,332 92,354 C92,370 94,386 96,398 C98,406 104,408 106,402 C108,388 108,366 108,346 C108,326 106,308 104,294 C102,288 100,288 98,292 Z';
// Patellae
const PATELLA_R_D = 'M156,398 C154,402 154,408 156,412 C158,414 162,414 164,412 C166,408 166,402 164,398 C162,396 158,396 156,398 Z';
const PATELLA_L_D = 'M96,398 C94,402 94,408 96,412 C98,414 102,414 104,412 C106,408 106,402 104,398 C102,396 98,396 96,398 Z';
// Tibia R & L
const TIBIA_R_D = 'M158,414 C160,432 162,452 162,470 C162,484 160,494 158,498 C156,502 152,502 150,498 C148,490 148,472 150,452 C150,432 152,416 154,412 C156,410 158,410 158,414 Z';
const TIBIA_L_D = 'M102,414 C100,432 98,452 98,470 C98,484 100,494 102,498 C104,502 108,502 110,498 C112,490 112,472 110,452 C110,432 108,416 106,412 C104,410 102,410 102,414 Z';
// Fibula R & L (thin lateral)
const FIBULA_R_D = 'M166,416 C168,434 169,454 168,472 C168,482 166,490 165,492 C163,494 161,492 162,486 C162,466 162,444 162,424 C163,418 165,414 166,416 Z';
const FIBULA_L_D = 'M94,416 C92,434 91,454 92,472 C92,482 94,490 95,492 C97,494 99,492 98,486 C98,466 98,444 98,424 C97,418 95,414 94,416 Z';
// Foot bones (simplified)
const FOOT_R_D = 'M148,498 C148,504 150,510 154,512 C158,514 164,512 168,508 C170,504 170,500 167,498 C162,496 154,496 148,498 Z';
const FOOT_L_D = 'M112,498 C112,504 110,510 106,512 C102,514 96,512 92,508 C90,504 90,500 93,498 C98,496 106,496 112,498 Z';

// ── Click region definitions ──────────────────────────────────

interface ClickRegion {
  id: string;
  labelEn: string;
  labelAr: string;
  x: number;
  y: number;
  w: number;
  h: number;
  lx?: number; // label x offset
  ly?: number; // label y offset
  side?: 'left' | 'right';
}

const CLICK_REGIONS: ClickRegion[] = [
  { id: 'FMA:9648',  labelEn: 'Thorax',         labelAr: 'الصدر',          x: 88,  y: 110, w: 84,  h: 100, lx: 220, ly: 150 },
  { id: 'FMA:7088',  labelEn: 'Heart',           labelAr: 'القلب',          x: 110, y: 140, w: 42,  h: 38,  lx: 60,  ly: 155, side: 'left' },
  { id: 'FMA:7197',  labelEn: 'Liver',           labelAr: 'الكبد',          x: 130, y: 164, w: 52,  h: 54,  lx: 218, ly: 188 },
  { id: 'FMA:7148',  labelEn: 'Stomach',         labelAr: 'المعدة',         x: 90,  y: 182, w: 52,  h: 52,  lx: 42,  ly: 198, side: 'left' },
  { id: 'FMA:50801', labelEn: 'Brain',           labelAr: 'الدماغ',         x: 96,  y: 14,  w: 68,  h: 68,  lx: 218, ly: 30  },
  { id: 'FMA:9631',  labelEn: 'Vertebral Col.',  labelAr: 'العمود الفقري',  x: 120, y: 95,  w: 20,  h: 180, lx: 220, ly: 200 },
  { id: 'FMA:7311',  labelEn: 'Left Lung',       labelAr: 'الرئة اليسرى',   x: 82,  y: 110, w: 48,  h: 130, lx: 34,  ly: 175, side: 'left' },
  { id: 'FMA:7310',  labelEn: 'Right Lung',      labelAr: 'الرئة اليمنى',  x: 130, y: 110, w: 52,  h: 130, lx: 218, ly: 168 },
  { id: 'FMA:7203',  labelEn: 'Right Kidney',    labelAr: 'الكلية اليمنى', x: 148, y: 210, w: 30,  h: 34,  lx: 218, ly: 224 },
  { id: 'FMA:7204',  labelEn: 'Left Kidney',     labelAr: 'الكلية اليسرى', x: 62,  y: 206, w: 30,  h: 36,  lx: 34,  ly: 220, side: 'left' },
  { id: 'FMA:15900', labelEn: 'Urinary Bladder', labelAr: 'المثانة البولية', x: 106, y: 264, w: 48,  h: 42,  lx: 218, ly: 282 },
];

// ── Component ─────────────────────────────────────────────────

export default function AnatomyLayerViewer({ lang, onNodeSelect }: Props) {
  const { layerVisibility, selectedNodeId, showLabels } = useAnatomyStore();

  // Pan + zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Hover state
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Pulse animation for selected node
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!selectedNodeId) { setPulse(0); return; }
    let frame = 0;
    let raf: number;
    const animate = () => {
      frame++;
      setPulse(Math.sin(frame * 0.08) * 0.5 + 0.5);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [selectedNodeId]);

  // Wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    setZoom((z) => Math.max(0.4, Math.min(5, z * factor)));
  }, []);

  // Drag pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, []);

  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  // Touch support
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  // Opacity helper — reads layerVisibility safely with new keys
  const lv = layerVisibility as unknown as Record<string, boolean>;
  const layerOp = (key: string) => (lv[key] !== false ? 1 : 0);

  // Glow filter for hover / selection
  const glowId = 'anatomy-glow';
  const pulseGlowId = 'anatomy-pulse-glow';

  return (
    <div
      className="w-full h-full relative overflow-hidden"
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
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={pulseGlowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={3 + pulse * 5} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <style>{`
            .layer-group { transition: opacity 0.35s ease; }
            .click-region { cursor: pointer; transition: opacity 0.2s; }
            .click-region:hover { opacity: 0.18 !important; }
          `}</style>
        </defs>

        {/* Pan + zoom transform group */}
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom}) translate(${130 * (1 - zoom) / zoom},${260 * (1 - zoom) / zoom})`}>

          {/* ── 1. INTEGUMENTARY ─────────────────────────────── */}
          <g
            className="layer-group"
            opacity={layerOp('integumentary')}
          >
            <path d={BODY_D} fill={C.integumentary} opacity={0.92} />
          </g>

          {/* ── 2. MUSCULAR ──────────────────────────────────── */}
          <g
            className="layer-group"
            opacity={layerOp('muscular')}
          >
            {MUSCLES_D.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={C.muscular}
                stroke={C.muscular}
                strokeWidth={0.5}
                fillOpacity={0.75}
              />
            ))}
          </g>

          {/* ── 3. NERVOUS ───────────────────────────────────── */}
          <g
            className="layer-group"
            opacity={layerOp('nervous')}
          >
            {NERVES.map((n, i) => (
              <path
                key={i}
                d={n.d}
                fill="none"
                stroke={C.nervous}
                strokeWidth={n.strokeW ?? 1}
                strokeDasharray={n.dash}
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* ── 4. CARDIOVASCULAR ────────────────────────────── */}
          <g
            className="layer-group"
            opacity={layerOp('cardiovascular')}
          >
            {VESSELS.map((v, i) => (
              <path
                key={i}
                d={v.d}
                fill={v.type === 'artery' && i === 0 ? C.cardiovascular.artery : 'none'}
                stroke={v.type === 'artery' ? C.cardiovascular.artery : C.cardiovascular.vein}
                strokeWidth={v.strokeW ?? 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.9}
              />
            ))}
          </g>

          {/* ── 5. LYMPHATIC ─────────────────────────────────── */}
          <g
            className="layer-group"
            opacity={layerOp('lymphatic')}
          >
            {LYMPH.map((el, i) => {
              if (el.type === 'node') {
                return (
                  <circle
                    key={i}
                    cx={el.cx}
                    cy={el.cy}
                    r={el.r ?? 3.5}
                    fill={C.lymphatic}
                    opacity={0.85}
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

          {/* ── 6. RESPIRATORY ───────────────────────────────── */}
          <g
            className="layer-group"
            opacity={layerOp('respiratory')}
          >
            {/* Lungs (semi-transparent fill) */}
            <path d={RIGHT_LUNG_D} fill={C.respiratory} stroke={C.respiratory} strokeWidth={1} fillOpacity={0.35} />
            <path d={LEFT_LUNG_D}  fill={C.respiratory} stroke={C.respiratory} strokeWidth={1} fillOpacity={0.35} />
            {/* Trachea */}
            <path d={TRACHEA_D}    fill={C.respiratory} stroke={C.respiratory} strokeWidth={0.8} fillOpacity={0.6} />
            {/* Bronchi */}
            <path d={RIGHT_BRONCHUS_D} fill={C.respiratory} fillOpacity={0.5} stroke={C.respiratory} strokeWidth={0.8} />
            <path d={LEFT_BRONCHUS_D}  fill={C.respiratory} fillOpacity={0.5} stroke={C.respiratory} strokeWidth={0.8} />
            {/* Diaphragm */}
            <path d={DIAPHRAGM_D}  fill={C.respiratory} fillOpacity={0.2} stroke={C.respiratory} strokeWidth={1} />
          </g>

          {/* ── 7. DIGESTIVE ─────────────────────────────────── */}
          <g
            className="layer-group"
            opacity={layerOp('digestive')}
          >
            <path d={ESOPHAGUS_D}  fill={C.digestive} fillOpacity={0.7} stroke={C.digestive} strokeWidth={0.6} />
            <path d={LIVER_D}      fill={C.digestive} fillOpacity={0.75} stroke={C.digestive} strokeWidth={0.8} />
            <path d={GALLBLADDER_D} fill="#d4a520" fillOpacity={0.8} stroke="#d4a520" strokeWidth={0.6} />
            <path d={STOMACH_D}    fill={C.digestive} fillOpacity={0.7} stroke={C.digestive} strokeWidth={0.8} />
            <path d={PANCREAS_D}   fill={C.digestive} fillOpacity={0.65} stroke={C.digestive} strokeWidth={0.6} />
            <path d={SMALL_INT_D}  fill={C.digestive} fillOpacity={0.55} stroke={C.digestive} strokeWidth={0.8} />
            <path d={LARGE_INT_D}  fill="none" stroke={C.digestive} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
            <path d={RECTUM_D}     fill={C.digestive} fillOpacity={0.7} stroke={C.digestive} strokeWidth={0.7} />
          </g>

          {/* ── 8. URINARY ───────────────────────────────────── */}
          <g
            className="layer-group"
            opacity={layerOp('urinary')}
          >
            <path d={RIGHT_KIDNEY_D} fill={C.urinary} fillOpacity={0.8} stroke={C.urinary} strokeWidth={0.8} />
            <path d={LEFT_KIDNEY_D}  fill={C.urinary} fillOpacity={0.8} stroke={C.urinary} strokeWidth={0.8} />
            <path d={RIGHT_URETER_D} fill="none" stroke={C.urinary} strokeWidth={1.5} strokeLinecap="round" />
            <path d={LEFT_URETER_D}  fill="none" stroke={C.urinary} strokeWidth={1.5} strokeLinecap="round" />
            <path d={BLADDER_D}      fill={C.urinary} fillOpacity={0.7} stroke={C.urinary} strokeWidth={0.8} />
          </g>

          {/* ── 9. SKELETAL ──────────────────────────────────── */}
          <g
            className="layer-group"
            opacity={layerOp('skeletal')}
          >
            {/* Skull */}
            <path d={SKULL_D}            fill={C.skeletal} stroke={C.skeletal} strokeWidth={0.5} fillOpacity={0.9} />
            <path d={LEFT_EYE_SOCKET_D}  fill={C.bg} />
            <path d={RIGHT_EYE_SOCKET_D} fill={C.bg} />
            <path d={NASAL_BONE_D}       fill={C.skeletal} fillOpacity={0.7} />
            <path d={MANDIBLE_D}         fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            {/* Vertebrae */}
            {CERV_VERTS.map((d, i) => (
              <path key={`cv${i}`} d={d} fill={C.skeletal} fillOpacity={0.85} />
            ))}
            {/* Clavicles */}
            <path d={RIGHT_CLAVICLE_D}   fill={C.skeletal} stroke={C.skeletal} strokeWidth={1.2} fillOpacity={0.9} />
            <path d={LEFT_CLAVICLE_D}    fill={C.skeletal} stroke={C.skeletal} strokeWidth={1.2} fillOpacity={0.9} />
            {/* Sternum */}
            <path d={STERNUM_D}          fill={C.skeletal} fillOpacity={0.9} stroke={C.skeletal} strokeWidth={0.5} />
            {/* Ribs */}
            {RIBS_R.map((d, i) => (
              <path key={`rr${i}`} d={d} fill="none" stroke={C.skeletal} strokeWidth={1} strokeLinecap="round" />
            ))}
            {RIBS_L.map((d, i) => (
              <path key={`rl${i}`} d={d} fill="none" stroke={C.skeletal} strokeWidth={1} strokeLinecap="round" />
            ))}
            {/* Thoracic vertebrae */}
            {THORACIC_VERTS.map((d, i) => (
              <path key={`tv${i}`} d={d} fill={C.skeletal} fillOpacity={0.85} />
            ))}
            {/* Lumbar vertebrae */}
            {LUMBAR_VERTS.map((d, i) => (
              <path key={`lv${i}`} d={d} fill={C.skeletal} fillOpacity={0.85} />
            ))}
            {/* Pelvis */}
            <path d={ILIUM_R_D}   fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            <path d={ILIUM_L_D}   fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            <path d={SACRUM_D}    fill={C.skeletal} fillOpacity={0.9}  stroke={C.skeletal} strokeWidth={0.5} />
            <path d={PUBIS_D}     fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            {/* Upper limb bones */}
            <path d={HUMERUS_R_D} fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            <path d={HUMERUS_L_D} fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            <path d={RADIUS_R_D}  fill={C.skeletal} fillOpacity={0.8}  stroke={C.skeletal} strokeWidth={0.4} />
            <path d={ULNA_R_D}    fill={C.skeletal} fillOpacity={0.8}  stroke={C.skeletal} strokeWidth={0.4} />
            <path d={RADIUS_L_D}  fill={C.skeletal} fillOpacity={0.8}  stroke={C.skeletal} strokeWidth={0.4} />
            <path d={ULNA_L_D}    fill={C.skeletal} fillOpacity={0.8}  stroke={C.skeletal} strokeWidth={0.4} />
            <path d={HAND_R_D}    fill={C.skeletal} fillOpacity={0.75} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={HAND_L_D}    fill={C.skeletal} fillOpacity={0.75} stroke={C.skeletal} strokeWidth={0.4} />
            {/* Lower limb bones */}
            <path d={FEMUR_R_D}   fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            <path d={FEMUR_L_D}   fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            <path d={PATELLA_R_D} fill={C.skeletal} fillOpacity={0.9} />
            <path d={PATELLA_L_D} fill={C.skeletal} fillOpacity={0.9} />
            <path d={TIBIA_R_D}   fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            <path d={TIBIA_L_D}   fill={C.skeletal} fillOpacity={0.85} stroke={C.skeletal} strokeWidth={0.5} />
            <path d={FIBULA_R_D}  fill={C.skeletal} fillOpacity={0.75} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={FIBULA_L_D}  fill={C.skeletal} fillOpacity={0.75} stroke={C.skeletal} strokeWidth={0.4} />
            <path d={FOOT_R_D}    fill={C.skeletal} fillOpacity={0.8}  stroke={C.skeletal} strokeWidth={0.5} />
            <path d={FOOT_L_D}    fill={C.skeletal} fillOpacity={0.8}  stroke={C.skeletal} strokeWidth={0.5} />
          </g>

          {/* ── CLICK REGIONS (invisible overlays) ───────────── */}
          {CLICK_REGIONS.map((r) => {
            const isSelected = selectedNodeId === r.id;
            const isHovered = hoveredId === r.id;
            return (
              <rect
                key={r.id}
                className="click-region"
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                rx={6}
                fill="white"
                opacity={isSelected ? 0.14 + pulse * 0.08 : isHovered ? 0.1 : 0}
                filter={isSelected ? `url(#${pulseGlowId})` : isHovered ? `url(#${glowId})` : undefined}
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); onNodeSelect(r.id); }}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}

          {/* ── LABELS ───────────────────────────────────────── */}
          {showLabels && CLICK_REGIONS.map((r) => {
            const lx = r.lx ?? (r.side === 'left' ? r.x - 10 : r.x + r.w + 10);
            const ly = r.ly ?? (r.y + r.h / 2);
            const cx = r.x + r.w / 2;
            const cy = r.y + r.h / 2;
            const isLeft = r.side === 'left' || (r.lx !== undefined && r.lx < 130);
            const label = lang === 'ar' ? r.labelAr : r.labelEn;

            return (
              <g key={`label-${r.id}`} pointerEvents="none" opacity={0.92}>
                {/* Leader line */}
                <line
                  x1={cx} y1={cy}
                  x2={lx} y2={ly}
                  stroke="#e2e8f0"
                  strokeWidth={0.5}
                  strokeDasharray="2,2"
                  opacity={0.5}
                />
                {/* Dot at structure */}
                <circle cx={cx} cy={cy} r={1.5} fill="#e2e8f0" opacity={0.6} />
                {/* Label text */}
                <text
                  x={lx}
                  y={ly}
                  fontSize={7}
                  fill="#e2e8f0"
                  textAnchor={isLeft ? 'end' : 'start'}
                  dominantBaseline="middle"
                  style={{ fontFamily: 'ui-monospace, monospace', letterSpacing: '0.02em' }}
                >
                  {label}
                </text>
              </g>
            );
          })}

        </g>{/* end pan+zoom group */}

        {/* ── ZOOM HINT (bottom centre, static) ────────────────── */}
        <text
          x={130}
          y={514}
          fontSize={6}
          fill="rgba(255,255,255,0.2)"
          textAnchor="middle"
          pointerEvents="none"
        >
          {lang === 'ar' ? 'عجلة للتكبير · سحب للتحريك' : 'scroll to zoom · drag to pan'}
        </text>

        {/* ── LAYER LEGEND (top-right corner, static) ──────────── */}
        {[
          { key: 'integumentary', label: lang === 'ar' ? 'جلد' : 'Skin',    color: C.integumentary },
          { key: 'muscular',      label: lang === 'ar' ? 'عضلات' : 'Muscle', color: C.muscular },
          { key: 'nervous',       label: lang === 'ar' ? 'أعصاب' : 'Nerves', color: C.nervous },
          { key: 'cardiovascular',label: lang === 'ar' ? 'أوعية' : 'Vessels',color: C.cardiovascular.artery },
          { key: 'lymphatic',     label: lang === 'ar' ? 'لمف' : 'Lymph',    color: C.lymphatic },
          { key: 'respiratory',   label: lang === 'ar' ? 'تنفس' : 'Resp.',   color: C.respiratory },
          { key: 'digestive',     label: lang === 'ar' ? 'هضم' : 'Digest.',  color: C.digestive },
          { key: 'urinary',       label: lang === 'ar' ? 'بولي' : 'Urinary', color: C.urinary },
          { key: 'skeletal',      label: lang === 'ar' ? 'عظام' : 'Bones',   color: C.skeletal },
        ].map(({ key, label, color }, i) => {
          const active = lv[key] !== false;
          return (
            <g key={key} transform={`translate(228,${18 + i * 12})`} opacity={active ? 1 : 0.3}>
              <rect x={0} y={-4} width={6} height={6} rx={1} fill={color} />
              <text x={9} y={0} fontSize={6} fill="#e2e8f0" dominantBaseline="middle">
                {label}
              </text>
            </g>
          );
        })}

      </svg>
    </div>
  );
}
