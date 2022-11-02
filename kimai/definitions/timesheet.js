var Timesheet = class Timesheet
{
    /** @type {number} */
    user;
    /** @type {import('./activity').Activity} */
    activity;
}

// HACK: Allow referencing this module in JSDoc by deluding it into thinking this was a module:
var module = {};
module.exports = { Timesheet };
