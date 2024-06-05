import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type AppSettings = {
  maxGameLeaders: number; // max allowed leaders per game
  freezeScore: boolean;
  everyoneCanSetScoreAnywhere: boolean;
  leaderRegistration: boolean; // true when the leader can register to games
  showRankingToAll: boolean;
  showGameAvailabilities: boolean;
}
export type RefAppSettings = Ref<VueFirestoreDocumentData<AppSettings> | undefined>

type Timing = {
  start: string;
  stop: string;
  name: string;
  isGame: boolean;
}
export type AppConfig = {
  sectionTypes: string[];
  circuits: any;
  playerTimings: Timing[];
  attendantTimings: Timing[];
}
export type RefAppConfig = Ref<VueFirestoreDocumentData<AppConfig> | undefined>
