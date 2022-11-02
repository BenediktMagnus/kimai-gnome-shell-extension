var Activity = class Activity
{
    /** @type {string} */
    name;
}

// HACK: Allow referencing this module in JSDoc by deluding it into thinking this was a module:
var module = {};
module.exports = { Activity };
