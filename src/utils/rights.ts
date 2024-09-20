import { ROLES } from "@/constants"
import { VueFireUserProfile } from "@/types"

export function canBeRegistered(targetUser: VueFireUserProfile) {
  if (targetUser.role === ROLES.Animateur || targetUser.role === ROLES.Chef) return true
  console.debug("The target user does not have the right role to be a leader")
  return false
}
