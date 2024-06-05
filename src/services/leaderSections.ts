import { magnetar } from "./magnetar";

const LEADER_SECTIONS_COLLECTION_NAME = "leaderSections";
const STAFF_SECTION_NAME = "Team BB";

/////////////////////
/// configuration //
//////////////////
type LeaderSection = {
  id: number;
  name: string;
  city: string;
  unit: string;
}

function leaderSectionsDefaults(payload: Partial<LeaderSection>): LeaderSection {
  const defaults: LeaderSection = { 
    id: -1,
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

// including the Staff BB
const getAllLeaderSections = () => {
  leaderSectionsModule.stream().catch((error) => { // using stream because the fetch() method is bugged
    console.error(`Error occurred while streaming the ${LEADER_SECTIONS_COLLECTION_NAME} collection`, error);
  }); 
  return leaderSectionsModule.data;
}
const getLeaderSections = () => {
  leaderSectionsModule.where("name", "!=", STAFF_SECTION_NAME).stream().catch((error) => { // using stream because the fetch() method is bugged
    console.error(`Error occurred while streaming the ${LEADER_SECTIONS_COLLECTION_NAME} collection`, error);
  }); 
  return leaderSectionsModule.data;
}
// This method opens a stream on the leaderSections to get live updates
const streamLeaderSection = (id: number) => {
  if(!id) return undefined;
  const leaderSectionModule = leaderSectionsModule.doc(id.toString());
  leaderSectionModule.stream().catch((error) => {
    console.error(`Leader Section ${id} stream was closed due to an error`, error);
  });
  return leaderSectionModule.data;
}
const getStaffSectionId = async () => {
  const staffSection = leaderSectionsModule.where("name", "==", STAFF_SECTION_NAME);
  await staffSection.fetch().catch((error) => {
    console.error(`Staff section could not be fetched`, error);
  });
  return [...staffSection.data.values()][0].id;
}


///////////////
/// Setters //
/////////////

// fixme
const hardcodeLeaderSections = () => {
  const leaderSections = [
    {name: STAFF_SECTION_NAME, city: "Soignies", id: 0, unit: ""},
    {name: "Pionniers Peter Pan", city: "Soignies", id: 0, unit: ""},
    {name: "Scouts Griffons", city: "Soignies", id: 0, unit: ""},
    {name: "Scouts Phénix", city: "Soignies", id: 0, unit: ""},
    {name: "Guides Amazones", city: "Soignies", id: 0, unit: ""},
    {name: "Guides Chamans", city: "Soignies", id: 0, unit: ""},
    {name: "Pionniers d'Ecaussinnes", city: "Ecaussinnes", id: 0, unit: ""},
    {name: "Pionniers de Braine-le-Comte", city: "Braine-le-Comte", id: 0, unit: ""},
    {name: "Scouts de Rebecq", city: "Rebecq", id: 0, unit: ""},
    {name: "Guides de Rebecq", city: "Rebecq", id: 0, unit: ""},
  ]
  leaderSections.forEach(async (leaderSection) => {
    // generate unique numeric id
    leaderSection.id = Math.floor(Math.random() * 10e12)
    leaderSectionsModule.doc(leaderSection.id.toString()).insert(leaderSection);
  });
}
// hardcodeLeaderSections();