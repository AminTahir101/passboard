-- ============================================================
-- Moraje3 - Medical Licensing Exam Prep Platform
-- Migration 002: Seed Data - Sample Questions
-- ============================================================

insert into public.questions (
  question_text, option_a, option_b, option_c, option_d,
  correct_answer, justification, exam, category, topic, difficulty, status, source
) values

-- ============================================================
-- INTERNAL MEDICINE (5 questions)
-- ============================================================

(
  'A 58-year-old woman with a history of hypertension presents with a 3-day history of worsening shortness of breath, bilateral leg swelling, and orthopnea. On examination, she has an S3 gallop, elevated jugular venous pressure, and bibasilar crackles. Which of the following is the most appropriate initial management?',
  'Immediate echocardiography',
  'IV furosemide and supplemental oxygen',
  'Oral metoprolol and salt restriction',
  'Emergency coronary angiography',
  'B',
  'This presentation is consistent with acute decompensated heart failure. The priority is reducing preload with IV diuresis (furosemide) and correcting hypoxia with supplemental oxygen. Echocardiography is useful but not the first step. Beta-blockers are used in stable chronic heart failure, not in acute decompensation. Angiography is indicated only if ACS is suspected.',
  'General Medical Practice', 'Internal Medicine', 'Heart Failure', 'medium', 'published', 'Moraje3 Sample Questions'
),

(
  'A 45-year-old male with type 2 diabetes presents for a routine check-up. His HbA1c is 9.2%, blood pressure is 148/92 mmHg, and his urine albumin-to-creatinine ratio is 320 mg/g. He is currently on metformin only. Which additional medication would most benefit his renal prognosis?',
  'Amlodipine',
  'Hydrochlorothiazide',
  'An ACE inhibitor or ARB',
  'Spironolactone',
  'C',
  'Diabetic nephropathy with proteinuria (albumin-to-creatinine ratio > 300 mg/g indicates overt nephropathy) is best managed with ACE inhibitors or ARBs, which reduce intraglomerular pressure and have proven nephroprotective effects independent of blood pressure lowering. They are the first-line antihypertensive in diabetic patients with proteinuria.',
  'General Medical Practice', 'Internal Medicine', 'Diabetic Nephropathy', 'medium', 'published', 'Moraje3 Sample Questions'
),

(
  'A 32-year-old woman presents with a 6-month history of fatigue, weight gain, constipation, and cold intolerance. Physical examination reveals dry skin, periorbital puffiness, and a delayed relaxation phase of the deep tendon reflexes. Which of the following is the most likely diagnosis?',
  'Addison disease',
  'Cushing syndrome',
  'Primary hypothyroidism',
  'Hyperprolactinemia',
  'C',
  'The classic presentation of hypothyroidism includes fatigue, weight gain, cold intolerance, constipation, dry skin, and delayed relaxation of deep tendon reflexes (pseudomyotonia). Periorbital puffiness is due to accumulation of glycosaminoglycans. This is not consistent with Addison disease (weight loss, hyperpigmentation), Cushing (weight gain but different distribution), or hyperprolactinemia (amenorrhea, galactorrhea).',
  'General Medical Practice', 'Internal Medicine', 'Thyroid Disorders', 'easy', 'published', 'Moraje3 Sample Questions'
),

(
  'A 70-year-old man presents with polyuria, polydipsia, and confusion. Lab results show: serum sodium 158 mEq/L, serum osmolality 320 mOsm/kg, urine osmolality 120 mOsm/kg, and urine specific gravity 1.002. He does not respond to desmopressin (DDAVP) administration. What is the most likely diagnosis?',
  'Central diabetes insipidus',
  'Nephrogenic diabetes insipidus',
  'Primary polydipsia',
  'Syndrome of inappropriate ADH secretion (SIADH)',
  'B',
  'Nephrogenic diabetes insipidus is characterized by inability of the kidneys to concentrate urine despite adequate ADH. The key distinguishing feature from central DI is the lack of response to DDAVP. Central DI would respond to DDAVP. Primary polydipsia would show low serum osmolality. SIADH presents with hyponatremia, not hypernatremia.',
  'General Medical Practice', 'Internal Medicine', 'Fluid and Electrolytes', 'hard', 'published', 'Moraje3 Sample Questions'
),

(
  'A 50-year-old male smoker presents with a 3-month history of productive cough, progressive dyspnea on exertion, and recurrent lower respiratory tract infections. Spirometry shows FEV1/FVC ratio of 0.62 and FEV1 of 55% predicted. There is no significant reversibility after bronchodilator. What is the most appropriate long-term maintenance therapy?',
  'Short-acting beta-agonist (SABA) as needed only',
  'Oral corticosteroids',
  'Long-acting muscarinic antagonist (LAMA)',
  'Inhaled corticosteroid (ICS) monotherapy',
  'C',
  'This patient has COPD (GOLD Stage II, FEV1 50-79%) with an obstructive pattern that does not reverse with bronchodilators, distinguishing it from asthma. Per GOLD guidelines, long-acting bronchodilators (LAMA or LABA) are the cornerstone of maintenance therapy for stable COPD. ICS monotherapy is not recommended in COPD. SABAs alone are inadequate for maintenance. Oral steroids carry too many long-term adverse effects.',
  'General Medical Practice', 'Internal Medicine', 'Pulmonology', 'medium', 'published', 'Moraje3 Sample Questions'
),

-- ============================================================
-- CARDIOLOGY (3 questions)
-- ============================================================

(
  'A 65-year-old male presents with chest pain radiating to the left arm, diaphoresis, and shortness of breath for 2 hours. ECG shows ST-segment elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?',
  'Left anterior descending artery',
  'Right coronary artery',
  'Left circumflex artery',
  'Left main coronary artery',
  'B',
  'ST-segment elevation in leads II, III, and aVF indicates an inferior ST-elevation myocardial infarction (STEMI). The inferior wall of the left ventricle is supplied by the right coronary artery (RCA) in approximately 85% of individuals (right-dominant circulation). The LAD supplies the anterior wall (V1-V4 changes). The LCx supplies the lateral wall (I, aVL, V5-V6 changes).',
  'General Medical Practice', 'Cardiology', 'Acute Coronary Syndrome', 'medium', 'published', 'Moraje3 Sample Questions'
),

(
  'A 28-year-old woman is incidentally found to have a mid-systolic click followed by a late systolic murmur on routine examination. She is asymptomatic. An echocardiogram confirms billowing of the posterior mitral leaflet into the left atrium. Which of the following is the most appropriate management?',
  'Urgent mitral valve replacement',
  'Prophylactic antibiotics before all dental procedures',
  'Reassurance and periodic follow-up',
  'Initiation of anticoagulation with warfarin',
  'C',
  'This presentation is classic for mitral valve prolapse (MVP), which is common (2-3% of the population) and usually benign. Asymptomatic patients with no significant mitral regurgitation, no complex ventricular arrhythmias, and no family history of sudden death require only reassurance and periodic echocardiographic follow-up. Current guidelines no longer recommend routine antibiotic prophylaxis for MVP. Surgery and anticoagulation are not indicated in uncomplicated MVP.',
  'General Medical Practice', 'Cardiology', 'Valvular Heart Disease', 'medium', 'published', 'Moraje3 Sample Questions'
),

(
  'A 72-year-old woman is brought to the emergency department after a syncopal episode. Her ECG shows a PR interval of 320 ms, progressive lengthening of the PR interval over several beats, followed by a dropped QRS complex, and then resumption of the pattern. Which type of atrioventricular block does she have?',
  'First-degree AV block',
  'Mobitz type I (Wenckebach) second-degree AV block',
  'Mobitz type II second-degree AV block',
  'Complete (third-degree) AV block',
  'B',
  'The pattern of progressive PR interval prolongation until a P wave fails to conduct (dropped QRS) is the hallmark of Mobitz type I (Wenckebach) second-degree AV block. This is usually due to a block at the level of the AV node. First-degree block shows prolonged PR without dropped beats. Mobitz type II shows constant PR intervals with sudden dropped beats (more serious, block below AV node). Third-degree block shows complete dissociation between P waves and QRS complexes.',
  'General Medical Practice', 'Cardiology', 'Arrhythmias', 'medium', 'published', 'Moraje3 Sample Questions'
),

-- ============================================================
-- PHARMACOLOGY (3 questions)
-- ============================================================

(
  'A 60-year-old man with atrial fibrillation is started on warfarin. Two weeks later, he is prescribed fluconazole for an oral candida infection. What is the most likely pharmacokinetic interaction?',
  'Fluconazole induces CYP2C9, reducing warfarin levels',
  'Fluconazole inhibits CYP2C9, increasing warfarin levels and bleeding risk',
  'Fluconazole displaces warfarin from plasma proteins, reducing its effect',
  'Fluconazole accelerates renal excretion of warfarin',
  'B',
  'Warfarin (S-warfarin, the more potent enantiomer) is primarily metabolized by CYP2C9. Fluconazole is a potent inhibitor of CYP2C9 (and also CYP3A4). By inhibiting CYP2C9, fluconazole significantly reduces warfarin metabolism, leading to elevated plasma warfarin levels and markedly increased risk of bleeding. INR should be monitored closely and warfarin dose reduced when fluconazole is co-administered.',
  'General Medical Practice', 'Pharmacology', 'Drug Interactions', 'hard', 'published', 'Moraje3 Sample Questions'
),

(
  'A 35-year-old woman with myasthenia gravis is brought to the emergency department with severe muscle weakness, difficulty swallowing, and respiratory distress shortly after receiving a medication for an unrelated condition. Which of the following drugs is most likely responsible for worsening her myasthenia?',
  'Amoxicillin',
  'Ciprofloxacin',
  'Paracetamol (acetaminophen)',
  'Metformin',
  'B',
  'Fluoroquinolones, including ciprofloxacin, can worsen myasthenia gravis by interfering with neuromuscular transmission. They are known to inhibit presynaptic acetylcholine release and have been associated with both triggering and exacerbating myasthenic crises. Other antibiotics that can worsen MG include aminoglycosides and macrolides. Amoxicillin, paracetamol, and metformin are generally safe in MG patients.',
  'General Medical Practice', 'Pharmacology', 'Neuromuscular Pharmacology', 'hard', 'published', 'Moraje3 Sample Questions'
),

(
  'A patient with a known sulfonamide allergy asks about safety of hydrochlorothiazide. Which of the following statements best describes the cross-reactivity concern?',
  'There is absolute cross-reactivity; hydrochlorothiazide must never be used',
  'There is no concern as they are completely unrelated drug classes',
  'Cross-reactivity is possible but rare; the decision should be individualized based on the nature of the prior reaction',
  'Hydrochlorothiazide is safe because it is renally cleared, unlike sulfonamides',
  'C',
  'Hydrochlorothiazide contains a sulfonamide moiety and theoretical cross-reactivity with sulfonamide antibiotics exists. However, the clinical evidence for true immunological cross-reactivity is weak, and most patients with sulfonamide antibiotic allergy tolerate thiazides without issue. The key is to assess the nature of the original reaction (e.g., anaphylaxis vs. rash) and make an individualized clinical decision, potentially with monitored rechallenge if the benefit outweighs the risk.',
  'General Medical Practice', 'Pharmacology', 'Drug Allergy and Safety', 'medium', 'published', 'Moraje3 Sample Questions'
),

-- ============================================================
-- SURGERY (3 questions)
-- ============================================================

(
  'A 40-year-old obese woman presents with sudden-onset severe right upper quadrant pain radiating to the right shoulder, accompanied by nausea and vomiting, occurring 1 hour after a fatty meal. Her temperature is 37.2°C. Ultrasound shows multiple gallstones with no pericholecystic fluid and normal common bile duct diameter. What is the most appropriate management?',
  'Emergency laparoscopic cholecystectomy',
  'IV antibiotics and hospital admission',
  'ERCP to remove the gallstones',
  'Elective laparoscopic cholecystectomy after symptom resolution',
  'D',
  'This presentation is consistent with biliary colic (transient cystic duct obstruction by a stone, relieved by spontaneous dislodgment). There are no signs of acute cholecystitis (no fever >38°C, no pericholecystic fluid, no Murphy sign described). The appropriate management is symptomatic relief and scheduling elective laparoscopic cholecystectomy. Emergency surgery is reserved for acute cholecystitis or complications. ERCP is used for common bile duct stones (choledocholithiasis), not for gallbladder stones.',
  'General Medical Practice', 'Surgery', 'Hepatobiliary Surgery', 'medium', 'published', 'Moraje3 Sample Questions'
),

(
  'A 55-year-old man presents with sudden onset of severe tearing chest pain radiating to the back, beginning between the shoulder blades. His blood pressure is 180/100 mmHg in the right arm and 140/80 mmHg in the left arm. A chest X-ray shows widening of the mediastinum. What is the most appropriate next step?',
  'IV thrombolytics for presumed pulmonary embolism',
  'Urgent CT angiography of the chest',
  'Bedside echocardiography only',
  'Immediate coronary angiography',
  'B',
  'The presentation strongly suggests an aortic dissection: tearing/ripping pain, inter-arm blood pressure differential, and mediastinal widening on chest X-ray. Urgent CT angiography of the chest is the investigation of choice to confirm the diagnosis, define the extent of dissection, and guide management. Thrombolytics are contraindicated in aortic dissection. Echocardiography alone is insufficient. Coronary angiography would be dangerous and inappropriate as the first step.',
  'General Medical Practice', 'Surgery', 'Vascular Surgery', 'medium', 'published', 'Moraje3 Sample Questions'
),

(
  'A 25-year-old male presents with a 24-hour history of periumbilical pain that migrated to the right iliac fossa, associated with nausea and low-grade fever (38.1°C). On examination, there is rebound tenderness at McBurney''s point and a positive Rovsing''s sign. WBC is 14,500/mm³. What is the most appropriate management?',
  'Observation and oral antibiotics only',
  'Abdominal ultrasound followed by CT scan before any intervention',
  'Urgent appendicectomy (laparoscopic or open)',
  'Colonoscopy to rule out colonic pathology',
  'C',
  'This is a classic presentation of acute appendicitis with the hallmark migratory pain (periumbilical to RIF), positive McBurney''s and Rovsing''s signs, fever, and leukocytosis. The clinical picture is sufficiently clear to proceed with urgent appendicectomy without further imaging delay. While imaging may be used in atypical or equivocal cases, delaying definitive surgery for imaging in a clear-cut presentation risks perforation. Antibiotics alone are not the standard of care for straightforward acute appendicitis.',
  'General Medical Practice', 'Surgery', 'Abdominal Surgery', 'easy', 'published', 'Moraje3 Sample Questions'
),

-- ============================================================
-- PEDIATRICS (3 questions)
-- ============================================================

(
  'A 2-year-old boy is brought to the clinic with a barking cough, inspiratory stridor, and low-grade fever for 2 days. The symptoms are worse at night. He is alert and sitting upright, with mild intercostal retractions. Oxygen saturation is 97%. Which of the following is the most likely diagnosis and best initial treatment?',
  'Epiglottitis; urgent IV antibiotics and anesthesia consultation',
  'Croup (laryngotracheobronchitis); nebulized epinephrine and oral dexamethasone',
  'Bacterial tracheitis; broad-spectrum IV antibiotics',
  'Foreign body aspiration; urgent rigid bronchoscopy',
  'B',
  'The barking (seal-like) cough, inspiratory stridor, and nocturnal worsening in a toddler are pathognomonic of croup (viral laryngotracheobronchitis), most commonly caused by parainfluenza virus. Mild-to-moderate croup is managed with a single dose of oral dexamethasone (anti-inflammatory) and nebulized racemic epinephrine for significant stridor/retractions. Epiglottitis presents with the "3 Ds" (dysphagia, drooling, distress) and a toxic-appearing child sitting in a tripod position. Bacterial tracheitis is a rare, severe complication.',
  'General Medical Practice', 'Pediatrics', 'Respiratory Pediatrics', 'easy', 'published', 'Moraje3 Sample Questions'
),

(
  'A 6-week-old male infant presents with a 3-week history of progressively worsening non-bilious projectile vomiting after feeds. He appears hungry after vomiting and is losing weight. On examination, an olive-shaped mass is palpated in the epigastrium. What is the most likely diagnosis?',
  'Gastroesophageal reflux disease (GERD)',
  'Duodenal atresia',
  'Pyloric stenosis',
  'Malrotation with volvulus',
  'C',
  'Hypertrophic pyloric stenosis classically presents in first-born males aged 2-8 weeks with non-bilious (important: obstruction is proximal to the ampulla of Vater but post-pyloric distinction — actually pyloric obstruction is pre-duodenal so non-bilious) projectile vomiting, a hungry infant after vomiting, and a palpable "olive" mass in the epigastrium. GERD causes non-projectile vomiting. Duodenal atresia presents at birth with bilious vomiting and "double bubble" sign. Malrotation with volvulus presents with bilious vomiting and acute distress.',
  'General Medical Practice', 'Pediatrics', 'Neonatal Surgery', 'medium', 'published', 'Moraje3 Sample Questions'
),

(
  'A 4-year-old girl presents with a 2-day history of high fever, sore throat, and refusal to eat. Examination reveals tonsillar exudates, anterior cervical lymphadenopathy, and absence of cough. Rapid antigen detection test is positive. What is the most appropriate treatment?',
  'Supportive care with antipyretics only',
  'Azithromycin for 5 days',
  'Amoxicillin for 10 days',
  'Amoxicillin-clavulanate for 7 days',
  'C',
  'A positive rapid antigen test in the context of a classic presentation (Centor criteria: exudate, lymphadenopathy, fever, no cough) confirms Group A Streptococcal pharyngitis. First-line treatment is amoxicillin (or phenoxymethylpenicillin) for 10 days. A full 10-day course is necessary to eradicate GAS and prevent complications (rheumatic fever, glomerulonephritis). Azithromycin is reserved for penicillin-allergic patients. Amoxicillin-clavulanate is not indicated for uncomplicated GAS pharyngitis.',
  'General Medical Practice', 'Pediatrics', 'Infectious Pediatrics', 'easy', 'published', 'Moraje3 Sample Questions'
),

-- ============================================================
-- PSYCHIATRY (3 questions)
-- ============================================================

(
  'A 22-year-old university student presents with a 6-month history of recurrent episodes of intense fear, palpitations, shortness of breath, chest tightness, dizziness, and a feeling of impending doom, each lasting about 10 minutes. He has started avoiding crowded places due to fear of these attacks. Cardiac and pulmonary workup is negative. What is the most likely diagnosis?',
  'Generalized anxiety disorder',
  'Social anxiety disorder',
  'Panic disorder with agoraphobia',
  'Specific phobia',
  'C',
  'The discrete, recurrent episodes of intense fear with multiple somatic symptoms (palpitations, dyspnea, chest tightness, dizziness) peaking within minutes describe panic attacks. Panic disorder requires recurrent unexpected panic attacks with subsequent concern about further attacks or behavioral changes. The avoidance of crowded places due to fear of having attacks or being unable to escape indicates agoraphobia. GAD involves chronic, diffuse worry, not discrete attacks. Social anxiety focuses on social performance. Specific phobia is tied to a specific trigger.',
  'General Medical Practice', 'Psychiatry', 'Anxiety Disorders', 'medium', 'published', 'Moraje3 Sample Questions'
),

(
  'A 35-year-old woman is brought in by her husband after 4 days of decreased sleep (sleeping only 2-3 hours but feeling energized), increased talkativeness, racing thoughts, grandiosity (believing she has been chosen to lead a global movement), and spending large sums of money on unnecessary items. She has no prior psychiatric history and is not on any medications or substances. What is the most likely diagnosis?',
  'Schizophrenia',
  'Major depressive episode with psychotic features',
  'Bipolar I disorder, current episode manic',
  'Substance-induced mood disorder',
  'C',
  'This presentation meets criteria for a manic episode: elevated/expansive mood, decreased need for sleep, pressured speech, flight of ideas/racing thoughts, grandiosity, and impulsive behavior (spending) lasting at least one week. Bipolar I disorder is diagnosed when at least one manic episode has occurred. Schizophrenia involves psychosis predominantly without the prominent mood elevation. A depressive episode with psychosis would not explain the elevated, grandiose state. No substance use is noted.',
  'General Medical Practice', 'Psychiatry', 'Mood Disorders', 'medium', 'published', 'Moraje3 Sample Questions'
),

(
  'A 68-year-old man develops visual hallucinations (seeing small animals) and persecutory delusions 1 week after admission to a surgical ward following a hip replacement. He fluctuates between agitation and drowsiness throughout the day. Nursing staff note he was oriented on admission. His medications include morphine and a urinary catheter was placed post-operatively. What is the most likely diagnosis?',
  'Alzheimer''s dementia with behavioral symptoms',
  'Delirium',
  'Acute psychosis',
  'Bipolar disorder, manic episode',
  'B',
  'Delirium is an acute-onset, fluctuating disturbance of consciousness, attention, and cognition, typically triggered by an underlying medical cause. Key features here include: acute onset (days after surgery), fluctuating consciousness (alternating agitation/drowsiness), visual hallucinations, and a clear precipitant (post-surgical state, opioids, urinary catheter). Prior normal orientation rules against pre-existing dementia as the primary cause. Delirium is the most common psychiatric complication in hospitalized elderly patients, especially post-operatively.',
  'General Medical Practice', 'Psychiatry', 'Organic Psychiatry', 'easy', 'published', 'Moraje3 Sample Questions'
);
