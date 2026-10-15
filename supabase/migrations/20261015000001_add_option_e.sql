-- ============================================================
-- Migration: Add option_e support for 5-option MCQs
-- Many medical board exams (SBIM, USMLE, MCCQE) use 5 options
-- ============================================================

-- Add option_e column (nullable since not all questions have 5 options)
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_e text;

-- Add explanation_e column
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation_e text;

-- Update correct_answer constraint to allow 'E'
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_correct_answer_check;
ALTER TABLE public.questions ADD CONSTRAINT questions_correct_answer_check
  CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E'));

-- Also update question_attempts and mock_answers to allow 'E'
ALTER TABLE public.question_attempts DROP CONSTRAINT IF EXISTS question_attempts_selected_answer_check;
ALTER TABLE public.question_attempts ADD CONSTRAINT question_attempts_selected_answer_check
  CHECK (selected_answer IN ('A', 'B', 'C', 'D', 'E'));

ALTER TABLE public.mock_answers DROP CONSTRAINT IF EXISTS mock_answers_selected_answer_check;
ALTER TABLE public.mock_answers ADD CONSTRAINT mock_answers_selected_answer_check
  CHECK (selected_answer IN ('A', 'B', 'C', 'D', 'E'));
