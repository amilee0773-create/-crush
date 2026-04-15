export interface UserInfo {
  myGender: 'male' | 'female' | ''
  targetGender: 'male' | 'female' | ''
  relationship: 'stranger' | 'acquaintance' | 'friend' | 'flirting' | ''
  goal: 'friendship' | 'romance' | ''
}

export interface AnalysisData {
  images: string[] // base64 data URLs
  userInfo: UserInfo
}

export interface AppState {
  analysisData: AnalysisData | null
  report: string | null
}
