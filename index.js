// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2609-Benny";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");

    if (!response.ok) {
      throw new Error("Failed to fetch parties");
    }

    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);

    if (!response.ok) {
      throw new Error("Failed to fetch party");
    }

    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");

    if (!response.ok) {
      throw new Error("Failed to fetch RSVPs");
    }

    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");

    if (!response.ok) {
      throw new Error("Failed to fetch guests");
    }

    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Creates a new party using the API */
async function addParty(party) {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(party),
    });

    if (!response.ok) {
      throw new Error("Failed to add party");
    }

    await getParties();
  } catch (e) {
    console.error(e);
  }
}

/** Deletes a selected party using the API */
async function deleteParty(id) {
  try {
    const response = await fetch(API + "/events/" + id, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete party");
    }

    selectedParty = undefined;
    await getParties();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;

  $li.addEventListener("click", () => getParty(party.id));

  return $li;
}

/** A list of all party names */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Displays detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");

  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button type="button">Delete Party</button>
  `;

  $party.querySelector("GuestList").replaceWith(GuestList());

  const $delete = $party.querySelector("button");

  $delete.addEventListener("click", () => {
    deleteParty(selectedParty.id);
  });

  return $party;
}

/** Lists guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");

  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id,
    ),
  );

  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });

  $ul.replaceChildren(...$guests);

  return $ul;
}

/** Form for creating a new party */
function NewPartyForm() {
  const $form = document.createElement("form");

  $form.innerHTML = `
    <label>
      Name
      <input name="name" required />
    </label>

    <label>
      Description
      <input name="description" required />
    </label>

    <label>
      Date
      <input name="date" type="date" required />
    </label>

    <label>
      Location
      <input name="location" required />
    </label>

    <button type="submit">Add Party</button>
  `;

  $form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData($form);

    const date = new Date(data.get("date")).toISOString();

    const newParty = {
      name: data.get("name"),
      description: data.get("description"),
      date: date,
      location: data.get("location"),
    };

    addParty(newParty);
  });

  return $form;
}

// === Render ===

function render() {
  const $app = document.querySelector("#app");

  $app.innerHTML = `
    <h1>Party Planner</h1>

    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>

        <h3>Add a New Party</h3>
        <NewPartyForm></NewPartyForm>
      </section>

      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());

  $app.querySelector("NewPartyForm").replaceWith(NewPartyForm());

  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

// === Initialize Application ===

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
