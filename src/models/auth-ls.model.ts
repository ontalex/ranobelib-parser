export interface AuthLSModel {
  token: Token;
  auth: Auth;
  prevUrl: string;
  timestamp: number;
}

export interface Auth {
  id: number;
  username: string;
  avatar: Avatar;
  balance: number;
  gender: Gender;
  last_online_at: string;
  can_view_profile: boolean;
  can_view_statistics: boolean;
  viewable_statistics_site_ids: number[];
  can_view_previous_usernames: boolean;
  points_info: PointsInfo;
  teams: any[];
  has_paid_teams: boolean;
  rolesInTeams: any[];
  permissions: any[];
  roles: any[];
  content_keys: any[];
  metadata: Metadata;
  login_streak: LoginStreak;
  login_streak_preferences: LoginStreakPreferences;
  premium: Premium;
  card_shard_weekly_limits: CardShardWeeklyLimits;
  card_shard_daily_limits: CardShardDailyLimits;
}

export interface CardShardDailyLimits {
  type: string;
  reset_at: string;
  items: Item[];
}

export interface CardShardWeeklyLimits {
  type: string;
  reset_at: string;
  items: Item[];
}

export interface Item {
  key: string;
  label: string;
  used: number;
  limit: number;
  remaining: number;
  percent: number;
}

export interface Premium {
  enabled: boolean;
}

export interface LoginStreakPreferences {
  login_streak_light_icon_style: string;
  login_streak_dark_icon_style: string;
  login_streak_theme: string;
}

export interface LoginStreak {
  last_login_at: string;
  login_streak: number;
  max_login_streak: number;
}

export interface Metadata {
  auth_domains: AuthDomains;
}

export interface AuthDomains {
  '0': string;
  '1': string;
  '2': string;
  '3': string;
  '4': string;
  '5': string;
}

export interface PointsInfo {
  top: any;
  total_points: number;
  level: number;
  max_level_points: number;
  current_level_points: number;
  point_percent_progress: number;
}

export interface Gender {
  id: number;
  label: string;
}

export interface Avatar {
  filename: string;
  url: string;
}

export interface Token {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
  timestamp: number;
}