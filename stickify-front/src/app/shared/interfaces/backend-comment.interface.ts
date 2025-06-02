export interface BackendComment {
  id: string;
  trackId: number;
  user: string;  // Ensure this matches backend
  text: string;
  date: number;
}