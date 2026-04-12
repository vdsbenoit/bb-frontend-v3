export interface ResetAppRequest {
  version: 1
  gamesAndPlayers: boolean
  registrations: boolean
  attendantGroups: boolean
  staffGroups: boolean
  allUsers: boolean
}

export interface ResetAppResponse {
  accepted: true
  simulated: true
  jobId: string
  message: string
}

interface ResetRequestOptions {
  shouldFail?: boolean
  delayMs?: number
}

function wait(delayMs: number) {
  return new Promise(resolve => setTimeout(resolve, delayMs))
}

/**
 * Mocked API call for reset flow.
 * Replace this with real HTTP request when backend endpoint is available.
 */
export async function requestAppReset(
  payload: ResetAppRequest,
  options: ResetRequestOptions = {},
): Promise<ResetAppResponse> {
  const delayMs = options.delayMs ?? 900
  await wait(delayMs)

  if (options.shouldFail) {
    throw new Error('Erreur simulée: impossible de supprimer les données')
  }

  return {
    accepted: true,
    simulated: true,
    jobId: `mock-reset-${Date.now()}`,
    message: `Suppression simulée`,
  }
}
