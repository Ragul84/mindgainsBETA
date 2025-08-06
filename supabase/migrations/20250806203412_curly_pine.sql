/*
  # MINDGAINS Database Schema

  1. Core Tables
    - `subjects` - Indian education subjects (History, Polity, Geography, etc.)
    - `subtopics` - Detailed breakdown of each subject
    - `daily_quizzes` - Daily quiz content
    - `quiz_questions` - Individual quiz questions
    - `quiz_attempts` - User quiz attempt records
    - `user_memory` - Mascot memory for personalization

  2. User System
    - Enhanced user profiles and stats
    - Achievement system
    - Leaderboard support

  3. Security
    - Row Level Security enabled on all tables
    - Proper policies for user data access
*/

-- Subjects table for Indian education
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#8b5cf6',
  subtopics_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subjects"
  ON subjects
  FOR SELECT
  TO public
  USING (is_active = true);

-- Subtopics for detailed subject breakdown
CREATE TABLE IF NOT EXISTS subtopics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subtopics"
  ON subtopics
  FOR SELECT
  TO public
  USING (is_active = true);

-- Daily quizzes
CREATE TABLE IF NOT EXISTS daily_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  questions jsonb NOT NULL,
  total_points integer DEFAULT 100,
  difficulty_mix jsonb DEFAULT '{"easy": 40, "medium": 40, "hard": 20}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily quizzes"
  ON daily_quizzes
  FOR SELECT
  TO public
  USING (true);

-- Quiz questions bank
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  subtopic_id uuid REFERENCES subtopics(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text NOT NULL,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points integer DEFAULT 10,
  source text,
  tags text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions
  FOR SELECT
  TO public
  USING (is_active = true);

-- Quiz attempts tracking
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type text NOT NULL CHECK (quiz_type IN ('daily', 'subject')),
  subject_id uuid REFERENCES subjects(id),
  subtopic_id uuid REFERENCES subtopics(id),
  questions_answered integer NOT NULL,
  correct_answers integer NOT NULL,
  total_points integer NOT NULL,
  score_percentage integer NOT NULL,
  time_spent integer NOT NULL, -- in seconds
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User memory for mascot personalization
CREATE TABLE IF NOT EXISTS user_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  subject text NOT NULL,
  proficiency_score integer DEFAULT 0 CHECK (proficiency_score >= 0 AND proficiency_score <= 100),
  attempts_count integer DEFAULT 0,
  last_correct_streak integer DEFAULT 0,
  weak_areas text[] DEFAULT '{}',
  strong_areas text[] DEFAULT '{}',
  last_interacted timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, topic)
);

ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own memory"
  ON user_memory
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mascot recommendations
CREATE TABLE IF NOT EXISTS mascot_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_text text NOT NULL,
  recommendation_type text DEFAULT 'study_tip' CHECK (recommendation_type IN ('study_tip', 'weak_area', 'streak_motivation', 'achievement_unlock')),
  subject text,
  is_read boolean DEFAULT false,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mascot_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON mascot_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON mascot_recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert Indian education subjects
INSERT INTO subjects (name, description, icon, color) VALUES
  ('History', 'Ancient, Medieval & Modern Indian History', '🏛️', '#8b5cf6'),
  ('Polity', 'Indian Constitution & Governance', '⚖️', '#3b82f6'),
  ('Geography', 'Physical & Human Geography of India', '🌍', '#10b981'),
  ('Economy', 'Indian Economy & Economic Development', '💰', '#f59e0b'),
  ('Science & Technology', 'Scientific Developments & Technology', '🔬', '#06b6d4'),
  ('Current Affairs', 'Latest Developments & News', '📰', '#ef4444'),
  ('Environment', 'Ecology & Environmental Issues', '🌱', '#22c55e'),
  ('Culture', 'Indian Art, Culture & Heritage', '🎭', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Insert subtopics for History
INSERT INTO subtopics (subject_id, name, description, difficulty) 
SELECT s.id, subtopic.name, subtopic.description, subtopic.difficulty
FROM subjects s,
(VALUES 
  ('Ancient India', 'Indus Valley, Vedic Period, Mauryas, Guptas', 'medium'),
  ('Medieval India - Delhi Sultanate', 'Slave Dynasty to Lodis', 'medium'),
  ('Medieval India - Mughals', 'Babur to Aurangzeb and decline', 'hard'),
  ('Modern India - Freedom Struggle', 'Revolt of 1857 to Independence', 'hard'),
  ('Post-Independence India', 'Integration, Development, Challenges', 'medium')
) AS subtopic(name, description, difficulty)
WHERE s.name = 'History';

-- Insert subtopics for Polity
INSERT INTO subtopics (subject_id, name, description, difficulty)
SELECT s.id, subtopic.name, subtopic.description, subtopic.difficulty
FROM subjects s,
(VALUES 
  ('Constitution Basics', 'Preamble, Features, Making', 'easy'),
  ('Fundamental Rights', 'Articles 12-35, Writs, Exceptions', 'medium'),
  ('Directive Principles', 'Articles 36-51, Implementation', 'medium'),
  ('Parliament', 'Lok Sabha, Rajya Sabha, Functions', 'hard'),
  ('Judiciary', 'Supreme Court, High Courts, Powers', 'hard'),
  ('Executive', 'President, PM, Council of Ministers', 'medium')
) AS subtopic(name, description, difficulty)
WHERE s.name = 'Polity';

-- Insert subtopics for Geography
INSERT INTO subtopics (subject_id, name, description, difficulty)
SELECT s.id, subtopic.name, subtopic.description, subtopic.difficulty
FROM subjects s,
(VALUES 
  ('Physical Features', 'Mountains, Plateaus, Plains, Coasts', 'easy'),
  ('Climate & Weather', 'Monsoons, Seasons, Regional Variations', 'medium'),
  ('Rivers & Water Resources', 'Major Rivers, Dams, Water Management', 'medium'),
  ('Natural Resources', 'Minerals, Energy, Forest Resources', 'hard'),
  ('Agriculture', 'Crops, Farming Techniques, Green Revolution', 'medium')
) AS subtopic(name, description, difficulty)
WHERE s.name = 'Geography';

-- Insert basic achievements
INSERT INTO achievements (name, description, icon, category, required_value, xp_reward, badge_color) VALUES
  ('First Quiz', 'Complete your first daily quiz', '🎯', 'learning', 1, 50, '#10b981'),
  ('Streak Starter', 'Maintain a 3-day learning streak', '🔥', 'streak', 3, 100, '#f59e0b'),
  ('Subject Explorer', 'Try quizzes from 3 different subjects', '🗺️', 'learning', 3, 150, '#8b5cf6'),
  ('Perfect Score', 'Get 100% on any quiz', '🏆', 'mastery', 1, 200, '#fbbf24'),
  ('Knowledge Seeker', 'Answer 100 questions correctly', '📚', 'learning', 100, 300, '#3b82f6'),
  ('Speed Demon', 'Complete a quiz in under 2 minutes', '⚡', 'speed', 1, 250, '#ec4899'),
  ('Consistent Learner', 'Maintain a 7-day streak', '📅', 'streak', 7, 400, '#f59e0b'),
  ('Subject Master', 'Score 90%+ in all subtopics of a subject', '👑', 'mastery', 1, 500, '#fbbf24')
ON CONFLICT (name) DO NOTHING;