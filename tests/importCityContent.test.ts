import { describe, expect, it } from "vitest";
import { parseCsv, rowsToJobs, rowsToReviews } from "../scripts/import-city-content";

const CITIES = ["brampton", "mississauga"];

describe("city content import", () => {
  it("parses quoted CSV fields with commas, quotes and CRLF", () => {
    const rows = parseCsv('city,text\r\nbrampton,"Fast, clean ""work"""\r\n');
    expect(rows).toEqual([{ city: "brampton", text: 'Fast, clean "work"' }]);
  });

  const jobHeader = "city,neighbourhood,service,problem,work,year,verified\n";

  it("accepts a verified job and groups it by city", () => {
    const { byCity, problems } = rowsToJobs(
      parseCsv(`${jobHeader}Mississauga,Streetsville,Furnace install,Old furnace failed,Replaced it,2025,yes\n`),
      CITIES,
      2026
    );
    expect(problems).toEqual([]);
    expect(byCity.mississauga).toEqual([
      { neighbourhood: "Streetsville", service: "furnace-install", problem: "Old furnace failed", work: "Replaced it", year: 2025, photos: [], verified: true },
    ]);
  });

  it.each([
    ["a house number", "12 Maple Street,Furnace repair,a,b,2025,yes", /house number/],
    ["an unverified job", "Streetsville,Furnace repair,a,b,2025,no", /verified/],
    ["an unknown service", "Streetsville,Duct cleaning,a,b,2025,yes", /service/],
    ["a bad year", "Streetsville,Furnace repair,a,b,1999,yes", /year/],
    ["a missing problem", "Streetsville,Furnace repair,,b,2025,yes", /problem/],
  ])("rejects %s", (_name, row, message) => {
    const { problems } = rowsToJobs(parseCsv(`${jobHeader}brampton,${row}\n`), CITIES, 2026);
    expect(problems).toHaveLength(1);
    expect(problems[0].message).toMatch(message);
    expect(problems[0].line).toBe(2);
  });

  it("rejects a city that has no page", () => {
    const { problems } = rowsToJobs(parseCsv(`${jobHeader}Oakville,Bronte,Furnace repair,a,b,2025,yes\n`), CITIES, 2026);
    expect(problems[0].message).toMatch(/not one of/);
  });

  const reviewHeader = "city,first_name,stars,text,date,city_source\n";

  it("accepts a first-name-only review and keeps the text as written", () => {
    const { byCity, problems } = rowsToReviews(
      parseCsv(`${reviewHeader}brampton,Nav,5,"Robin was prompt, and the work looks clean.",2025-11,robin-tagged\n`),
      CITIES
    );
    expect(problems).toEqual([]);
    expect(byCity.brampton[0]).toEqual({
      firstName: "Nav",
      stars: 5,
      text: "Robin was prompt, and the work looks clean.",
      date: "2025-11",
      citySource: "robin-tagged",
    });
  });

  it.each([
    ["a surname", "Jasmeen D.,5,Great,,robin-tagged", /first name only/],
    ["no city source", "Nav,5,Great,,", /city_source/],
    ["a bad rating", "Nav,6,Great,,robin-tagged", /stars/],
    ["a bad date", "Nav,5,Great,Nov 2025,robin-tagged", /date/],
  ])("rejects %s", (_name, row, message) => {
    const { problems } = rowsToReviews(parseCsv(`${reviewHeader}brampton,${row}\n`), CITIES);
    expect(problems[0]?.message).toMatch(message);
  });
});
