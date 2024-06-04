import { Ref } from "vue";
import { Game } from "../composables/games";
import { canSetScoreAnywhere, isScoresFrozen } from "./settings";
import { ROLES, useAuthStore } from "./users";

const user = useAuthStore();

export const canSetGameScore = async (game: Ref<Game>) => {
  // Check frozen score
  if (isScoresFrozen()) {
    console.log("Cannot set score, score registration is closed")
    return false;
  }
  // Check if not leader
  if (user.profile.role < ROLES.Animateur){ 
    console.log(`User ${user.uid} cannot edit game ${game.value.id} score. Insufficient role`);
    return false;
  }
  // Check if moderator
  if (user.profile.role >= ROLES.Organisateur) return true;
  // Check if global setting allow leaders to set any scores
  if (canSetScoreAnywhere()) return true;
  // Check if leader assinged to the game
  if (game.value.morningLeaders.includes(user.uid) || game.value.afternoonLeaders.includes(user.uid)){
    return true;
  } else {
    console.log(`User ${user.uid} is not registered at ${game.value.id}`);
    return false;
  }
};