import { cronJobs } from "convex/server";
import { api } from "./_generated/api";
const crons = cronJobs();


crons.interval(
    "first poem",
    {minutes: 10}, // every 10 minutes
    // {minutes: 2},
    api.myFunctions.sendPoem,
   {
    number: 1,
    from: "Shyanne Novak <noreply@autumnrockwell.net>",
    subject: "Kaleidoscope Project",
  }
);

crons.interval(
  "second poem",
  {hours: 12},
  api.myFunctions.sendPoem,
  {
    number: 2,
    from: "Shyanne Novak <noreply@autumnrockwell.net>",
    subject: "Kaleidoscope Project Update"
  }
);

crons.interval(
  "third poem",
  {hours: 28},
  api.myFunctions.sendPoem,
  {
    number: 3,
    from: "Shyanne Novak <noreply@autumnrockwell.net>",
    subject: "Kaleidoscope Project Cancelled"
  }
)


export default crons;