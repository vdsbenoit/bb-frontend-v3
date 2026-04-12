# Configuration

This document describes the steps to reset the app and configure a new game.

⚠️ WIP ⚠️ This is a draft. I currently use this document as a specification to define how I am going to implement the setup of the app.

## Wipe previous config

The user accepts to reset the database, i.e. erasing the data from the year before.

Provide an option to keep the schedule.

## Players schedule

The user need to define how many games a player plays during the day.

Create a UI tool to add/remove games and increment/decrement the value by 2.

Info box: this settings cannot be modified later on.

| Parameter     | Description                                      | Example |
| ------------- | ------------------------------------------------ | ------- |
| `nbTimeSlots` | Number of time slots during the day. Must be odd | 17      |

`nbTimeSlots` (aka `nbGamesPerCircuit`) defines multiple things :

- The number of games a team plays during the day
- The number of games per circuit : `nbTimeSlots` - `nbBreaks`
- The number of teams per circuit : 2 x (`nbTimeSlots` - `nbBreaks`)

According to `nbGamesPerCircuit` value, create a list of time slots.

The user can edit the `start` and the `stop` value of each time slot, but cannot change the order of the time slots.

The user can add breaks and move them across the time slots. There cannot be 2 consecutive breaks.

The user can edit the name of the breaks.

## Create player groups

The user needs to create a player group category. For instance `Lutins`.

Info box : inform the user that the players only play against people from the same groups type.

The user can either <u>create new player group category</u> or <u>duplicate the settings from an existing player group category</u>.

Then, the user needs to enter a name for the group category (e.g. `Lutins`)

Then, the user can either add groups one by one or load a batch through a a csv file.

Each group must have these fields:

| Field     | Description         | Example          |
| --------- | ------------------- | ---------------- |
| City      | Ville de la section | Soignies         |
| Unit      | Unité de la section | BR015            |
| Name      | Nom de la section   | Louveteaux Férao |
| nbPlayers | Nombre d'animés     | 30               |
| nbLeaders | Nombre de chefs     | 6                |

Then, the user is invited to move 2 sliders :

| Parameter           | Description                        | Example |
| ------------------- | ---------------------------------- | ------- |
| `minPlayersPerTeam` | Minimum number of players per team | 3       |
| `maxPlayersPerTeam` | Maximum number of players per team | 12      |

According to these value, some values are computed:

- number of circuits (mentioning how many games per circuit)
- number of teams
- average number of members per team
- number of members in the biggest team
- number of members in the smaller team

Or an error if the configuration is not possible, with a hint to fix it.

Once all the groups have been defined, the user can click a button `Create teams, games & circuits`

If there is an error : explain what parameters need to be fixed and <u>re-run</u>.

If everything went through : ask if the user wants to <u>create/edit another player group category</u> -> refresh the page

Button to validate the DB.

If all the player groups have been created, <u>link to schedule setup</u>

## Attendants schedule

Button to add time slot

Each time slot has these fields:

| Field | Description                  | Example |
| ----- | ---------------------------- | ------- |
| name  | What the attendant will see. | Matin   |
| start | Begining of the time slot    | 8h00    |
| stop  | End of the time slot         | 12h00   |

By default, two time slots are set : matin and après-midi

## Game names

Select circuit. Then list all game (id + name)

The user can edit game names or import from another circuit.

Plus : create a parser to parse from a list (e.g. an excell sheet or a text document)

## Documents

### Badges

Upload base image.

Button to generate the team badges

Button to generate the staff badges

### Team roadmaps

#### 1. Prepare the templates

The user needs to create a roadmap template per circuit (A, B, C, etc)

Every template must have as many time slots as configured for the circuit.

Breaks are not supported and must be hardcoded in the template.

#### 2. Upload the templates

Upload the roadmap template for every circuit.

#### 3. Generate the roadmaps

Click button to generate the team roadmaps.

#### 4. Verify the roadmaps

Verify the roadmaps have been parsed properly (e.g. the map matches with the data, the amount of games)

### Attendant roadmaps

#### 1. Prepare the templates

The user needs to create as many roadmaps as there are variants of schedule.

Every template must have as many time slots as configured for the circuit.

Breaks are not supported and must be hardcoded in the template.

#### 2. Upload the templates

Upload the roadmap template for every circuit (according to how many time slots there is in the circuit)

#### 3. Generate the roadmaps

Click button to generate the game roadmaps.

#### 4. Verify the roadmaps

Verify the roadmaps have been parse properly (e.g. amount of time slots matches with the circuit, the part of the day matches)
