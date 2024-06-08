import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type AppSettings = {
  maxGameLeaders: number; // max allowed leaders per game
  canSetScores: boolean;
  canSetAnyScores: boolean;
  leaderRegistration: boolean; // true when the leader can register to games
  isRankingPublic: boolean;
  showGameAvailabilities: boolean;
}
export type RefAppSettings = Ref<VueFirestoreDocumentData<AppSettings> | undefined>

type Timing = {
  start: string;
  stop: string;
  name: string;
  isGame: boolean;
  id: string;
}
export type AppConfig = {
  sectionTypes: string[];
  circuits: any;
  playerTimings: Timing[];
  attendantTimings: Timing[];
}
export type RefAppConfig = Ref<VueFirestoreDocumentData<AppConfig> | undefined>
