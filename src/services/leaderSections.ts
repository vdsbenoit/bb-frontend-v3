import { magnetar } from "./magnetar";

const LEADER_SECTIONS_COLLECTION_NAME = "leaderSections";

/////////////////////
/// configuration //
//////////////////
export type LeaderSection = {
  id: string;
  name: string;
  city: string;
  unit: string;
}

function leaderSectionsDefaults(payload: Partial<LeaderSection>): LeaderSection {
  const defaults: LeaderSection = { 
    id: "",
    name: "",
    city: "",
    unit: "",
  }
  return { ...defaults, ...payload }
}
const leaderSectionsModule = magnetar.collection<LeaderSection>(LEADER_SECTIONS_COLLECTION_NAME, {
  modifyPayloadOn: { insert: (payload) => leaderSectionsDefaults(payload) },
  modifyReadResponseOn: { added: (payload) => leaderSectionsDefaults(payload) },
});

///////////////
/// Getters //
/////////////

export const getLeaderSections = () => {
  leaderSectionsModule.stream().catch((error) => { // using stream because the fetch() method is bugged
    console.error(`Error occurred while streaming the ${LEADER_SECTIONS_COLLECTION_NAME} collection`, error);
  }); 
  return leaderSectionsModule.data;
}
// This method opens a stream on the game to get live updates
export const getLeaderSection = (id: string) => {
  if(!id) return undefined;
  const leaderSectionModule = leaderSectionsModule.doc(id);
  leaderSectionModule.stream().catch((error) => {
    console.error(`Leader Section ${id} stream was closed due to an error`, error);
  });
  return leaderSectionModule.data;
}
export const getStaffSectionId = async () => {
  const staffSection = leaderSectionsModule.where("name", "==", "Team BB");
  await staffSection.fetch().catch((error) => {
    console.error(`Staff section could not be fetched`, error);
  });
  return [...staffSection.data.values()][0].id;
}


///////////////
/// Setters //
/////////////

