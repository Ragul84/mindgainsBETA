/*
  # User Progress and Analytics Schema

  1. New Tables
    - `user_stats` - Overall user statistics and XP tracking
    - `user_progress` - Individual mission/room progress tracking
    - `user_achievements` - Achievement system
    - `user_subscriptions` - Subscription management
    - `user_milestones` - Analytics and milestone tracking
    - `youtube_metadata` - YouTube video metadata cache

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- User Statistics Table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  missions_completed integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id text NOT NULL,
  room_type text NOT NULL CHECK (room_type IN ('clarity', 'quiz', 'memory', 'test')),
  correct_answers integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  time_spent integer DEFAULT 0, -- in seconds
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_gained integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  achievement_title text,
  achievement_description text,
  achievement_icon text,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type text NOT NULL,
  amount decimal(10,2),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Milestones Table (for analytics)
CREATE TABLE IF NOT EXISTS user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  milestone_data jsonb,
  achieved_at timestamptz DEFAULT now()
);

-- YouTube Metadata Cache Table
CREATE TABLE IF NOT EXISTS youtube_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text UNIQUE NOT NULL,
  title text,
  description text,
  duration integer, -- in seconds
  thumbnail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats
CREATE POLICY "Users can read own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_progress
CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for user_milestones
CREATE POLICY "Users can read own milestones"
  ON user_milestones
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert milestones"
  ON user_milestones
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policies for youtube_metadata (public read)
CREATE POLICY "Anyone can read youtube metadata"
  ON youtube_metadata
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage youtube metadata"
  ON youtube_metadata
  FOR ALL
  TO service_role
  USING (true);

-- Function to update user XP and level
CREATE OR REPLACE FUNCTION update_user_xp(user_id uuid, xp_to_add integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stats record;
  new_total_xp integer;
  new_level integer;
BEGIN
  -- Get current user stats
  SELECT * INTO current_stats
  FROM user_stats
  WHERE user_stats.user_id = update_user_xp.user_id;
  
  -- Calculate new XP and level
  new_total_xp := COALESCE(current_stats.total_xp, 0) + xp_to_add;
  new_level := GREATEST(1, FLOOR(new_total_xp / 1000) + 1);
  
  -- Update or insert user stats
  INSERT INTO user_stats (user_id, total_xp, current_level, last_activity_date, updated_at)
  VALUES (update_user_xp.user_id, new_total_xp, new_level, CURRENT_DATE, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_xp = new_total_xp,
    current_level = new_level,
    last_activity_date = CURRENT_DATE,
    updated_at = now();
    
  RETURN new_total_xp;
END;
$$;

-- Function to update mission completion count
CREATE OR REPLACE FUNCTION increment_missions_completed(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_stats (user_id, missions_completed, last_activity_date, updated_at)
  VALUES (increment_missions_completed.user_id, 1, CURRENT_DATE, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    missions_completed = user_stats.missions_completed + 1,
    last_activity_date = CURRENT_DATE,
    updated_at = now();
END;
$$;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stats record;
  new_streak integer;
BEGIN
  SELECT * INTO current_stats
  FROM user_stats
  WHERE user_stats.user_id = update_user_streak.user_id;
  
  -- Calculate new streak
  IF current_stats.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
    new_streak := COALESCE(current_stats.streak_days, 0) + 1;
  ELSIF current_stats.last_activity_date = CURRENT_DATE THEN
    new_streak := COALESCE(current_stats.streak_days, 1);
  ELSE
    new_streak := 1;
  END IF;
  
  -- Update user stats
  INSERT INTO user_stats (user_id, streak_days, last_activity_date, updated_at)
  VALUES (update_user_streak.user_id, new_streak, CURRENT_DATE, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    streak_days = new_streak,
    last_activity_date = CURRENT_DATE,
    updated_at = now();
    
  RETURN new_streak;
END;
$$;