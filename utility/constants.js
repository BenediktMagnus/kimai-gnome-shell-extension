var SettingsSchema = 'org.gnome.shell.extensions.kimai';
var SettingKeyUsername = 'username';
var SettingKeyToken = 'token';
var SettingKeyBaseUrl = 'baseurl';
var SettingKeyUpdateInterval = 'updateinterval';

// HACK: Allow referencing this module in JSDoc by deluding it into thinking this was a module:
var module = {};
module.exports = {
    SettingsSchema,
    SettingKeyUsername,
    SettingKeyToken,
    SettingKeyBaseUrl,
    SettingKeyUpdateInterval,
};
