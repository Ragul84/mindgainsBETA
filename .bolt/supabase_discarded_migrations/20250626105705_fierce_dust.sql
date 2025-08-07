-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User stats and progress
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  missions_completed integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  rank text DEFAULT 'Beginner',
  total_study_time integer DEFAULT 0, -- in minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Missions
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subject_id uuid REFERENCES subjects(id),
  content_type text CHECK (content_type IN ('youtube', 'pdf', 'text', 'camera')),
  content_url text,
  content_text text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_time integer, -- in minutes
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Learning content (AI generated)
CREATE TABLE IF NOT EXISTS learning_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  overview text,
  key_points jsonb,
  timeline jsonb,
  concepts jsonb,
  sample_answers jsonb,
  difficulty text,
  estimated_time text,
  created_at timestamptz DEFAULT now()
);

-- Mission progress through rooms
CREATE TABLE IF NOT EXISTS mission_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  room_type text NOT NULL CHECK (room_type IN ('clarity', 'quiz', 'memory', 'test')),
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score integer DEFAULT 0,
  max_score integer DEFAULT 100,
  time_spent integer DEFAULT 0, -- in seconds
  attempts integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, mission_id, room_type)
);

-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL,
  category text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  hint text,
  created_at timestamptz DEFAULT now()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Test questions
CREATE TABLE IF NOT EXISTS test_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_type text DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'short', 'long')),
  options jsonb,
  correct_answer integer,
  points integer DEFAULT 10,
  explanation text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text,
  category text NOT NULL CHECK (category IN ('learning', 'speed', 'streak', 'social', 'mastery')),
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward integer DEFAULT 50,
  criteria jsonb, -- conditions to unlock
  created_at timestamptz DEFAULT now()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  total_required integer DEFAULT 1,
  unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;

DROP POLICY IF EXISTS "Anyone can view subjects" ON subjects;
DROP POLICY IF EXISTS "Service role can manage subjects" ON subjects;

DROP POLICY IF EXISTS "Users can view own missions" ON missions;
DROP POLICY IF EXISTS "Users can create missions" ON missions;
DROP POLICY IF EXISTS "Users can update own missions" ON missions;
DROP POLICY IF EXISTS "Users can delete own missions" ON missions;

DROP POLICY IF EXISTS "Users can view content for their missions" ON learning_content;
DROP POLICY IF EXISTS "Service role can manage learning content" ON learning_content;

DROP POLICY IF EXISTS "Users can view own progress" ON mission_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON mission_progress;

DROP POLICY IF EXISTS "Users can view flashcards for their missions" ON flashcards;
DROP POLICY IF EXISTS "Service role can manage flashcards" ON flashcards;

DROP POLICY IF EXISTS "Users can view quiz questions for their missions" ON quiz_questions;
DROP POLICY IF EXISTS "Service role can manage quiz questions" ON quiz_questions;

DROP POLICY IF EXISTS "Users can view test questions for their missions" ON test_questions;
DROP POLICY IF EXISTS "Service role can manage test questions" ON test_questions;

DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
DROP POLICY IF EXISTS "Service role can manage achievements" ON achievements;

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Service role can manage user achievements" ON user_achievements;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_stats
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subjects (public read)
CREATE POLICY "Anyone can view subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage subjects"
  ON subjects FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for missions
CREATE POLICY "Users can view own missions"
  ON missions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create missions"
  ON missions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions"
  ON missions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own missions"
  ON missions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for learning_content
CREATE POLICY "Users can view content for their missions"
  ON learning_content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = learning_content.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage learning content"
  ON learning_content FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for mission_progress
CREATE POLICY "Users can view own progress"
  ON mission_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON mission_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for flashcards
CREATE POLICY "Users can view flashcards for their missions"
  ON flashcards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = flashcards.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage flashcards"
  ON flashcards FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for quiz_questions
CREATE POLICY "Users can view quiz questions for their missions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = quiz_questions.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage quiz questions"
  ON quiz_questions FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for test_questions
CREATE POLICY "Users can view test questions for their missions"
  ON test_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM missions 
      WHERE missions.id = test_questions.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage test questions"
  ON test_questions FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage achievements"
  ON achievements FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage user achievements"
  ON user_achievements FOR ALL
  TO service_role
  USING (true);

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS calculate_level(integer);
DROP FUNCTION IF EXISTS xp_for_level(integer);
DROP FUNCTION IF EXISTS update_user_xp(uuid, integer);
DROP FUNCTION IF EXISTS check_achievements(uuid);

-- Functions for XP and level calculation
CREATE OR REPLACE FUNCTION calculate_level(xp integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  RETURN GREATEST(1, FLOOR(SQRT(xp::float / 100)) + 1);
END;
$$;

CREATE OR REPLACE FUNCTION xp_for_level(level integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  -- XP needed for level: (level - 1)^2 * 100
  RETURN (level - 1) * (level - 1) * 100;
END;
$$;

-- Function to update user XP and level
CREATE OR REPLACE FUNCTION update_user_xp(p_user_id uuid, xp_to_add integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stats record;
  new_total_xp integer;
  new_level integer;
  level_up boolean := false;
BEGIN
  -- Get current user stats
  SELECT * INTO current_stats
  FROM user_stats
  WHERE user_id = p_user_id;
  
  -- If no stats exist, create them
  IF current_stats IS NULL THEN
    INSERT INTO user_stats (user_id, total_xp, current_level)
    VALUES (p_user_id, xp_to_add, calculate_level(xp_to_add))
    RETURNING * INTO current_stats;
    
    new_total_xp := xp_to_add;
    new_level := calculate_level(xp_to_add);
    level_up := new_level > 1;
  ELSE
    -- Calculate new XP and level
    new_total_xp := current_stats.total_xp + xp_to_add;
    new_level := calculate_level(new_total_xp);
    level_up := new_level > current_stats.current_level;
    
    -- Update user stats
    UPDATE user_stats
    SET 
      total_xp = new_total_xp,
      current_level = new_level,
      last_activity_date = CURRENT_DATE,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Return result
  RETURN json_build_object(
    'total_xp', new_total_xp,
    'current_level', new_level,
    'level_up', level_up,
    'xp_added', xp_to_add
  );
END;
$$;

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id uuid)
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_stats_record record;
  achievement_record record;
  unlocked_achievements json[] := '{}';
  achievement_json json;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats_record
  FROM user_stats
  WHERE user_id = p_user_id;
  
  -- Check each achievement
  FOR achievement_record IN 
    SELECT a.* FROM achievements a
    WHERE NOT EXISTS (
      SELECT 1 FROM user_achievements ua 
      WHERE ua.user_id = p_user_id 
      AND ua.achievement_id = a.id 
      AND ua.unlocked = true
    )
  LOOP
    -- Check achievement criteria (simplified)
    IF achievement_record.category = 'learning' AND user_stats_record.missions_completed >= 1 THEN
      -- Unlock achievement
      INSERT INTO user_achievements (user_id, achievement_id, unlocked, unlocked_at)
      VALUES (p_user_id, achievement_record.id, true, now())
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET unlocked = true, unlocked_at = now();
      
      achievement_json := json_build_object(
        'id', achievement_record.id,
        'title', achievement_record.title,
        'description', achievement_record.description,
        'xp_reward', achievement_record.xp_reward
      );
      
      unlocked_achievements := array_append(unlocked_achievements, achievement_json);
    END IF;
  END LOOP;
  
  RETURN unlocked_achievements;
END;
$$;

-- Insert default subjects
INSERT INTO subjects (name, description, icon, color) VALUES
  ('Mathematics', 'Numbers, equations, and problem solving', '📐', '#3b82f6'),
  ('Science', 'Physics, chemistry, biology, and more', '🔬', '#10b981'),
  ('History', 'Past events, civilizations, and timelines', '📚', '#f59e0b'),
  ('Languages', 'Communication, grammar, and literature', '🗣️', '#8b5cf6'),
  ('Arts', 'Creative expression and visual arts', '🎨', '#ec4899'),
  ('Technology', 'Computing, programming, and digital skills', '💻', '#06b6d4'),
  ('Geography', 'Earth, maps, and world cultures', '🌍', '#84cc16'),
  ('Economics', 'Money, markets, and business', '💰', '#f97316')
ON CONFLICT (name) DO NOTHING;

-- Insert default achievements
INSERT INTO achievements (title, description, icon, category, rarity, xp_reward, criteria) VALUES
  ('First Steps', 'Complete your first learning mission', '🎯', 'learning', 'common', 50, '{"missions_completed": 1}'),
  ('Speed Demon', 'Complete a mission in under 5 minutes', '⚡', 'speed', 'rare', 100, '{"fast_completion": true}'),
  ('Perfect Score', 'Get 100% on any test', '🏆', 'mastery', 'epic', 200, '{"perfect_score": true}'),
  ('Knowledge Seeker', 'Complete 10 missions', '📚', 'learning', 'rare', 150, '{"missions_completed": 10}'),
  ('Streak Master', 'Maintain a 7-day learning streak', '🔥', 'streak', 'epic', 300, '{"streak_days": 7}'),
  ('Subject Expert', 'Complete 5 missions in the same subject', '👑', 'mastery', 'legendary', 500, '{"subject_mastery": 5}')
ON CONFLICT (title) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_subject_id ON missions(subject_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_user_id ON mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_mission_id ON mission_progress(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_mission_id ON flashcards(mission_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_mission_id ON quiz_questions(mission_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_mission_id ON test_questions(mission_id);