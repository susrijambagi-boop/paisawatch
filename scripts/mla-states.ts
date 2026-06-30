// Verified MyNeta sites for the CURRENT (sitting) state legislative assembly of
// each state/UT. Only current-term elections are listed — showing a previous
// assembly's winners as "current MLAs" would be factually wrong.
//
// These cover every state/UT with a sitting assembly. The six below use the
// paginated winner_analyzed view (their show_winners page is empty).

export interface MlaState {
  site: string; // MyNeta site slug
  state: string; // display name
}

export const MLA_STATE_SITES: MlaState[] = [
  { site: "AndhraPradesh2024", state: "Andhra Pradesh" },
  { site: "ArunachalPradesh2024", state: "Arunachal Pradesh" },
  { site: "Assam2021", state: "Assam" },
  { site: "Bihar2025", state: "Bihar" },
  { site: "Chhattisgarh2023", state: "Chhattisgarh" },
  { site: "Delhi2025", state: "Delhi" },
  { site: "Haryana2024", state: "Haryana" },
  { site: "HimachalPradesh2022", state: "Himachal Pradesh" },
  { site: "Jharkhand2024", state: "Jharkhand" },
  { site: "Kerala2021", state: "Kerala" },
  { site: "MadhyaPradesh2023", state: "Madhya Pradesh" },
  { site: "Maharashtra2024", state: "Maharashtra" },
  { site: "Manipur2022", state: "Manipur" },
  { site: "Mizoram2023", state: "Mizoram" },
  { site: "Odisha2024", state: "Odisha" },
  { site: "Punjab2022", state: "Punjab" },
  { site: "Rajasthan2023", state: "Rajasthan" },
  { site: "Sikkim2024", state: "Sikkim" },
  { site: "TamilNadu2021", state: "Tamil Nadu" },
  { site: "Telangana2023", state: "Telangana" },
  { site: "UttarPradesh2022", state: "Uttar Pradesh" },
  { site: "Uttarakhand2022", state: "Uttarakhand" },
  { site: "WestBengal2021", state: "West Bengal" },
  { site: "JammuKashmir2024", state: "Jammu & Kashmir" },
  { site: "goa2022", state: "Goa" },
  { site: "gujarat2022", state: "Gujarat" },
  { site: "karnataka2023", state: "Karnataka" },
  { site: "meghalaya2023", state: "Meghalaya" },
  { site: "nagaland2023", state: "Nagaland" },
  { site: "tripura2023", state: "Tripura" },
];
